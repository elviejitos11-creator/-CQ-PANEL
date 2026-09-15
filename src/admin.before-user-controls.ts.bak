const API = window.location.origin

const token = localStorage.getItem("cq-token")
const savedUser = JSON.parse(localStorage.getItem("cq-user") || "null")

if (!token || !savedUser || savedUser.role !== "admin") {
  window.location.href = "/login.html"
  throw new Error("Acceso no autorizado")
}

document.body.innerHTML = `
<div class="admin-page">
  <header>
    <div>
      <p class="small">CQ PANEL</p>
      <h1>Administración</h1>
      <p class="sub">Usuarios, licencias y dispositivos</p>
    </div>

    <a class="back" href="/index.html">← Volver al panel</a>
  </header>

  <section class="create-box">
    <h2>Crear usuario</h2>

    <div class="form-grid">
      <div>
        <label>Usuario</label>
        <input id="newUsername" placeholder="Ej: Cliente01">
      </div>

      <div>
        <label>Contraseña</label>
        <input id="newPassword" type="password" placeholder="Contraseña">
      </div>

      <div>
        <label>Días de licencia</label>
        <input id="newDays" type="number" min="1" value="30">
      </div>
    </div>

    <button id="createUser">＋ Crear usuario</button>
    <div id="message"></div>
  </section>

  <section class="users-box">
    <div class="title-row">
      <h2>Usuarios</h2>
      <button id="refresh">Actualizar</button>
    </div>

    <div id="users">Cargando...</div>
  </section>
</div>
`

const style = document.createElement("style")

style.textContent = `
* { box-sizing:border-box; }

body {
  margin:0;
  min-height:100vh;
  font-family:Inter,"Segoe UI",Arial,sans-serif;
  color:#fff;
  background:
    radial-gradient(circle at 10% 10%,rgba(0,105,255,.22),transparent 30%),
    radial-gradient(circle at 90% 90%,rgba(220,0,255,.18),transparent 35%),
    #030617;
}

.admin-page {
  max-width:1200px;
  margin:auto;
  padding:40px 24px;
}

header {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:20px;
  margin-bottom:28px;
}

.small {
  color:#43a8ff;
  font-size:11px;
  letter-spacing:4px;
  font-weight:900;
  margin:0 0 6px;
}

h1 {
  margin:0;
  font-size:40px;
  background:linear-gradient(90deg,#fff,#4aa5ff,#e029ff);
  -webkit-background-clip:text;
  color:transparent;
}

.sub { color:#858dab; }

.back {
  color:white;
  text-decoration:none;
  padding:13px 18px;
  border:1px solid #313967;
  border-radius:13px;
  background:#0b1029;
}

.create-box,.users-box {
  background:linear-gradient(145deg,#0b1230,#130825);
  border:1px solid #30396c;
  border-radius:22px;
  padding:25px;
  margin-bottom:25px;
  box-shadow:0 20px 60px rgba(0,0,0,.25);
}

h2 { margin-top:0; }

.form-grid {
  display:grid;
  grid-template-columns:1fr 1fr 180px;
  gap:15px;
}

label {
  display:block;
  color:#aeb5d4;
  font-size:12px;
  margin-bottom:7px;
  font-weight:700;
}

input {
  width:100%;
  height:50px;
  border:1px solid #29335e;
  border-radius:12px;
  padding:0 14px;
  background:#070d21;
  color:white;
  outline:none;
}

#createUser {
  margin-top:18px;
  height:50px;
  padding:0 25px;
  border:0;
  border-radius:13px;
  color:white;
  font-weight:900;
  cursor:pointer;
  background:linear-gradient(90deg,#0783ff,#683cff,#df18ed);
}

#message {
  margin-top:14px;
  min-height:20px;
  color:#5ee7a2;
}

.title-row {
  display:flex;
  align-items:center;
  justify-content:space-between;
}

#refresh,.action {
  border:1px solid #343e70;
  background:#0b1230;
  color:white;
  border-radius:9px;
  padding:8px 11px;
  cursor:pointer;
}

table {
  width:100%;
  border-collapse:collapse;
}

th,td {
  text-align:left;
  padding:14px 10px;
  border-bottom:1px solid #20294c;
  font-size:13px;
}

th {
  color:#7586bf;
  font-size:11px;
  letter-spacing:1px;
}

.status-on { color:#64efa9; }
.status-off { color:#ff6584; }

.actions {
  display:flex;
  gap:7px;
  flex-wrap:wrap;
}

.danger {
  border-color:#6c273d;
  color:#ff8299;
}

@media(max-width:750px){
  .form-grid { grid-template-columns:1fr; }
  header { align-items:flex-start; flex-direction:column; }
  .users-box { overflow-x:auto; }
  table { min-width:850px; }
}
`

document.head.appendChild(style)

const message = document.querySelector<HTMLDivElement>("#message")!

