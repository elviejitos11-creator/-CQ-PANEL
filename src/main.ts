import Sortable from 'sortablejs'
import './style.css'

type LinkItem = {
  id: number
  name: string
  url: string
  category: string
  icon: string
}

const defaultLinks: LinkItem[] = [
  { id: 1001, name: 'Ultra Mobile', url: 'https://www.ultramobile.com/', category: 'Telefonía', icon: '📱' },
  { id: 1002, name: 'My Ultra Mobile', url: 'https://my.ultramobile.com/login', category: 'Telefonía', icon: '📲' },
  { id: 1003, name: 'Airhub', url: 'https://www.airhubapp.com/', category: 'Telefonía', icon: '📡' },
  { id: 1004, name: 'Lyca Mobile', url: 'https://www.lycamobile.us/en/plans/best-prepaid-phone-plans/#best-value', category: 'Telefonía', icon: '📱' },
  { id: 1005, name: 'Verizon Prepaid', url: 'https://www.verizon.com/prepaid/bring-your-own-device/', category: 'Telefonía', icon: '📶' },

  { id: 1006, name: 'Amazon Verizon SIM', url: 'https://www.amazon.com/s?k=verizon+prepaid+sim+kit', category: 'SIM y compras', icon: '🛒' },
  { id: 1007, name: 'Amazon SIM 1', url: 'https://a.co/d/0agsFzpE', category: 'SIM y compras', icon: '📦' },
  { id: 1008, name: 'Amazon SIM 2', url: 'https://a.co/d/04uwTYpM', category: 'SIM y compras', icon: '📦' },

  { id: 1009, name: 'TopUp', url: 'https://topup.com/', category: 'Recargas', icon: '⚡' },
  { id: 1010, name: 'MobileRecharge Verizon', url: 'https://mobilerecharge.com/buy/mobile_recharge/USA/Verizon%20Prepaid', category: 'Recargas', icon: '⚡' },
  { id: 1011, name: 'TopUpBill', url: 'https://topupbill.com/es/?utm_source=chatgpt.com', category: 'Recargas', icon: '⚡' },
  { id: 1012, name: 'Bitrefill', url: 'https://www.bitrefill.com/refill/?hl=es', category: 'Recargas', icon: '🎁' },
  { id: 1013, name: 'Coinsbee', url: 'https://www.coinsbee.com/es/shop/', category: 'Recargas', icon: '🎁' },
  { id: 1014, name: 'Recharge Ultra Mobile', url: 'https://www.recharge.com/es/us/ultra-mobile?utm_source=chatgpt.com', category: 'Recargas', icon: '📲' },
  { id: 1015, name: 'Giftcards', url: 'https://www.giftcards.com/us/en/member', category: 'Recargas', icon: '🎁' },

  { id: 1016, name: 'Proxy-Cheap', url: 'https://app.proxy-cheap.com/proxies/static-residential/order', category: 'Proxies', icon: '🌐' },
  { id: 1017, name: 'Webshare', url: 'https://www.webshare.io/static-residential-proxy', category: 'Proxies', icon: '🌐' },
  { id: 1018, name: 'IPRoyal', url: 'https://dashboard.iproyal.com/', category: 'Proxies', icon: '🌐' },
  { id: 1019, name: 'NodeMaven', url: 'https://dashboard.nodemaven.com/proxy/default', category: 'Proxies', icon: '🌐' },
  { id: 1020, name: 'DataImpulse', url: 'https://app.dataimpulse.com/dashboard', category: 'Proxies', icon: '🌐' }
]

let links: LinkItem[] = JSON.parse(localStorage.getItem('cq-links') || '[]')

if (!localStorage.getItem('cq-links-initial-v1')) {
  links = [...defaultLinks]
  localStorage.setItem('cq-links', JSON.stringify(links))
  localStorage.setItem('cq-links-initial-v1', '1')
}

const cqToken = localStorage.getItem('cq-token')
const cqUser = JSON.parse(localStorage.getItem('cq-user') || 'null')

if (!cqToken || !cqUser) {
  window.location.href = '/login.html'
}

const linksKey = `cq-links-${cqUser.username}`

// Migrar solamente los enlaces antiguos del ADMIN
if (cqUser.role === 'admin' && !localStorage.getItem(linksKey)) {
  const oldAdminLinks = localStorage.getItem('cq-links')

  if (oldAdminLinks) {
    localStorage.setItem(linksKey, oldAdminLinks)
  } else {
    localStorage.setItem(linksKey, JSON.stringify(links))
  }
}

// Todo cliente nuevo empieza completamente vacío
if (cqUser.role !== 'admin' && !localStorage.getItem(linksKey)) {
  localStorage.setItem(linksKey, '[]')
}

// Cargar exclusivamente los enlaces de ESTE usuario
const privateLinks = JSON.parse(localStorage.getItem(linksKey) || '[]')
links.splice(0, links.length, ...privateLinks)

