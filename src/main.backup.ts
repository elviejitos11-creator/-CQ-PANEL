import './style.css'

type LinkItem = {
  id: number
  name: string
  url: string
  category: string
  icon: string
}

let links: LinkItem[] = JSON.parse(localStorage.getItem('cq-links') || '[]')

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


