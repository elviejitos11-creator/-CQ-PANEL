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




