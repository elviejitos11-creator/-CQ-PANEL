const API = window.location.origin

function getDeviceId(): string {
  let deviceId = localStorage.getItem('cq-device-id')

  if (!deviceId) {
    deviceId = crypto.randomUUID()
    localStorage.setItem('cq-device-id', deviceId)
  }

  return deviceId
}

document.body.innerHTML = `
  <div class="cq-login">
    <div class="login-glow glow-one"></div>
    <div class="login-glow glow-two"></div>

    <div class="login-box">
      <div class="login-logo">â™›</div>

      <p class="login-small">ACCESO PRIVADO</p>
      <h1>CQ <span>PANEL</span></h1>
      <p class="login-subtitle">Tu centro de control personal</p>

      <form id="loginForm">
        <label>Usuario</label>
        <input
          id="username"
          type="text"
          autocomplete="username"
          placeholder="Escribe tu usuario"
          required
        >

        <label>ContraseÃ±a</label>

        <div class="password-box">
          <input
            id="password"
            type="password"
            autocomplete="current-password"
            placeholder="Escribe tu contraseÃ±a"
            required
          >

          <button id="showPassword" type="button">ðŸ‘</button>
        </div>

        <button class="login-button" id="loginButton" type="submit">
          ENTRAR AL PANEL
        </button>

        <div id="loginMessage"></div>
      </form>

      <div class="secure-line">
        <span></span>
        LICENCIA PROTEGIDA
        <span></span>
      </div>
    </div>
  </div>
`

const style = document.createElement('style')

style.textContent = `
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: Inter, "Segoe UI", Arial, sans-serif;
  background:
    radial-gradient(circle at 15% 20%, rgba(0, 102, 255, .25), transparent 32%),
    radial-gradient(circle at 85% 80%, rgba(218, 0, 255, .22), transparent 35%),
    #020512;
  color: white;
}

.cq-login {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 25px;
  position: relative;
  overflow: hidden;
}

.login-glow {
  position: absolute;
  width: 450px;
  height: 450px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: .35;
}

.glow-one {
  background: #006eff;
  left: -200px;
  top: -180px;
}

.glow-two {
  background: #d900ff;
  right: -200px;
  bottom: -180px;
}

.login-box {
  width: 100%;
  max-width: 430px;
  padding: 46px 38px;
  border-radius: 28px;
  background:
    linear-gradient(
      145deg,
      rgba(15, 20, 50, .94),
      rgba(17, 8, 40, .96)
    );
  border: 1px solid rgba(107, 122, 255, .35);
  box-shadow:
    0 0 80px rgba(49, 79, 255, .18),
    0 0 120px rgba(190, 0, 255, .08);
  position: relative;
  z-index: 2;
}

.login-logo {
  width: 76px;
  height: 76px;
  margin: 0 auto 20px;
  border-radius: 22px;
  display: grid;
  place-items: center;
  font-size: 38px;
  background: linear-gradient(135deg, #087cff, #762cff, #ec00ff);
  box-shadow: 0 0 35px rgba(83, 72, 255, .5);
}

.login-small {
  text-align: center;
  margin: 0 0 8px;
  font-size: 11px;
  letter-spacing: 4px;
  color: #7aa8ff;
  font-weight: 800;
}

.login-box h1 {
  text-align: center;
  margin: 0;
  font-size: 38px;
  letter-spacing: -1px;
}

.login-box h1 span {
  background: linear-gradient(90deg, #1697ff, #9c49ff, #ff28da);
  -webkit-background-clip: text;
  color: transparent;
}

.login-subtitle {
  text-align: center;
  color: #8e94b5;
  margin: 8px 0 34px;
}

label {
  display: block;
  margin: 18px 0 8px;
  color: #b9bee0;
  font-size: 13px;
  font-weight: 700;
}

input {
  width: 100%;
  height: 54px;
  border-radius: 14px;
  border: 1px solid #252d55;
  background: #080d21;
  color: white;
  padding: 0 16px;
  outline: none;
  font-size: 15px;
}

input:focus {
  border-color: #4d7cff;
  box-shadow: 0 0 0 3px rgba(65, 102, 255, .12);
}

.password-box {
  position: relative;
}

.password-box input {
  padding-right: 55px;
}

#showPassword {
  position: absolute;
  right: 8px;
  top: 7px;
  width: 40px;
  height: 40px;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: white;
}

.login-button {
  width: 100%;
  height: 56px;
  border: 0;
  border-radius: 15px;
  margin-top: 27px;
  cursor: pointer;
  color: white;
  font-weight: 900;
  letter-spacing: 1px;
  background: linear-gradient(90deg, #087cff, #653cff, #df19ee);
  box-shadow: 0 12px 35px rgba(81, 61, 255, .28);
}

.login-button:disabled {
  opacity: .6;
  cursor: wait;
}

#loginMessage {
  min-height: 25px;
  margin-top: 16px;
  text-align: center;
  font-size: 13px;
  color: #ff6d91;
}

.secure-line {
  margin-top: 23px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #626a91;
  font-size: 10px;
  letter-spacing: 2px;
  justify-content: center;
}

.secure-line span {
  width: 45px;
  height: 1px;
  background: #242c50;
}

@media (max-width: 520px) {
  .login-box {
    padding: 38px 24px;
    border-radius: 23px;
  }

  .login-box h1 {
    font-size: 32px;
  }
}
`

document.head.appendChild(style)

const form = document.querySelector<HTMLFormElement>('#loginForm')!
const username = document.querySelector<HTMLInputElement>('#username')!
const password = document.querySelector<HTMLInputElement>('#password')!
const message = document.querySelector<HTMLDivElement>('#loginMessage')!
const button = document.querySelector<HTMLButtonElement>('#loginButton')!
const showPassword = document.querySelector<HTMLButtonElement>('#showPassword')!

showPassword.addEventListener('click', () => {
  password.type = password.type === 'password' ? 'text' : 'password'
})

form.addEventListener('submit', async (event) => {
  event.preventDefault()

  message.textContent = ''
  button.disabled = true
  button.textContent = 'VERIFICANDO...'

  try {
    const response = await fetch(`${API}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value.trim(),
        password: password.value,
        deviceId: getDeviceId()
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'No se pudo iniciar sesiÃ³n.')
    }

    localStorage.setItem('cq-token', data.token)
    localStorage.setItem('cq-user', JSON.stringify(data.user))

    window.location.href = '/index.html'
  } catch (error) {
    message.textContent =
      error instanceof Error
        ? error.message
        : 'Error al conectar con CQ PANEL.'
  } finally {
    button.disabled = false
    button.textContent = 'ENTRAR AL PANEL'
  }
})
