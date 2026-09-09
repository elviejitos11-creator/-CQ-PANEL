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
app.use(express.json({ limit: "25mb" }));

// ===============================
// BASE DE DATOS
// ===============================

const db = new Database("cq-panel.db");

db.pragma("journal_mode = WAL");


try {
  const userColumns = db.prepare("PRAGMA table_info(users)").all()
  if (!userColumns.some(column => column.name === "session_version")) {
    db.exec("ALTER TABLE users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0")
  }
} catch (error) {
  console.error("Error preparando session_version:", error)
}
db.exec(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    license_expires TEXT,
    device_id TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    session_version INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    icon TEXT DEFAULT '🔗',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS vault_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  encryption_salt TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vault_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  item_type TEXT NOT NULL,
  name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER DEFAULT 0,
  encrypted_data BLOB NOT NULL,
  iv TEXT NOT NULL,
  auth_tag TEXT NOT NULL,
  metadata_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    console.log(" Contraseña temporal:", temporaryPassword);
    console.log(" GUARDA ESTA CONTRASEÑA.");
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
                error: "Faltan datos de inicio de sesión."
            });
        }

        const user = db.prepare(
            "SELECT * FROM users WHERE username = ?"
        ).get(username);

        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
            return res.status(401).json({
                error: "Usuario o contraseña incorrectos."
            });
        }

        if (!user.active) {
            return res.status(403).json({
                error: "Esta cuenta está bloqueada."
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
                error: "Esta licencia ya está vinculada a otro dispositivo."
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role, session_version: db.prepare("SELECT session_version FROM users WHERE id = ?").get(user.id).session_version
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
// PROTECCIÓN DE RUTAS
// ===============================


db.exec(`
  CREATE TRIGGER IF NOT EXISTS users_revoke_session
  AFTER UPDATE OF username, password_hash, active ON users
  WHEN OLD.role != 'admin'
  BEGIN
    UPDATE users
    SET session_version = OLD.session_version + 1
    WHERE id = OLD.id;
  END;
`);
function auth(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Acceso no autorizado." });
  }

  try {
    const token = authorization.substring(7);
    const payload = jwt.verify(token, JWT_SECRET);

    const currentUser = db.prepare(`
      SELECT
        id,
        username,
        role,
        license_expires,
        device_id,
        active,
        session_version
      FROM users
      WHERE id = ?
    `).get(payload.id);

    if (!currentUser) {
      return res.status(401).json({ error: "Usuario eliminado." });
    }

    if (!currentUser.active) {
      return res.status(403).json({ error: "Usuario bloqueado." });
    }

    if (
      currentUser.role !== "admin" &&
      currentUser.license_expires &&
      new Date(currentUser.license_expires).getTime() <= Date.now()
    ) {
      return res.status(403).json({ error: "Licencia vencida." });
    }

    if (payload.session_version !== currentUser.session_version) {
      return res.status(401).json({ error: "Sesion revocada." });
    }

    req.user = currentUser;
    next();

  } catch (error) {
    return res.status(401).json({ error: "Sesion invalida." });
  }
}

app.get("/api/session", auth, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
      licenseExpires: req.user.license_expires
    }
  });
});

// ===== BOVEDA PRIVADA POR USUARIO =====

app.get("/api/vault/status", auth, (req, res) => {
  const vault = db.prepare(`
    SELECT encryption_salt
    FROM vault_settings
    WHERE user_id = ?
  `).get(req.user.id);

  res.json({
    configured: !!vault,
    salt: vault ? vault.encryption_salt : null
  });
});

app.post("/api/vault/setup", auth, (req, res) => {
  const password = String(req.body.password || "");

  if (password.length < 6) {
    return res.status(400).json({
      error: "La contrase�a de la b�veda debe tener al menos 6 caracteres."
    });
  }

  const existing = db.prepare(`
    SELECT id
    FROM vault_settings
    WHERE user_id = ?
  `).get(req.user.id);

  if (existing) {
    return res.status(409).json({
      error: "Este usuario ya tiene una b�veda configurada."
    });
  }

  const passwordHash = bcrypt.hashSync(password, 12);
  const salt = crypto.randomBytes(32).toString("hex");

  db.prepare(`
    INSERT INTO vault_settings
      (user_id, password_hash, encryption_salt)
    VALUES (?, ?, ?)
  `).run(req.user.id, passwordHash, salt);

  res.json({
    success: true,
    salt
  });
});

app.post("/api/vault/unlock", auth, (req, res) => {
  const password = String(req.body.password || "");

  const vault = db.prepare(`
    SELECT password_hash, encryption_salt
    FROM vault_settings
    WHERE user_id = ?
  `).get(req.user.id);

  if (!vault) {
    return res.status(404).json({
      error: "La b�veda todav�a no est� configurada."
    });
  }

  const valid = bcrypt.compareSync(password, vault.password_hash);

  if (!valid) {
    return res.status(401).json({
      error: "Contrase�a de b�veda incorrecta."
    });
  }

  res.json({
    success: true,
    salt: vault.encryption_salt
  });
});

// ===== FIN BOVEDA PRIVADA =====

// ===== ITEMS DE BOVEDA PRIVADA =====

app.get("/api/vault/items", auth, (req, res) => {
  const rows = db.prepare(`
    SELECT id, item_type, name, mime_type, size_bytes,
           encrypted_data, iv, auth_tag, metadata_json,
           created_at, updated_at
    FROM vault_items
    WHERE user_id = ?
    ORDER BY id ASC
  `).all(req.user.id);

  const items = rows.map(row => ({
    ...row,
    encrypted_data: Buffer.isBuffer(row.encrypted_data)
      ? row.encrypted_data.toString("base64")
      : row.encrypted_data
  }));

  res.json(items);
});