// ENLACES FIJOS DEL ADMIN
if (cqUser?.role === "admin") {
  const fixedLinks = [
    { id: Date.now()+101, name: "GitHub", url: "https://github.com/", category: "Proyectos", icon: "GH" },
    { id: Date.now()+102, name: "Railway", url: "https://railway.com/", category: "Proyectos", icon: "RW" },
    { id: Date.now()+103, name: "Render", url: "https://render.com/", category: "Proyectos", icon: "RD" },
    { id: Date.now()+104, name: "Scamalytics", url: "https://scamalytics.com/", category: "Herramientas", icon: "SC" },
    { id: Date.now()+105, name: "ListCrawler North Jersey", url: "https://escortalligator.com.listcrawler.eu/brief/escorts/usa/newjersey/northjersey/1", category: "Accesos", icon: "LC" },
    { id: Date.now()+106, name: "MegaPersonals", url: "https://megapersonals.eu/", category: "Accesos", icon: "MP" }
  ]

  for (const fixed of fixedLinks) {
    const fixedUrl = fixed.url.replace(/\/+$/, "").toLowerCase()

    const exists = links.some(link =>
      String(link.url || "").replace(/\/+$/, "").toLowerCase() === fixedUrl
    )

    if (!exists) links.push(fixed)
  }

  saveLinks()
}

function saveLinks() {
  localStorage.setItem(linksKey, JSON.stringify(links))
}