async function api(path:string, options:RequestInit = {}) {
  const response = await fetch(API + path, {
    ...options,
    headers:{
      "Content-Type":"application/json",
      "Authorization":"Bearer " + token,
      ...(options.headers || {})
    }
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Error del servidor")
  }

  return data
}

async function loadUsers() {
  const container = document.querySelector<HTMLDivElement>("#users")!

  try {
    const users = await api("/api/admin/users")

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>USUARIO</th>
            <th>TIPO</th>
            <th>LICENCIA</th>
            <th>DISPOSITIVO</th>
            <th>ESTADO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>

        <tbody>
        ${users.map((user:any) => `
          <tr>
            <td><strong>${user.username}</strong></td>
            <td>${user.role}</td>
            <td>
              ${user.role === "admin"
                ? "Administrador"
                : user.license_expires
                  ? new Date(user.license_expires).toLocaleString()
                  : "Sin fecha"}
            </td>
            <td>${user.device_id ? "Vinculado" : "Libre"}</td>
            <td class="${user.active ? "status-on" : "status-off"}">
              ${user.active ? "Activo" : "Bloqueado"}
            </td>
            <td>
              ${user.role === "admin" ? "—" : `
                <div class="actions">
                  <button
                    class="action reset"
                    data-id="${user.id}">
                    Liberar dispositivo
                  </button>

                  <button
                    class="action danger status"
                    data-id="${user.id}"
                    data-active="${user.active ? "0" : "1"}">
                    ${user.active ? "Bloquear" : "Activar"}
                  </button>
                </div>
              `}
            </td>
          </tr>
        `).join("")}
        </tbody>
      </table>
    `

    bindActions()

  } catch(error) {
    container.textContent =
      error instanceof Error ? error.message : "Error"
  }
}

function bindActions() {
  document.querySelectorAll<HTMLButtonElement>(".reset").forEach(btn => {
    btn.onclick = async () => {
      if (!confirm("¿Liberar este dispositivo?")) return

      await api(`/api/admin/users/${btn.dataset.id}/reset-device`, {
        method:"POST"
      })

      loadUsers()
    }
  })

  document.querySelectorAll<HTMLButtonElement>(".status").forEach(btn => {
    btn.onclick = async () => {
      await api(`/api/admin/users/${btn.dataset.id}/status`, {
        method:"POST",
        body:JSON.stringify({
          active:btn.dataset.active === "1"
        })
      })

      loadUsers()
    }
  })
}

document.querySelector("#createUser")?.addEventListener("click", async () => {
  const username =
    document.querySelector<HTMLInputElement>("#newUsername")!.value.trim()

  const password =
    document.querySelector<HTMLInputElement>("#newPassword")!.value

  const days =
    Number(document.querySelector<HTMLInputElement>("#newDays")!.value)

  message.textContent = ""

  if (!username || !password || !days) {
    message.style.color = "#ff728f"
    message.textContent = "Completa usuario, contraseña y días."
    return
  }

  try {
    const result = await api("/api/admin/users", {
      method:"POST",
      body:JSON.stringify({
        username,
        password,
        days
      })
    })

    message.style.color = "#5ee7a2"
    message.textContent =
      `Usuario ${result.username} creado correctamente.`

    document.querySelector<HTMLInputElement>("#newUsername")!.value = ""
    document.querySelector<HTMLInputElement>("#newPassword")!.value = ""

    await loadUsers()

  } catch(error) {
    message.style.color = "#ff728f"
    message.textContent =
      error instanceof Error ? error.message : "No se pudo crear."
  }
})

document.querySelector("#refresh")?.addEventListener("click", loadUsers)

loadUsers()

// ===== LIBERAR DISPOSITIVO DESDE ADMIN =====
function agregarBotonLiberarDispositivo() {
  if (document.querySelector('#resetDeviceBtn')) return

  const btn = document.createElement('button')
  btn.id = 'resetDeviceBtn'
  btn.textContent = '📱 Liberar dispositivo'

  btn.style.position = 'fixed'
  btn.style.right = '24px'
  btn.style.bottom = '24px'
  btn.style.zIndex = '9999'
  btn.style.padding = '14px 20px'
  btn.style.border = '0'
  btn.style.borderRadius = '14px'
  btn.style.cursor = 'pointer'
  btn.style.fontWeight = '800'
  btn.style.color = 'white'
  btn.style.background = 'linear-gradient(90deg,#168cff,#7c35ff,#e900d7)'
  btn.style.boxShadow = '0 0 25px rgba(124,53,255,.55)'

  btn.addEventListener('click', async () => {
    const username = prompt('Usuario al que quieres liberar el dispositivo:')

    if (!username) return

    const token = localStorage.getItem('cq-token')

    if (!token) {
      alert('Tu sesión de administrador no está activa.')
      return
    }

    try {
      const usersResponse = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const users = await usersResponse.json()

      const user = users.find(
        (u: any) => u.username.toLowerCase() === username.trim().toLowerCase()
      )

      if (!user) {
        alert('Ese usuario no existe.')
        return
      }

      const response = await fetch(`/api/admin/users/${user.id}/reset-device`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.error || 'No se pudo liberar el dispositivo.')
        return
      }

      alert(`Dispositivo de ${user.username} liberado correctamente.`)
      window.location.reload()

    } catch (error) {
      alert('Error al liberar el dispositivo.')
    }
  })

  document.body.appendChild(btn)
}

agregarBotonLiberarDispositivo()
