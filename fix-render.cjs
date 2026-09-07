const fs = require("fs");

// ===== SERVER =====
let server = fs.readFileSync("server.cjs", "utf8");

server = server.replace(
  "const PORT = 3000;",
  "const PORT = process.env.PORT || 3000;"
);

if (!server.includes('const path = require("path");')) {
  server = server.replace(
    'const crypto = require("crypto");',
    'const crypto = require("crypto");\nconst path = require("path");'
  );
}

server = server.replace(
  'const temporaryPassword = crypto.randomBytes(9).toString("base64url");',
  'const temporaryPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString("base64url");'
);

server = server.replace(
  '`).run("CQ", passwordHash);',
  '`).run(process.env.ADMIN_USER || "CQ", passwordHash);'
);

server = server.replace(
  'console.log(" Usuario: CQ");',
  'console.log(" Usuario:", process.env.ADMIN_USER || "CQ");'
);

if (!server.includes("const distPath = path.join(__dirname, \"dist\")")) {
  const marker = "app.listen(PORT, () => {";

  const frontend = `
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

`;

  server = server.replace(marker, frontend + marker);
}

fs.writeFileSync("server.cjs", server, "utf8");

// ===== LOGIN =====
let login = fs.readFileSync("src/login.ts", "utf8");

login = login.replace(
  /const API = ['"]http:\/\/localhost:3000['"]/,
  "const API = window.location.origin"
);

login = login.replace(
  /window\.location\.href = ['"]http:\/\/localhost:5173\/?['"]/g,
  "window.location.href = '/index.html'"
);

login = login.replace(
  /window\.location\.href = ['"]\/['"]/g,
  "window.location.href = '/index.html'"
);

fs.writeFileSync("src/login.ts", login, "utf8");

// ===== ADMIN =====
let admin = fs.readFileSync("src/admin.ts", "utf8");

admin = admin.replace(
  /const API = ['"]http:\/\/localhost:3000['"]/,
  "const API = window.location.origin"
);

admin = admin.replace(
  'href="/"',
  'href="/index.html"'
);

fs.writeFileSync("src/admin.ts", admin, "utf8");

// ===== VITE MULTI-PAGE =====
fs.writeFileSync(
  "vite.config.ts",
`import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        login: resolve(process.cwd(), 'login.html'),
        admin: resolve(process.cwd(), 'admin.html')
      }
    }
  }
})
`,
  "utf8"
);

console.log("");
console.log("CQ PANEL PREPARADO PARA RENDER");
console.log("");