function render() {
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div class="app">
      <aside class="sidebar">
        <div class="brand">
          <div class="crown">â™›</div>
          <div>
            <h2>CQ PANEL</h2>
            <span>MI CENTRO DE CONTROL</span>
          </div>
        </div>

        <nav>
          <button class="nav active">âŒ‚ <span>Inicio</span></button>
          <button class="nav">ðŸ”— <span>Mis enlaces</span></button>
          <button class="nav">ðŸ“ <span>Mis notas</span></button>
          <button class="nav">ðŸ“ <span>Mis archivos</span></button>
          ${cqUser?.role === "admin" ? `<button class="nav" onclick="window.location.href='/admin.html'">⚙️ <span>Administración</span></button>` : ""}
        </nav>

        <div class="sidebar-bottom">
          <div class="status-dot"></div>
          <span>Sistema activo</span>
        </div>
      </aside>

      <main>
        <header>
          <div>
            <p class="eyebrow">ESPACIO PERSONAL</p>
            <h1>Bienvenido, <span>CQ</span></h1>
            <p class="subtitle">Todo lo que necesitas, en un solo lugar.</p>
          </div>

          <button class="add-btn" id="openModal">ï¼‹ Agregar enlace</button>
        </header>

        <section class="toolbar">
          <div class="search">
            ðŸ”Ž
            <input id="searchInput" placeholder="Buscar enlaces..." />
          </div>

          <div class="counter">
            <strong>${links.length}</strong>
            <span>Enlaces guardados</span>
          </div>
        </section>

        <section>
          <div class="section-title">
            <div>
              <p class="eyebrow">ACCESOS</p>
              <h3>Mis enlaces</h3>
            </div>
          </div>

          <div class="cards" id="cards">
            ${renderCards(links)}
          </div>
        </section>
      </main>
    </div>

    <div class="modal hidden" id="modal">
      <div class="modal-card">
        <button class="close" id="closeModal">Ã—</button>

        <p class="eyebrow">NUEVO ACCESO</p>
        <h2>Agregar enlace</h2>

        <label>Nombre</label>
        <input id="linkName" placeholder="Ej: Ultra Mobile" />

        <label>Enlace</label>
        <input id="linkUrl" placeholder="https://..." />

        <label>CategorÃ­a</label>
        <input id="linkCategory" placeholder="Ej: TelefonÃ­a" />

        <label>Icono o emoji</label>
        <input id="linkIcon" placeholder="ðŸ“±" maxlength="4" />

        <button class="save-btn" id="saveLink">Guardar enlace</button>
      </div>
    </div>
  `

  events()
}

function renderCards(items: LinkItem[]) {
  if (!items.length) {
    return `
      <div class="empty">
        <div class="empty-icon">ï¼‹</div>
        <h3>TodavÃ­a no tienes enlaces</h3>
        <p>Agrega tu primer acceso y aparecerÃ¡ aquÃ­.</p>
      </div>
    `
  }

  return items.map(item => `
    <article class="card" data-id="${item.id}">
      <div class="card-icon">${item.icon || 'ðŸ”—'}</div>
      <div class="category">${item.category || 'General'}</div>
      <h3>${item.name}</h3>
      <div class="card-actions">
        <a href="${item.url}" target="_blank" rel="noopener">Abrir</a>
<button class="delete" data-id="${item.id}">Eliminar</button>
      </div>
    </article>
  `).join('')
}

function events() {
  document.querySelector('#adminBtn')?.addEventListener('click', () => {
    window.location.href = '/admin.html'
  })

  const modal = document.querySelector<HTMLDivElement>('#modal')!

  document.querySelector('#openModal')?.addEventListener('click', () => {
    modal.classList.remove('hidden')
  })

  document.querySelector('#closeModal')?.addEventListener('click', () => {
    modal.classList.add('hidden')
  })

  document.querySelector('#saveLink')?.addEventListener('click', () => {
    const name = (document.querySelector<HTMLInputElement>('#linkName')!).value.trim()
    let url = (document.querySelector<HTMLInputElement>('#linkUrl')!).value.trim()
    const category = (document.querySelector<HTMLInputElement>('#linkCategory')!).value.trim()
    const icon = (document.querySelector<HTMLInputElement>('#linkIcon')!).value.trim()

    if (!name || !url) {
      alert('Pon el nombre y el enlace.')
      return
    }

    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url
    }

    links.unshift({
      id: Date.now(),
      name,
      url,
      category: category || 'General',
      icon: icon || 'ðŸ”—'
    })

    saveLinks()
    render()
  })

  document.querySelector('#searchInput')?.addEventListener('input', (event) => {
    const text = (event.target as HTMLInputElement).value.toLowerCase()

    const filtered = links.filter(link =>
      link.name.toLowerCase().includes(text) ||
      link.category.toLowerCase().includes(text)
    )

    document.querySelector<HTMLDivElement>('#cards')!.innerHTML = renderCards(filtered)
    deleteEvents()
  })

  deleteEvents()
}

function dragEvents() {
  document.querySelectorAll<HTMLElement>('.card[data-id]').forEach(card => {
    let timer = 0
    let dragging = false
    let pointerId = -1

    const cancelHold = () => {
      if (timer) {
        window.clearTimeout(timer)
        timer = 0
      }
    }

    card.addEventListener('pointerdown', (e: PointerEvent) => {
      const target = e.target as HTMLElement

      // Abrir y Eliminar siguen funcionando normalmente
      if (target.closest('a, button, input')) return

      pointerId = e.pointerId

      timer = window.setTimeout(() => {
        dragging = true

        try {
          card.setPointerCapture(pointerId)
        } catch {}

        card.style.opacity = '0.72'
        card.style.transform = 'scale(0.98)'
        card.style.zIndex = '999'
        card.style.position = 'relative'

        document.body.style.userSelect = 'none'
      }, 350)
    })

    card.addEventListener('pointermove', (e: PointerEvent) => {
      if (!dragging) return

      e.preventDefault()

      const under = document.elementFromPoint(e.clientX, e.clientY)
      const targetCard = under?.closest<HTMLElement>('.card[data-id]')

      if (!targetCard || targetCard === card) return

      const rect = targetCard.getBoundingClientRect()
      const parent = targetCard.parentElement

      if (!parent) return

      if (e.clientY < rect.top + rect.height / 2) {
        parent.insertBefore(card, targetCard)
      } else {
        parent.insertBefore(card, targetCard.nextSibling)
      }

      // Ayuda a mover listas largas en móvil
      if (e.clientY < 100) {
        window.scrollBy(0, -12)
      } else if (e.clientY > window.innerHeight - 100) {
        window.scrollBy(0, 12)
      }
    })

    const finishDrag = () => {
      cancelHold()

      if (!dragging) return

      dragging = false

      card.style.opacity = ''
      card.style.transform = ''
      card.style.zIndex = ''
      card.style.position = ''

      document.body.style.userSelect = ''

      const ordered: LinkItem[] = []

      document.querySelectorAll<HTMLElement>('#cards .card[data-id]').forEach(el => {
        const id = Number(el.dataset.id)
        const link = links.find(item => item.id === id)

        if (link) ordered.push(link)
      })

      if (ordered.length === links.length) {
        links = ordered
        saveLinks()
      }

      render()
    }

    card.addEventListener('pointerup', finishDrag)
    card.addEventListener('pointercancel', finishDrag)
    card.addEventListener('pointerleave', () => {
      if (!dragging) cancelHold()
    })
  })
}

let cqSortable: Sortable | null = null

function sortableEvents() {
  const container = document.querySelector<HTMLElement>('#cards')
  if (!container) return

  if (cqSortable) {
    cqSortable.destroy()
    cqSortable = null
  }

  cqSortable = new Sortable(container, {
    animation: 180,

    // Mantener presionado antes de mover
    delay: 180,
    delayOnTouchOnly: true,
    touchStartThreshold: 3,

    // Ajuste más estable para iPhone/Safari
    forceFallback: true,
    fallbackOnBody: false,
    fallbackTolerance: 2,

    // No iniciar arrastre desde botones
    filter: 'a, button, input',

    ghostClass: 'cq-drag-ghost',
    chosenClass: 'cq-drag-chosen',
    dragClass: 'cq-dragging',

    onStart: () => {
      document.body.style.userSelect = 'none'
      document.body.style.webkitUserSelect = 'none'
      document.documentElement.style.overscrollBehavior = 'none'
    },

    onEnd: () => {
      document.body.style.userSelect = ''
      document.body.style.webkitUserSelect = ''
      document.documentElement.style.overscrollBehavior = ''

      const ordered: LinkItem[] = []

      container
        .querySelectorAll<HTMLElement>('.card[data-id]')
        .forEach(card => {
          const id = Number(card.dataset.id)
          const item = links.find(link => link.id === id)

          if (item) ordered.push(item)
        })

      if (ordered.length === links.length) {
        links = ordered
        saveLinks()
      }

      render()
    }
  })
}
function deleteEvents() {
  sortableEvents()
  dragEvents()
  document.querySelectorAll<HTMLButtonElement>('.delete').forEach(button => {
    button.addEventListener('click', () => {
      const id = Number(button.dataset.id)

      if (confirm('Â¿Eliminar este enlace?')) {
        links = links.filter(link => link.id !== id)
        saveLinks()
        render()
      }
    })
  })
}

render()






// ===== VAULT CRYPTO ENGINE =====
let vaultKey: CryptoKey | null = null
let vaultUnlocked = false

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ""
  bytes.forEach(b => binary += String.fromCharCode(b))
  return btoa(binary)
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return bytes
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer
}

async function deriveVaultKey(password: string, saltHex: string): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  )

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: toArrayBuffer(hexToBytes(saltHex)),
      iterations: 250000,
      hash: "SHA-256"
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  )
}

async function encryptVaultData(value: string) {
  if (!vaultKey) throw new Error("Vault locked")

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: toArrayBuffer(iv) },
      vaultKey,
      new TextEncoder().encode(value)
    )
  )

  const tag = encrypted.slice(encrypted.length - 16)
  const ciphertext = encrypted.slice(0, encrypted.length - 16)

  return {
    encrypted_data: bytesToBase64(ciphertext),
    iv: bytesToBase64(iv),
    auth_tag: bytesToBase64(tag)
  }
}

async function decryptVaultData(data: string, ivText: string, tagText: string): Promise<string> {
  if (!vaultKey) throw new Error("Vault locked")

  const ciphertext = base64ToBytes(data)
  const tag = base64ToBytes(tagText)
  const combined = new Uint8Array(ciphertext.length + tag.length)

  combined.set(ciphertext)
  combined.set(tag, ciphertext.length)

  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toArrayBuffer(base64ToBytes(ivText)) },
    vaultKey,
    toArrayBuffer(combined)
  )

  return new TextDecoder().decode(plain)
}

async function vaultFetch(path: string, options: RequestInit = {}) {
  return fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${cqToken}`,
      ...(options.headers || {})
    }
  })
}

