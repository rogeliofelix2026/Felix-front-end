const STORAGE_KEY = 'faro-landing-full-demo';

const defaultState = {
    fontFamily: 'default',
    textSize: 'normal',
    alignment: 'left',
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: false,
    highContrast: false,
    darkMode: false,
    voice: false,
    voiceSpeed: 50,
    voiceVolume: 100,
    position: 'right',
    activeProfile: null,
};

const root = document.querySelector('#faro-extension-root');
const mainContent = document.querySelector('main');
const faroButton = document.querySelector('#btnFlotante');
const mainMenu = document.querySelector('#menuAccesibilidad');
const submenus = document.querySelectorAll('.sub-menu-container');
const openWidgetButtons = document.querySelectorAll('.js-open-widget');
const demoStatus = document.querySelector('#faro-demo-status');
const resetDialog = document.querySelector('#faro-reset-dialog');
const voiceControls = document.querySelector('#faro-voice-controls');
const pauseResumeButton = document.querySelector('#faro-btn-pause-resume');
const pauseResumeIcon = document.querySelector('#faro-icon-pause-resume');
const stopVoiceButton = document.querySelector('#faro-btn-stop');
const mobileMenuButton = document.querySelector('.menu-toggle');
const mainNavigation = document.querySelector('.main-navigation');

let state = loadState();

function loadState() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return { ...defaultState, ...saved };
    } catch {
        return { ...defaultState };
    }
}

function saveState(message = 'Preferencias guardadas en este navegador.') {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        announce(message);
    } catch {
        announce('Los cambios se aplicaron, pero el navegador no permitió guardarlos.');
    }
}

function announce(message) {
    demoStatus.textContent = '';
    window.requestAnimationFrame(() => {
        demoStatus.textContent = message;
    });
}

function closeFaro() {
    mainMenu.style.display = 'none';
    mainMenu.setAttribute('aria-hidden', 'true');
    submenus.forEach((submenu) => {
        submenu.style.display = 'none';
        submenu.setAttribute('aria-hidden', 'true');
    });
    root.classList.remove('is-open');
    faroButton.setAttribute('aria-expanded', 'false');
    faroButton.focus();
}

function showMainMenu() {
    submenus.forEach((submenu) => {
        submenu.style.display = 'none';
        submenu.setAttribute('aria-hidden', 'true');
    });
    mainMenu.style.display = 'flex';
    mainMenu.setAttribute('aria-hidden', 'false');
    root.classList.add('is-open');
    faroButton.setAttribute('aria-expanded', 'true');
    window.setTimeout(() => mainMenu.querySelector('button')?.focus(), 40);
}

function openSubmenu(id) {
    const target = document.querySelector(`#${id}`);
    if (!target) return;

    mainMenu.style.display = 'none';
    mainMenu.setAttribute('aria-hidden', 'true');
    submenus.forEach((submenu) => {
        const isTarget = submenu === target;
        submenu.style.display = isTarget ? 'block' : 'none';
        submenu.setAttribute('aria-hidden', String(!isTarget));
    });
    root.classList.add('is-open');
    faroButton.setAttribute('aria-expanded', 'true');
    window.setTimeout(() => target.querySelector('button, select, input')?.focus(), 40);
}

function toggleFaro() {
    if (root.classList.contains('is-open')) {
        closeFaro();
    } else {
        showMainMenu();
    }
}

function updateOutput(controlId, outputId) {
    const control = document.querySelector(`#${controlId}`);
    const output = document.querySelector(`#${outputId}`);
    if (!control || !output) return;
    const value = Number(control.value);
    output.value = value === 100 ? 'Estándar' : `${value}%`;
    output.textContent = output.value;
}

