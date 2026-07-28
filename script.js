// 1. Configuración y estado
const STORAGE_KEY = 'faro-landing-demo-preferences';
const defaultPreferences = {
    fontSize: 100,
    contrast: false,
    grayscale: false,
    readable: false,
};

// 2. Elementos del DOM
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-navigation');
const widgetPanel = document.querySelector('#widget-panel');
const openWidgetButtons = document.querySelectorAll('.js-open-widget');
const closeWidgetButton = document.querySelector('.js-close-widget');
const fontSizeControl = document.querySelector('#font-size');
const fontSizeValue = document.querySelector('#font-size-value');
const preferenceButtons = document.querySelectorAll('[data-preference]');
const resetButton = document.querySelector('#reset-preferences');
const saveStatus = document.querySelector('#save-status');

let preferences = loadPreferences();
let statusTimer;

// 3. Persistencia de preferencias
function loadPreferences() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        const savedFontSize = Number(saved?.fontSize);

        return {
            fontSize: savedFontSize >= 90 && savedFontSize <= 125 ? savedFontSize : defaultPreferences.fontSize,
            contrast: saved?.contrast === true,
            grayscale: saved?.grayscale === true,
            readable: saved?.readable === true,
        };
    } catch {
        return { ...defaultPreferences };
    }
}

function savePreferences(message = 'Preferencias de la demo guardadas.') {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
        saveStatus.textContent = message;
    } catch {
        saveStatus.textContent = 'Los cambios se aplicaron, pero no pudieron guardarse.';
    }

    window.clearTimeout(statusTimer);
    statusTimer = window.setTimeout(() => {
        saveStatus.textContent = '';
    }, 2600);
}

// 4. Aplicación de preferencias
function applyPreferences() {
    document.documentElement.style.setProperty('--font-scale', preferences.fontSize / 100);
    document.body.classList.toggle('is-high-contrast', preferences.contrast);
    document.body.classList.toggle('is-grayscale', preferences.grayscale);
    document.body.classList.toggle('is-readable', preferences.readable);

    fontSizeControl.value = preferences.fontSize;
    fontSizeValue.value = `${preferences.fontSize}%`;

    preferenceButtons.forEach((button) => {
        const key = button.dataset.preference;
        button.setAttribute('aria-pressed', String(Boolean(preferences[key])));
    });
}

// 5. Apertura y cierre del panel
function openWidget() {
    if (!widgetPanel.open) {
        widgetPanel.showModal();
    }
}

function closeWidget() {
    if (widgetPanel.open) {
        widgetPanel.close();
    }
}

// 6. Navegación móvil
menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    navigation.classList.toggle('is-open', !isOpen);
    menuButton.querySelector('.sr-only').textContent = isOpen ? 'Abrir menú' : 'Cerrar menú';
});

navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
        navigation.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.querySelector('.sr-only').textContent = 'Abrir menú';
    });
});

// 7. Interacciones del panel de demostración
openWidgetButtons.forEach((button) => button.addEventListener('click', openWidget));
closeWidgetButton.addEventListener('click', closeWidget);

widgetPanel.addEventListener('click', (event) => {
    if (event.target === widgetPanel) {
        closeWidget();
    }
});

widgetPanel.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeWidget();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && widgetPanel.open) {
        event.preventDefault();
        closeWidget();
    }
});

// 8. Controles de accesibilidad
fontSizeControl.addEventListener('input', () => {
    preferences.fontSize = Number(fontSizeControl.value);
    applyPreferences();
    savePreferences();
});

preferenceButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const key = button.dataset.preference;
        preferences[key] = !preferences[key];
        applyPreferences();
        savePreferences();
    });
});

resetButton.addEventListener('click', () => {
    preferences = { ...defaultPreferences };
    applyPreferences();

    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // La demo puede seguir funcionando aunque el navegador bloquee el almacenamiento.
    }

    saveStatus.textContent = 'Preferencias restablecidas.';
});

// 9. Inicialización
applyPreferences();