app.post("/api/vault/items", auth, (req, res) => {
  const {
    item_type,
    name,
    mime_type,
    size_bytes,
    encrypted_data,
    iv,
    auth_tag,
    metadata_json
  } = req.body || {};

  if (!item_type || !name || !encrypted_data || !iv || !auth_tag) {
    return res.status(400).json({
      error: "Faltan datos obligatorios del elemento privado."
    });
  }

  const encryptedBuffer = Buffer.from(encrypted_data, "base64");

  const result = db.prepare(`
    INSERT INTO vault_items
      (user_id, item_type, name, mime_type, size_bytes,
       encrypted_data, iv, auth_tag, metadata_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user.id,
    String(item_type),
    String(name),
    mime_type ? String(mime_type) : null,
    Number(size_bytes || 0),
    encryptedBuffer,
    String(iv),
    String(auth_tag),
    metadata_json ? String(metadata_json) : null
  );

  res.json({
    success: true,
    id: result.lastInsertRowid
  });
});

app.delete("/api/vault/items/:id", auth, (req, res) => {
  const result = db.prepare(`
    DELETE FROM vault_items
    WHERE id = ? AND user_id = ?
  `).run(req.params.id, req.user.id);

  if (result.changes === 0) {
    return res.status(404).json({
      error: "Elemento no encontrado."
    });
  }

  res.json({ success: true });
});

// ===== FIN ITEMS DE BOVEDA =====

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
                error: "Usuario, contraseña y días son obligatorios."
            });
        }

        const licenseDays = Number(days);

        if (!Number.isInteger(licenseDays) || licenseDays < 1) {
            return res.status(400).json({
                error: "Los días de licencia no son válidos."
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
        ORDER BY id ASC
    `).all();

    res.json(users);
});

// ===============================
// LIBERAR DISPOSITIVO
// ===============================

app.post("/api/admin/users/:id/reset-device", auth, adminOnly, (req, res) => {
    db.prepare(`
        UPDATE users
        SET device_id = NULL, session_version = session_version + 1
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

// NOTAS NORMALES POR USUARIO
db.exec(`
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  favorite INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
`);

app.get("/api/notes", auth, (req, res) => {
  const rows = db.prepare(`
    SELECT id, client_id AS id, title, text, category, favorite
    FROM notes
    WHERE user_id = ?
    ORDER BY id ASC
  `).all(req.user.id);

  res.json(rows.map(x => ({
    ...x,
    favorite: !!x.favorite
  })));
});

app.put("/api/notes/sync", auth, (req, res) => {
  const notes = Array.isArray(req.body.notes) ? req.body.notes : [];

  const sync = db.transaction((items) => {
    db.prepare("DELETE FROM notes WHERE user_id = ?").run(req.user.id);

    const insert = db.prepare(`
      INSERT INTO notes
      (user_id, client_id, title, text, category, favorite)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      if (!item) continue;

      insert.run(
        req.user.id,
        Number(item.id) || Date.now(),
        String(item.title || ""),
        String(item.text || ""),
        String(item.category || "General"),
        item.favorite ? 1 : 0
      );
    }
  });

  sync(notes);
  res.json({ success: true });
});
// ENLACES PRIVADOS DE CADA USUARIO
// ===============================

app.get("/api/links", auth, (req, res) => {
    const links = db.prepare(`
        SELECT id, name, url, category, icon, created_at
        FROM links
        WHERE user_id = ?
        ORDER BY id ASC
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
        icon || "🔗"
    );

    res.json({
        success: true,
        id: result.lastInsertRowid
    });
});


// SINCRONIZAR TODOS LOS ENLACES DEL USUARIO
app.put("/api/links/sync", auth, (req, res) => {
  const links = Array.isArray(req.body.links) ? req.body.links : [];

  const syncLinks = db.transaction((items) => {
    db.prepare("DELETE FROM links WHERE user_id = ?").run(req.user.id);

    const insert = db.prepare(`
      INSERT INTO links (user_id, name, url, category, icon)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      if (!item || !item.name || !item.url) continue;

      insert.run(
        req.user.id,
        String(item.name),
        String(item.url),
        String(item.category || "General"),
        String(item.icon || "")
      );
    }
  });

  syncLinks(links);

  res.json({ success: true });
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

// Cambiar contrase�a
app.patch('/api/admin/users/:id/password', auth, adminOnly, (req, res) => {
  const password = String(req.body.password || '')

  if (password.length < 4) {
    return res.status(400).json({ error: 'La contrase�a es demasiado corta.' })
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


// RESTABLECER BOVEDA DE UN USUARIO
app.post("/api/admin/users/:id/vault-reset", auth, adminOnly, (req, res) => {
  const user = db.prepare(`
    SELECT id, role
    FROM users
    WHERE id = ?
  `).get(req.params.id);

  if (!user || user.role === "admin") {
    return res.status(403).json({
      error: "No se puede restablecer la boveda del administrador."
    });
  }

  const resetVault = db.transaction(() => {
    db.prepare("DELETE FROM vault_items WHERE user_id = ?").run(req.params.id);
    db.prepare("DELETE FROM vault_settings WHERE user_id = ?").run(req.params.id);
  });

  resetVault();

  res.json({ success: true });
});
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