function applyState() {
    document.documentElement.style.setProperty(
        '--font-scale',
        state.textSize === 'small' ? '.9' : state.textSize === 'large' ? '1.15' : '1'
    );

    document.body.classList.remove(
        'faro-font-sans',
        'faro-font-serif',
        'faro-font-dyslexic',
        'faro-align-left',
        'faro-align-center',
        'faro-align-right'
    );
    if (state.fontFamily !== 'default') {
        document.body.classList.add(`faro-font-${state.fontFamily}`);
    }
    document.body.classList.add(`faro-align-${state.alignment}`);
    document.body.classList.toggle('is-high-contrast', state.highContrast);
    document.body.classList.toggle('is-dark-demo', state.darkMode);

    mainContent.style.filter = [
        `brightness(${state.brightness / 100})`,
        `contrast(${state.contrast / 100})`,
        `saturate(${state.saturation / 100})`,
        `grayscale(${state.grayscale ? 1 : 0})`,
    ].join(' ');

    root.classList.toggle('faro-demo-left', state.position === 'left');
    document.querySelector('#demo-font-family').value = state.fontFamily;

    document.querySelectorAll('[data-text-size]').forEach((button) => {
        button.classList.toggle('active', button.dataset.textSize === state.textSize);
        button.setAttribute('aria-pressed', String(button.dataset.textSize === state.textSize));
    });
    document.querySelectorAll('[data-alignment]').forEach((button) => {
        button.classList.toggle('active', button.dataset.alignment === state.alignment);
        button.setAttribute('aria-pressed', String(button.dataset.alignment === state.alignment));
    });
    document.querySelectorAll('[data-profile]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.profile === state.activeProfile));
    });
    document.querySelectorAll('[data-toggle]').forEach((control) => {
        control.checked = Boolean(state[control.dataset.toggle]);
    });

    document.querySelector('#brightness-control').value = state.brightness;
    document.querySelector('#contrast-control').value = state.contrast;
    document.querySelector('#saturation-control').value = state.saturation;
    document.querySelector('#voice-speed').value = state.voiceSpeed;
    document.querySelector('#voice-volume').value = state.voiceVolume;
    updateOutput('brightness-control', 'brightness-output');
    updateOutput('contrast-control', 'contrast-output');
    updateOutput('saturation-control', 'saturation-output');
}

function speak(text) {
    if (!('speechSynthesis' in window) || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.trim().slice(0, 600));
    utterance.lang = 'es-AR';
    utterance.rate = .6 + (state.voiceSpeed / 100) * 1.4;
    utterance.volume = state.voiceVolume / 100;
    utterance.onstart = () => {
        voiceControls.classList.add('active');
        pauseResumeIcon.textContent = 'pause';
        pauseResumeButton.setAttribute('aria-label', 'Pausar lectura');
    };
    utterance.onend = () => voiceControls.classList.remove('active');
    utterance.onerror = () => voiceControls.classList.remove('active');
    window.speechSynthesis.speak(utterance);
}

function applyProfile(profile) {
    const position = state.position;
    state = { ...defaultState, position, activeProfile: profile };

    if (profile === 'color') state.grayscale = true;
    if (profile === 'voice') state.voice = true;
    if (profile === 'fonts') {
        state.fontFamily = 'dyslexic';
        state.textSize = 'large';
    }
    if (profile === 'safety') {
        state.brightness = 80;
        state.contrast = 90;
        state.saturation = 60;
    }
    if (profile === 'visibility') {
        state.highContrast = true;
        state.textSize = 'large';
    }
    if (profile === 'focus') {
        state.darkMode = true;
        state.textSize = 'large';
    }

    applyState();
    saveState('Perfil aplicado en la demo.');
    if (profile === 'voice') {
        speak('Perfil de asistencia por voz activado.');
    }
}

openWidgetButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
        if (button === faroButton) {
            toggleFaro();
        } else {
            showMainMenu();
        }
        event.stopPropagation();
    });
});

document.querySelectorAll('[data-open-submenu]').forEach((button) => {
    button.addEventListener('click', () => openSubmenu(button.dataset.openSubmenu));
});
document.querySelectorAll('[data-back-main]').forEach((button) => {
    button.addEventListener('click', showMainMenu);
});
document.querySelectorAll('[data-close-faro]').forEach((button) => {
    button.addEventListener('click', closeFaro);
});

document.querySelectorAll('[data-profile]').forEach((button) => {
    button.addEventListener('click', () => applyProfile(button.dataset.profile));
});

