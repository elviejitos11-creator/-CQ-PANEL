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

function saveLinks() {
  localStorage.setItem('cq-links', JSON.stringify(links))
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
    <article class="card">
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

function deleteEvents() {
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

  const logoutBtn = document.createElement('button')
  logoutBtn.className = 'cq-tool-btn'
  logoutBtn.textContent = '🚪 Cerrar sesión'

  tools.append(notesBtn, logoutBtn)
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
