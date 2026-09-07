const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const readline = require("readline");

const db = new Database("cq-panel.db");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Escribe la MISMA contraseña de tu panel de reporte: ", (password) => {

  if (!password.trim()) {
    console.log("La contraseña no puede estar vacía.");
    rl.close();
    db.close();
    return;
  }

  const hash = bcrypt.hashSync(password, 12);

  const admin = db
    .prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
    .get();

  if (!admin) {
    console.log("No encontré el administrador.");
    rl.close();
    db.close();
    return;
  }

  db.prepare(`
    UPDATE users
    SET username = ?, password_hash = ?
    WHERE id = ?
  `).run("admin", hash, admin.id);

  console.log("");
  console.log("================================");
  console.log(" CQ PANEL ACTUALIZADO");
  console.log(" Usuario: admin");
  console.log(" Contraseña: actualizada");
  console.log("================================");

  rl.close();
  db.close();
});