document.querySelectorAll('[data-toggle]').forEach((control) => {
    control.addEventListener('change', () => {
        const key = control.dataset.toggle;
        state[key] = control.checked;
        state.activeProfile = null;
        applyState();
        saveState();
        if (key === 'voice') {
            if (state.voice) {
                speak('Asistencia por voz activada. Seleccioná un texto de la landing para escucharlo.');
            } else if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                voiceControls.classList.remove('active');
            }
        }
    });
});

document.querySelector('#demo-font-family').addEventListener('change', (event) => {
    state.fontFamily = event.target.value;
    state.activeProfile = null;
    applyState();
    saveState();
});

document.querySelectorAll('[data-text-size]').forEach((button) => {
    button.addEventListener('click', () => {
        state.textSize = button.dataset.textSize;
        state.activeProfile = null;
        applyState();
        saveState();
    });
});

document.querySelectorAll('[data-alignment]').forEach((button) => {
    button.addEventListener('click', () => {
        state.alignment = button.dataset.alignment;
        state.activeProfile = null;
        applyState();
        saveState();
    });
});

[
    ['brightness-control', 'brightness'],
    ['contrast-control', 'contrast'],
    ['saturation-control', 'saturation'],
    ['voice-speed', 'voiceSpeed'],
    ['voice-volume', 'voiceVolume'],
].forEach(([id, key]) => {
    document.querySelector(`#${id}`).addEventListener('input', (event) => {
        state[key] = Number(event.target.value);
        state.activeProfile = null;
        applyState();
        saveState();
    });
});

document.querySelector('#toggle-widget-position').addEventListener('click', () => {
    state.position = state.position === 'right' ? 'left' : 'right';
    applyState();
    saveState('Posición del widget actualizada.');
});

document.querySelector('#request-demo-reset').addEventListener('click', () => resetDialog.showModal());
document.querySelector('#cancel-demo-reset').addEventListener('click', () => resetDialog.close());
document.querySelector('#confirm-demo-reset').addEventListener('click', () => {
    state = { ...defaultState };
    localStorage.removeItem(STORAGE_KEY);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    voiceControls.classList.remove('active');
    resetDialog.close();
    applyState();
    showMainMenu();
    announce('Preferencias de la demo restablecidas.');
});

pauseResumeButton.addEventListener('click', () => {
    if (!('speechSynthesis' in window)) return;
    if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        pauseResumeIcon.textContent = 'pause';
        pauseResumeButton.setAttribute('aria-label', 'Pausar lectura');
    } else {
        window.speechSynthesis.pause();
        pauseResumeIcon.textContent = 'play_arrow';
        pauseResumeButton.setAttribute('aria-label', 'Reanudar lectura');
    }
});

stopVoiceButton.addEventListener('click', () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    voiceControls.classList.remove('active');
});

document.addEventListener('click', (event) => {
    if (!state.voice || event.target.closest('#faro-extension-root') || event.target.closest('.js-open-widget')) return;
    const readableTarget = event.target.closest('h1, h2, h3, p, a, li');
    if (readableTarget) speak(readableTarget.innerText);
});

document.addEventListener('keydown', (event) => {
    if (event.altKey && event.shiftKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        toggleFaro();
    }
    if (event.key === 'Escape' && root.classList.contains('is-open') && !resetDialog.open) {
        event.preventDefault();
        closeFaro();
    }
});

mobileMenuButton.addEventListener('click', () => {
    const isOpen = mobileMenuButton.getAttribute('aria-expanded') === 'true';
    mobileMenuButton.setAttribute('aria-expanded', String(!isOpen));
    mainNavigation.classList.toggle('is-open', !isOpen);
    mobileMenuButton.querySelector('.sr-only').textContent = isOpen ? 'Abrir menú' : 'Cerrar menú';
});

mainNavigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
        mainNavigation.classList.remove('is-open');
        mobileMenuButton.setAttribute('aria-expanded', 'false');
        mobileMenuButton.querySelector('.sr-only').textContent = 'Abrir menú';
    });
});

applyState();
closeFaro();
