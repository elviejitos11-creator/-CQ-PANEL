const express = require("express");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString("hex");

app.use(cors());
app.use(express.json());

// ===============================
// BASE DE DATOS
// ===============================

const db = new Database("cq-panel.db");

db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    license_expires TEXT,
    device_id TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    icon TEXT DEFAULT 'ðŸ”—',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
`);

// ===============================
// CREAR ADMINISTRADOR INICIAL
// ===============================

const adminExists = db
    .prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
    .get();

if (!adminExists) {
    const temporaryPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString("base64url");
    const passwordHash = bcrypt.hashSync(temporaryPassword, 12);

    db.prepare(`
        INSERT INTO users
        (username, password_hash, role, license_expires, active)
        VALUES (?, ?, 'admin', NULL, 1)
    `).run(process.env.ADMIN_USER || "CQ", passwordHash);

    console.log("");
    console.log("======================================");
    console.log(" ADMINISTRADOR CQ CREADO");
    console.log(" Usuario:", process.env.ADMIN_USER || "CQ");
    console.log(" ContraseÃ±a temporal:", temporaryPassword);
    console.log(" GUARDA ESTA CONTRASEÃ‘A.");
    console.log("======================================");
    console.log("");
}

// ===============================
// LOGIN
// ===============================

app.post("/api/login", (req, res) => {
    try {
        const { username, password, deviceId } = req.body;

        if (!username || !password || !deviceId) {
            return res.status(400).json({
                error: "Faltan datos de inicio de sesiÃ³n."
            });
        }

        const user = db.prepare(
            "SELECT * FROM users WHERE username = ?"
        ).get(username);

        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
            return res.status(401).json({
                error: "Usuario o contraseÃ±a incorrectos."
            });
        }

        if (!user.active) {
            return res.status(403).json({
                error: "Esta cuenta estÃ¡ bloqueada."
            });
        }

        if (
            user.role !== "admin" &&
            user.license_expires &&
            new Date(user.license_expires) <= new Date()
        ) {
            return res.status(403).json({
                error: "La licencia ha vencido."
            });
        }

        if (user.role === 'admin') {
            // ADMIN sin bloqueo de dispositivo
        } else if (!user.device_id) {
            db.prepare(
                "UPDATE users SET device_id = ? WHERE id = ?"
            ).run(deviceId, user.id);
        } else if (user.device_id !== deviceId) {
            return res.status(403).json({
                error: "Esta licencia ya estÃ¡ vinculada a otro dispositivo."
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: "12h" }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                licenseExpires: user.license_expires
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error del servidor." });
    }
});

// ===============================
// PROTECCIÃ“N DE RUTAS
// ===============================

function auth(req, res, next) {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Acceso no autorizado." });
    }

    try {
        const token = authorization.substring(7);
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (error) { console.error("JWT ERROR:", error.message); res.status(401).json({ error: "Sesion invalida: " + error.message }); }
}

function adminOnly(req, res, next) {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            error: "Solo el administrador puede hacer esto."
        });
    }

    next();
}

// ===============================
// CREAR USUARIO + LICENCIA
// ===============================

app.post("/api/admin/users", auth, adminOnly, (req, res) => {
    try {
        const { username, password, days } = req.body;

        if (!username || !password || !days) {
            return res.status(400).json({
                error: "Usuario, contraseÃ±a y dÃ­as son obligatorios."
            });
        }

        const licenseDays = Number(days);

        if (!Number.isInteger(licenseDays) || licenseDays < 1) {
            return res.status(400).json({
                error: "Los dÃ­as de licencia no son vÃ¡lidos."
            });
        }

        const expiration = new Date();
        expiration.setDate(expiration.getDate() + licenseDays);

        const passwordHash = bcrypt.hashSync(password, 12);

        const result = db.prepare(`
            INSERT INTO users
            (username, password_hash, role, license_expires, active)
            VALUES (?, ?, 'user', ?, 1)
        `).run(
            username,
            passwordHash,
            expiration.toISOString()
        );

        res.json({
            success: true,
            id: result.lastInsertRowid,
            username,
            licenseExpires: expiration.toISOString()
        });

    } catch (error) {
        if (String(error.message).includes("UNIQUE")) {
            return res.status(409).json({
                error: "Ese usuario ya existe."
            });
        }

        console.error(error);
        res.status(500).json({ error: "No se pudo crear el usuario." });
    }
});

// ===============================
// LISTAR USUARIOS
// ===============================

app.get("/api/admin/users", auth, adminOnly, (req, res) => {
    const users = db.prepare(`
        SELECT
            id,
            username,
            role,
            license_expires,
            device_id,
            active,
            created_at
        FROM users
        ORDER BY id DESC
    `).all();

    res.json(users);
});

// ===============================
// LIBERAR DISPOSITIVO
// ===============================

app.post("/api/admin/users/:id/reset-device", auth, adminOnly, (req, res) => {
    db.prepare(`
        UPDATE users
        SET device_id = NULL
        WHERE id = ? AND role != 'admin'
    `).run(req.params.id);

    res.json({ success: true });
});

// ===============================
// ACTIVAR / BLOQUEAR USUARIO
// ===============================

app.post("/api/admin/users/:id/status", auth, adminOnly, (req, res) => {
    const active = req.body.active ? 1 : 0;

    db.prepare(`
        UPDATE users
        SET active = ?
        WHERE id = ? AND role != 'admin'
    `).run(active, req.params.id);

    res.json({ success: true });
});

// ===============================
// ENLACES PRIVADOS DE CADA USUARIO
// ===============================

app.get("/api/links", auth, (req, res) => {
    const links = db.prepare(`
        SELECT id, name, url, category, icon, created_at
        FROM links
        WHERE user_id = ?
        ORDER BY id DESC
    `).all(req.user.id);

    res.json(links);
});

app.post("/api/links", auth, (req, res) => {
    const { name, url, category, icon } = req.body;

    if (!name || !url) {
        return res.status(400).json({
            error: "Nombre y enlace son obligatorios."
        });
    }

    const result = db.prepare(`
        INSERT INTO links
        (user_id, name, url, category, icon)
        VALUES (?, ?, ?, ?, ?)
    `).run(
        req.user.id,
        name,
        url,
        category || "General",
        icon || "ðŸ”—"
    );

    res.json({
        success: true,
        id: result.lastInsertRowid
    });
});

app.delete("/api/links/:id", auth, (req, res) => {
    db.prepare(`
        DELETE FROM links
        WHERE id = ? AND user_id = ?
    `).run(req.params.id, req.user.id);

    res.json({ success: true });
});


// ===== CONTROLES ADMIN DE CLIENTES =====

// Cambiar nombre de usuario
app.patch('/api/admin/users/:id/username', auth, adminOnly, (req, res) => {
  const username = String(req.body.username || '').trim()

  if (username.length < 3) {
    return res.status(400).json({ error: 'Usuario demasiado corto.' })
  }

  const user = db.prepare(
    `SELECT id, role FROM users WHERE id = ?`
  ).get(req.params.id)

  if (!user || user.role === 'admin') {
    return res.status(403).json({ error: 'No se puede modificar el administrador.' })
  }

  try {
    db.prepare(`
      UPDATE users
      SET username = ?
      WHERE id = ? AND role != 'admin'
    `).run(username, req.params.id)

    res.json({ success: true })
  } catch {
    res.status(400).json({ error: 'Ese nombre de usuario ya existe.' })
  }
})

// Cambiar contraseña
app.patch('/api/admin/users/:id/password', auth, adminOnly, (req, res) => {
  const password = String(req.body.password || '')

  if (password.length < 4) {
    return res.status(400).json({ error: 'La contraseña es demasiado corta.' })
  }

  const user = db.prepare(
    `SELECT id, role FROM users WHERE id = ?`
  ).get(req.params.id)

  if (!user || user.role === 'admin') {
    return res.status(403).json({ error: 'No se puede modificar el administrador.' })
  }

  const passwordHash = bcrypt.hashSync(password, 12)

  db.prepare(`
    UPDATE users
    SET password_hash = ?
    WHERE id = ? AND role != 'admin'
  `).run(passwordHash, req.params.id)

  res.json({ success: true })
})

// Eliminar cliente
app.delete('/api/admin/users/:id', auth, adminOnly, (req, res) => {
  const user = db.prepare(
    `SELECT id, role FROM users WHERE id = ?`
  ).get(req.params.id)

  if (!user || user.role === 'admin') {
    return res.status(403).json({ error: 'No se puede eliminar el administrador.' })
  }

  db.prepare(`DELETE FROM links WHERE user_id = ?`).run(req.params.id)
  db.prepare(`DELETE FROM users WHERE id = ? AND role != 'admin'`).run(req.params.id)

  res.json({ success: true })
})

// ===============================
// SERVIDOR
// ===============================

app.get("/api/status", (req, res) => {
    res.json({
        online: true,
        name: "CQ PANEL"
    });
});


const distPath = path.join(__dirname, "dist");

app.use(express.static(distPath));

app.get("/", (req, res) => {
    res.sendFile(path.join(distPath, "login.html"));
});

app.get("/login.html", (req, res) => {
    res.sendFile(path.join(distPath, "login.html"));
});

app.get("/admin.html", (req, res) => {
    res.sendFile(path.join(distPath, "admin.html"));
});

app.listen(PORT, () => {
    console.log("");
    console.log(`CQ PANEL funcionando en http://localhost:${PORT}`);
    console.log("");
});