void vaultUnlocked
void deriveVaultKey
void encryptVaultData
void decryptVaultData
void vaultFetch
// ===== END VAULT CRYPTO ENGINE =====
// ===== CQ PANEL: NOTAS + CERRAR SESION =====
;(() => {
  type CQNote = {
    id: number
    title: string
    text: string
    category: string
    favorite: boolean
  }

  const user = JSON.parse(localStorage.getItem('cq-user') || 'null')
  const notesKey = user?.username
    ? `cq-notes-${user.username}`
    : 'cq-notes'

  let notes: CQNote[] = JSON.parse(localStorage.getItem(notesKey) || '[]')

  const saveNotes = () => {
    localStorage.setItem(notesKey, JSON.stringify(notes))
  }

  const style = document.createElement('style')
  style.textContent = `
    .cq-tools{
      position:fixed;right:18px;top:18px;z-index:9000;
      display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end
    }
    .cq-tool-btn{
      border:1px solid #354067;border-radius:12px;padding:10px 14px;
      background:#10162e;color:white;font-weight:700;cursor:pointer
    }
    .cq-tool-main{
      background:linear-gradient(90deg,#168cff,#7c35ff,#e900d7);
      border:0
    }
    .cq-notes-overlay{
      display:none;position:fixed;inset:0;z-index:9500;
      background:rgba(0,0,0,.78);padding:20px;overflow:auto
    }
    .cq-notes-box{
      max-width:760px;margin:30px auto;background:#0b1026;
      border:1px solid #354067;border-radius:22px;padding:22px;color:white
    }
    .cq-notes-head{
      display:flex;justify-content:space-between;align-items:center;gap:12px
    }
    .cq-note-input,.cq-note-textarea,.cq-note-select{
      width:100%;box-sizing:border-box;margin-top:10px;padding:13px;
      border-radius:12px;border:1px solid #354067;
      background:#071025;color:white
    }
    .cq-note-textarea{min-height:130px;resize:vertical}
    .cq-note-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
    .cq-note-card{
      margin-top:14px;padding:16px;border:1px solid #354067;
      border-radius:16px;background:#0d1430
    }
    .cq-note-card h3{margin:0 0 6px}
    .cq-note-card p{white-space:pre-wrap;word-break:break-word}
    .cq-note-meta{opacity:.65;font-size:13px;margin-bottom:8px}
  `
  document.head.appendChild(style)

  const tools = document.createElement('div')
  tools.className = 'cq-tools'

  const notesBtn = document.createElement('button')
  notesBtn.className = 'cq-tool-btn cq-tool-main'
  notesBtn.textContent = '📝 Notas'

  const vaultBtn = document.createElement('button')
vaultBtn.className = 'cq-tool-btn cq-tool-main'
vaultBtn.textContent = '\uD83D\uDD10 B\u00F3veda'

const logoutBtn = document.createElement('button')
  logoutBtn.className = 'cq-tool-btn'
  logoutBtn.textContent = '🚪 Cerrar sesión'

  tools.append(notesBtn, vaultBtn, logoutBtn)


function openVaultScreen() {
  if (!vaultUnlocked || !vaultKey) {
    alert("La boveda esta bloqueada.")
    return
  }

  const old = document.getElementById("cqVaultOverlay")
  if (old) old.remove()

  const vaultOverlay = document.createElement("div")
  vaultOverlay.id = "cqVaultOverlay"
  vaultOverlay.style.cssText = "position:fixed;inset:0;z-index:9800;background:rgba(0,0,0,.88);padding:20px;overflow:auto;"

  vaultOverlay.innerHTML = `
    <div style="max-width:760px;margin:30px auto;background:#0b1026;border:1px solid #354067;border-radius:22px;padding:22px;color:white">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
        <div>
          <div style="font-size:12px;opacity:.65">ESPACIO CIFRADO</div>
          <h2 style="margin:5px 0">Boveda privada</h2>
        </div>
        <button id="cqCloseVault" class="cq-tool-btn">X</button>
      </div>

      <p style="opacity:.7">Tus contenidos privados estan separados por usuario y protegidos con tu segunda contrasena.</p>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-top:22px">
        <button id="cqVaultNotes" class="cq-tool-btn cq-tool-main" style="padding:20px">Notas privadas</button>
        <button id="cqVaultPhotos" class="cq-tool-btn cq-tool-main" style="padding:20px">Fotos</button>
        <button id="cqVaultFiles" class="cq-tool-btn cq-tool-main" style="padding:20px">Archivos</button>
      </div>

      <div id="cqVaultContent" style="margin-top:20px"></div>
    </div>
  `

  document.body.appendChild(vaultOverlay)

  document.getElementById("cqCloseVault")!.onclick = () => vaultOverlay.remove()

  document.getElementById("cqVaultNotes")!.onclick = async () => {
    const content = document.getElementById("cqVaultContent")!

    content.innerHTML = `
      <div style="padding:18px;border:1px solid #354067;border-radius:16px">
        <h3 style="margin-top:0">Notas privadas</h3>
        <input id="cqPrivateNoteTitle" placeholder="Titulo" style="width:100%;padding:12px;margin-bottom:10px;border-radius:10px;border:1px solid #354067;background:#0b1026;color:white">
        <textarea id="cqPrivateNoteText" placeholder="Escribe tu nota privada..." style="width:100%;min-height:120px;padding:12px;border-radius:10px;border:1px solid #354067;background:#0b1026;color:white"></textarea>
        <button id="cqSavePrivateNote" class="cq-tool-btn cq-tool-main" style="margin-top:12px">Guardar nota privada</button>
        <div id="cqPrivateNotesList" style="margin-top:18px"></div>
      </div>
    `

    const loadPrivateNotes = async () => {
      const list = document.getElementById("cqPrivateNotesList")!
      list.innerHTML = "Cargando..."

      const res = await vaultFetch("/api/vault/items")
      const items = await res.json()

      if (!res.ok) {
        list.innerHTML = "No se pudieron cargar las notas."
        return
      }

      const noteItems = items.filter((x: any) => x.item_type === "note")
      const rendered: string[] = []

      for (const item of noteItems) {
        try {
          const plain = await decryptVaultData(
            item.encrypted_data,
            item.iv,
            item.auth_tag
          )

          const note = JSON.parse(plain)

          rendered.push(`
            <div style="padding:14px;margin-top:10px;border:1px solid #354067;border-radius:14px">
              <strong>${escapeHtml(note.title || "Sin titulo")}</strong>
              <div style="margin-top:8px;white-space:pre-wrap">${escapeHtml(note.text || "")}</div>
              <button class="cq-tool-btn cqDeletePrivateNote" data-id="${item.id}" style="margin-top:10px">Eliminar</button>
            </div>
          `)
        } catch {
          rendered.push("<div style='padding:12px'>No se pudo descifrar una nota.</div>")
        }
      }

      list.innerHTML = rendered.length ? rendered.join("") : "No tienes notas privadas."

      document.querySelectorAll<HTMLButtonElement>(".cqDeletePrivateNote").forEach(btn => {
        btn.onclick = async () => {
          if (!confirm("Eliminar esta nota privada?")) return

          await vaultFetch(`/api/vault/items/${btn.dataset.id}`, {
            method: "DELETE"
          })

          loadPrivateNotes()
        }
      })
    }

    document.getElementById("cqSavePrivateNote")!.onclick = async () => {
      const title = (document.getElementById("cqPrivateNoteTitle") as HTMLInputElement).value.trim()
      const text = (document.getElementById("cqPrivateNoteText") as HTMLTextAreaElement).value.trim()

      if (!text) {
        alert("Escribe algo en la nota.")
        return
      }

      const encrypted = await encryptVaultData(JSON.stringify({
        title,
        text
      }))

      const saveRes = await vaultFetch("/api/vault/items", {
        method: "POST",
        body: JSON.stringify({
          item_type: "note",
          name: title || "Nota privada",
          mime_type: "application/json",
          size_bytes: new TextEncoder().encode(text).length,
          encrypted_data: encrypted.encrypted_data,
          iv: encrypted.iv,
          auth_tag: encrypted.auth_tag,
          metadata_json: null
        })
      })

      if (!saveRes.ok) {
        alert("No se pudo guardar la nota.")
        return
      }

      ;(document.getElementById("cqPrivateNoteTitle") as HTMLInputElement).value = ""
      ;(document.getElementById("cqPrivateNoteText") as HTMLTextAreaElement).value = ""

      loadPrivateNotes()
    }

    loadPrivateNotes()
  }

  document.getElementById("cqVaultPhotos")!.onclick = async () => {
    const content = document.getElementById("cqVaultContent")!

    content.innerHTML = `
      <div style="padding:18px;border:1px solid #354067;border-radius:16px">
        <h3 style="margin-top:0">Fotos privadas</h3>
        <input id="cqPrivatePhotoInput" type="file" accept="image/*">
        <button id="cqUploadPrivatePhoto" class="cq-tool-btn cq-tool-main" style="margin-top:12px">Guardar foto</button>
        <div id="cqPrivatePhotosList" style="margin-top:18px"></div>
      </div>
    `

    const loadPhotos = async () => {
      const list = document.getElementById("cqPrivatePhotosList")!
      list.innerHTML = "Cargando..."

      const res = await vaultFetch("/api/vault/items")
      const items = await res.json()

      if (!res.ok) {
        list.innerHTML = "No se pudieron cargar las fotos."
        return
      }

      const photos = items.filter((x: any) => x.item_type === "photo")
      const rendered: string[] = []

      for (const item of photos) {
        try {
          const dataUrl = await decryptVaultData(item.encrypted_data, item.iv, item.auth_tag)

          rendered.push(`
  <div style="position:relative;aspect-ratio:1/1;overflow:hidden;border-radius:16px;background:#090d20">
    <img
      src="${dataUrl}"
      class="cq-private-photo-img"
      data-name="${escapeHtml(item.name || "Foto")}"
      style="width:100%;height:100%;object-fit:cover;display:block;cursor:pointer"
    >
    <button
      class="cq-tool-btn cqDeletePrivatePhoto"
      data-id="${item.id}"
      style="position:absolute;right:8px;bottom:8px;padding:7px 10px;background:rgba(0,0,0,.72);font-size:12px"
    >Eliminar</button>
  </div>
`)
        } catch {
          rendered.push("<div>No se pudo abrir una foto.</div>")
        }
      }

      list.style.display = "grid"
list.style.gridTemplateColumns = "repeat(2, minmax(0, 1fr))"
list.style.gap = "10px"
list.style.marginTop = "14px"

list.innerHTML = rendered.length ? rendered.join("") : `
  <div style="grid-column:1/-1;opacity:.65;padding:18px 0">
    No tienes fotos privadas.
  </div>
`

      document.querySelectorAll<HTMLImageElement>(".cq-private-photo-img").forEach(img => {
  img.onclick = () => {
    const viewer = document.createElement("div")

    viewer.style.cssText = `
      position:fixed;
      inset:0;
      z-index:99999;
      background:rgba(0,0,0,.97);
      display:flex;
      align-items:center;
      justify-content:center;
      padding:16px;
    `

    viewer.innerHTML = `
      <button
        class="cqPhotoViewerClose"
        style="
          position:absolute;
          top:18px;
          right:18px;
          width:44px;
          height:44px;
          border:0;
          border-radius:50%;
          background:rgba(255,255,255,.16);
          color:#fff;
          font-size:28px;
          cursor:pointer;
          z-index:2;
        "
      >×</button>

      <img
        src="${img.src}"
        alt="${img.dataset.name || "Foto"}"
        style="
          max-width:100%;
          max-height:94vh;
          width:auto;
          height:auto;
          object-fit:contain;
          display:block;
        "
      >
    `

    viewer.querySelector<HTMLButtonElement>(".cqPhotoViewerClose")!.onclick = () => viewer.remove()

    viewer.onclick = e => {
      if (e.target === viewer) viewer.remove()
    }

    document.body.appendChild(viewer)
  }
})
document.querySelectorAll<HTMLButtonElement>(".cqDeletePrivatePhoto").forEach(btn => {
        btn.onclick = async () => {
          if (!confirm("Eliminar esta foto privada?")) return
          await vaultFetch(`/api/vault/items/${btn.dataset.id}`, { method: "DELETE" })
          loadPhotos()
        }
      })
    }

    document.getElementById("cqUploadPrivatePhoto")!.onclick = async () => {
      const input = document.getElementById("cqPrivatePhotoInput") as HTMLInputElement
      const file = input.files?.[0]

      if (!file) {
        alert("Selecciona una foto.")
        return
      }

      if (file.size > 8 * 1024 * 1024) {
        alert("La foto no puede pasar de 8 MB.")
        return
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
      })

      const encrypted = await encryptVaultData(dataUrl)

      const saveRes = await vaultFetch("/api/vault/items", {
        method: "POST",
        body: JSON.stringify({
          item_type: "photo",
          name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
          encrypted_data: encrypted.encrypted_data,
          iv: encrypted.iv,
          auth_tag: encrypted.auth_tag,
          metadata_json: null
        })
      })

      if (!saveRes.ok) {
        alert("No se pudo guardar la foto.")
        return
      }

      input.value = ""
      loadPhotos()
    }

    loadPhotos()
  }

  document.getElementById("cqVaultFiles")!.onclick = async () => {
    const content = document.getElementById("cqVaultContent")!

    content.innerHTML = `
      <div style="padding:18px;border:1px solid #354067;border-radius:16px">
        <h3 style="margin-top:0">Archivos privados</h3>
        <input id="cqPrivateFileInput" type="file">
        <button id="cqUploadPrivateFile" class="cq-tool-btn cq-tool-main" style="margin-top:12px">Guardar archivo</button>
        <div id="cqPrivateFilesList" style="margin-top:18px"></div>
      </div>
    `

    const loadFiles = async () => {
      const list = document.getElementById("cqPrivateFilesList")!
      list.innerHTML = "Cargando..."

      const res = await vaultFetch("/api/vault/items")
      const items = await res.json()

      if (!res.ok) {
        list.innerHTML = "No se pudieron cargar los archivos."
        return
      }

      const files = items.filter((x: any) => x.item_type === "file")
      const rendered: string[] = []

      for (const item of files) {
        try {
          const dataUrl = await decryptVaultData(item.encrypted_data, item.iv, item.auth_tag)

          rendered.push(`
            <div style="padding:14px;margin-top:10px;border:1px solid #354067;border-radius:14px">
              <strong>${escapeHtml(item.name || "Archivo")}</strong>
              <div style="margin-top:10px">
                <a href="${dataUrl}" download="${escapeHtml(item.name || "archivo")}" class="cq-tool-btn">Abrir / guardar</a>
                <button class="cq-tool-btn cqDeletePrivateFile" data-id="${item.id}">Eliminar</button>
              </div>
            </div>
          `)
        } catch {
          rendered.push("<div>No se pudo abrir un archivo.</div>")
        }
      }

      list.innerHTML = rendered.length ? rendered.join("") : "No tienes archivos privados."

      document.querySelectorAll<HTMLButtonElement>(".cqDeletePrivateFile").forEach(btn => {
        btn.onclick = async () => {
          if (!confirm("Eliminar este archivo privado?")) return
          await vaultFetch(`/api/vault/items/${btn.dataset.id}`, { method: "DELETE" })
          loadFiles()
        }
      })
    }

    document.getElementById("cqUploadPrivateFile")!.onclick = async () => {
      const input = document.getElementById("cqPrivateFileInput") as HTMLInputElement
      const file = input.files?.[0]

      if (!file) {
        alert("Selecciona un archivo.")
        return
      }

      if (file.size > 8 * 1024 * 1024) {
        alert("El archivo no puede pasar de 8 MB.")
        return
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
      })

      const encrypted = await encryptVaultData(dataUrl)

      const saveRes = await vaultFetch("/api/vault/items", {
        method: "POST",
        body: JSON.stringify({
          item_type: "file",
          name: file.name,
          mime_type: file.type || "application/octet-stream",
          size_bytes: file.size,
          encrypted_data: encrypted.encrypted_data,
          iv: encrypted.iv,
          auth_tag: encrypted.auth_tag,
          metadata_json: null
        })
      })

      if (!saveRes.ok) {
        alert("No se pudo guardar el archivo.")
        return
      }

      input.value = ""
      loadFiles()
    }

    loadFiles()
  }
}
vaultBtn.onclick = async () => {
  try {
    const statusRes = await vaultFetch("/api/vault/status")
    const status = await statusRes.json()

    if (!statusRes.ok) {
      alert(status.error || "No se pudo consultar la boveda.")
      return
    }

    if (!status.configured) {
      const password = prompt("Crea la contrasena privada de tu boveda. Minimo 6 caracteres:")
      if (!password) return

      const confirmPassword = prompt("Repite la contrasena:")
      if (password !== confirmPassword) {
        alert("Las contrasenas no coinciden.")
        return
      }

      const setupRes = await vaultFetch("/api/vault/setup", {
        method: "POST",
        body: JSON.stringify({ password })
      })

      const setup = await setupRes.json()

      if (!setupRes.ok) {
        alert(setup.error || "No se pudo crear la boveda.")
        return
      }

      vaultKey = await deriveVaultKey(password, setup.salt)
      vaultUnlocked = true
      openVaultScreen()
      return
    }

    const password = prompt("Escribe la contrasena de tu boveda:")
    if (!password) return

    const unlockRes = await vaultFetch("/api/vault/unlock", {
      method: "POST",
      body: JSON.stringify({ password })
    })

    const unlock = await unlockRes.json()

    if (!unlockRes.ok) {
      alert(unlock.error || "Contrasena incorrecta.")
      return
    }

    vaultKey = await deriveVaultKey(password, unlock.salt)
    vaultUnlocked = true
    openVaultScreen()
  } catch (error) {
    console.error(error)
    alert("Error al abrir la boveda.")
  }
}
  document.body.appendChild(tools)

  const overlay = document.createElement('div')
  overlay.className = 'cq-notes-overlay'
  overlay.innerHTML = `
    <div class="cq-notes-box">
      <div class="cq-notes-head">
        <h2>📝 Mis notas</h2>
        <button id="cqCloseNotes" class="cq-tool-btn">✕</button>
      </div>

      <input id="cqNoteTitle" class="cq-note-input" placeholder="Título">
      <select id="cqNoteCategory" class="cq-note-select">
        <option value="General">General</option>
        <option value="Direcciones">Direcciones</option>
        <option value="Telefonía">Telefonía</option>
        <option value="Proxies">Proxies</option>
        <option value="Trabajo">Trabajo</option>
        <option value="Personal">Personal</option>
      </select>
      <textarea id="cqNoteText" class="cq-note-textarea"
        placeholder="Escribe aquí una dirección, dato, recordatorio o cualquier texto..."></textarea>

      <div class="cq-note-actions">
        <button id="cqSaveNote" class="cq-tool-btn cq-tool-main">+ Guardar nota</button>
      </div>

      <input id="cqSearchNotes" class="cq-note-input"
        placeholder="🔎 Buscar notas...">

      <div id="cqNotesList"></div>
    </div>
  `
  document.body.appendChild(overlay)

  const titleInput = overlay.querySelector<HTMLInputElement>('#cqNoteTitle')!
  const textInput = overlay.querySelector<HTMLTextAreaElement>('#cqNoteText')!
  const categoryInput = overlay.querySelector<HTMLSelectElement>('#cqNoteCategory')!
  const searchInput = overlay.querySelector<HTMLInputElement>('#cqSearchNotes')!
  const list = overlay.querySelector<HTMLDivElement>('#cqNotesList')!

  let editingId: number | null = null

  function renderNotes() {
    const q = searchInput.value.trim().toLowerCase()

    const filtered = [...notes]
      .filter(n =>
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.text.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
      )
      .sort((a,b) => Number(b.favorite) - Number(a.favorite))

    if (!filtered.length) {
      list.innerHTML = '<p style="opacity:.65;margin-top:18px">No hay notas guardadas.</p>'
      return
    }

    list.innerHTML = filtered.map(n => `
      <div class="cq-note-card">
        <h3>${n.favorite ? '⭐ ' : ''}${escapeHtml(n.title || 'Sin título')}</h3>
        <div class="cq-note-meta">${escapeHtml(n.category)}</div>
        <p>${escapeHtml(n.text)}</p>
        <div class="cq-note-actions">
          <button class="cq-tool-btn" data-action="favorite" data-id="${n.id}">
            ${n.favorite ? '★ Quitar favorito' : '☆ Favorito'}
          </button>
          <button class="cq-tool-btn" data-action="copy" data-id="${n.id}">📋 Copiar</button>
          <button class="cq-tool-btn" data-action="edit" data-id="${n.id}">✏️ Editar</button>
          <button class="cq-tool-btn" data-action="delete" data-id="${n.id}">🗑️ Eliminar</button>
        </div>
      </div>
    `).join('')
  }

  function escapeHtml(value: string) {
    return value
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'","&#039;")
  }

  notesBtn.onclick = () => {
    overlay.style.display = 'block'
    renderNotes()
  }

  overlay.querySelector<HTMLButtonElement>('#cqCloseNotes')!.onclick = () => {
    overlay.style.display = 'none'
  }

  overlay.querySelector<HTMLButtonElement>('#cqSaveNote')!.onclick = () => {
    const title = titleInput.value.trim()
    const text = textInput.value.trim()
    const category = categoryInput.value

    if (!text) {
      alert('Escribe algo en la nota.')
      return
    }

    if (editingId !== null) {
      const note = notes.find(n => n.id === editingId)
      if (note) {
        note.title = title
        note.text = text
        note.category = category
      }
      editingId = null
    } else {
      notes.push({
        id: Date.now(),
        title,
        text,
        category,
        favorite: false
      })
    }

    saveNotes()
    titleInput.value = ''
    textInput.value = ''
    categoryInput.value = 'General'
    renderNotes()
  }

  searchInput.addEventListener('input', renderNotes)

  list.addEventListener('click', async e => {
    const button = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-id]')
    if (!button) return

    const id = Number(button.dataset.id)
    const action = button.dataset.action
    const note = notes.find(n => n.id === id)
    if (!note) return

    if (action === 'favorite') {
      note.favorite = !note.favorite
      saveNotes()
      renderNotes()
    }

    if (action === 'copy') {
      await navigator.clipboard.writeText(note.text)
      alert('Nota copiada.')
    }

    if (action === 'edit') {
      editingId = id
      titleInput.value = note.title
      textInput.value = note.text
      categoryInput.value = note.category
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (action === 'delete') {
      if (!confirm('¿Eliminar esta nota?')) return
      notes = notes.filter(n => n.id !== id)
      saveNotes()
      renderNotes()
    }
  })

  logoutBtn.onclick = () => {
    localStorage.removeItem('cq-token')
    localStorage.removeItem('cq-user')
    window.location.href = '/login.html'
  }
})()


// ===== CONTROL AUTOMATICO DE SESION =====
async function cqValidateSession() {
  const token = localStorage.getItem('cq-token')

  if (!token) {
    window.location.replace('/login.html')
    return
  }

  try {
    const response = await fetch('/api/session', {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      localStorage.removeItem('cq-token')
      localStorage.removeItem('cq-user')
      window.location.replace('/login.html')
    }
  } catch {
    // Si solo hay una caída momentánea de Internet, no cerramos la sesión.
  }
}

cqValidateSession()
window.setInterval(cqValidateSession, 5000)




