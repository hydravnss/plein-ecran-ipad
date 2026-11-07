/**
 * Plein Écran iPad — occuper tout l’écran de l’iPad (10e génération et tablettes similaires).
 *
 * SillyTavern passe en mise en page « bureau » au-delà de 1000 px de large :
 * l’iPad 10 en paysage (1180×820) se retrouve alors avec une colonne de chat
 * à --sheldWidth (50 vw par défaut), centrée, et de grands bords vides.
 * Cette extension force largeur et hauteur pleines sur les tablettes tactiles,
 * sans toucher à la mise en page iPhone.
 */

const MODULE_NAME = 'plein_ecran_ipad';
const LOG = '[Plein Écran iPad]';
const BODY_CLASS = 'ipe-on';

const defaultSettings = Object.freeze({
    enabled: true,
});

const ctx = () => SillyTavern.getContext();
const save = () => ctx().saveSettingsDebounced();

let settings = null;
let viewportBound = false;

function loadSettings() {
    const store = ctx().extensionSettings;
    store[MODULE_NAME] = Object.assign({}, defaultSettings, store[MODULE_NAME] || {});
    settings = store[MODULE_NAME];
}

function isPhoneUa() {
    return /iPhone|iPod|Android.+Mobile|Windows Phone/i.test(navigator.userAgent || '');
}

function isTablet() {
    if (isPhoneUa()) {
        return false;
    }

    const width = window.innerWidth || document.documentElement.clientWidth || 0;
    const height = window.innerHeight || document.documentElement.clientHeight || 0;
    const minSide = Math.min(width, height);
    const maxSide = Math.max(width, height);
    const touchPoints = Number(navigator.maxTouchPoints) || 0;
    const touch = touchPoints > 1 || 'ontouchend' in document;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const iPadOs = /iPad/i.test(navigator.userAgent || '')
        || (navigator.platform === 'MacIntel' && touchPoints > 1);

    // iPad mini ~744×1133 jusqu’à iPad Pro 12,9" 1024×1366.
    // L’iPad 10e gén. est 820×1180 (portrait) / 1180×820 (paysage).
    const tabletBox = minSide >= 700 && maxSide <= 1400 && width >= 700;
    return (iPadOs || touch || coarse) && tabletBox;
}

function syncViewportHeight() {
    const raw = (window.visualViewport && window.visualViewport.height)
        || window.innerHeight
        || document.documentElement.clientHeight
        || 0;
    if (raw > 0) {
        document.documentElement.style.setProperty('--ipe-vvh', `${Math.round(raw)}px`);
    }
}

function clearViewportHeight() {
    document.documentElement.style.removeProperty('--ipe-vvh');
}

function ensureMeta(name, content) {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (el) {
        return el;
    }
    el = document.createElement('meta');
    el.setAttribute('name', name);
    el.setAttribute('content', content);
    el.dataset.ipe = '1';
    document.head.appendChild(el);
    return el;
}

function ensureViewportFit() {
    const el = document.querySelector('meta[name="viewport"]');
    if (!el) {
        return;
    }
    const current = el.getAttribute('content') || '';
    if (!/viewport-fit\s*=\s*cover/i.test(current)) {
        el.setAttribute('content', `${current}${current ? ', ' : ''}viewport-fit=cover`);
        el.dataset.ipeViewport = '1';
    }
}

function ensureFullscreenMetas() {
    ensureViewportFit();
    ensureMeta('apple-mobile-web-app-capable', 'yes');
    ensureMeta('mobile-web-app-capable', 'yes');
    ensureMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
}

function removeInjectedMetas() {
    document.querySelectorAll('meta[data-ipe="1"]').forEach((el) => el.remove());
}

function onViewportChange() {
    apply();
}

function bindViewport() {
    if (viewportBound) {
        return;
    }
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('orientationchange', onViewportChange);
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', onViewportChange);
        window.visualViewport.addEventListener('scroll', onViewportChange);
    }
    viewportBound = true;
}

function unbindViewport() {
    if (!viewportBound) {
        return;
    }
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('orientationchange', onViewportChange);
    if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', onViewportChange);
        window.visualViewport.removeEventListener('scroll', onViewportChange);
    }
    viewportBound = false;
}

function apply() {
    const on = !!(settings && settings.enabled) && isTablet();
    document.body.classList.toggle(BODY_CLASS, on);
    if (on) {
        syncViewportHeight();
        ensureFullscreenMetas();
        bindViewport();
    } else {
        clearViewportHeight();
        removeInjectedMetas();
        if (!(settings && settings.enabled)) {
            unbindViewport();
        } else {
            bindViewport();
        }
    }
}

const SETTINGS_HTML = `
<div id="ipe_settings" class="extension_container">
  <div class="inline-drawer">
    <div class="inline-drawer-toggle inline-drawer-header">
      <b>Plein Écran iPad</b>
      <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
    </div>
    <div class="inline-drawer-content">
      <div class="ipe-hint">Fait occuper tout l’écran à SillyTavern sur iPad (10e génération et tablettes similaires), en portrait comme en paysage. Sans effet sur iPhone.</div>
      <div class="ipe-row">
        <label for="ipe_enabled">Activer</label>
        <input type="checkbox" id="ipe_enabled">
      </div>
    </div>
  </div>
</div>`;

function bindSettingsUi() {
    const box = document.getElementById('ipe_enabled');
    if (!box) {
        return;
    }
    box.checked = !!(settings && settings.enabled);
    box.addEventListener('input', () => {
        settings.enabled = box.checked;
        save();
        apply();
    });
}

jQuery(async () => {
    loadSettings();
    window.jQuery('#extensions_settings2').append(SETTINGS_HTML);
    bindSettingsUi();
    apply();

    try {
        const { eventSource, event_types } = ctx();
        eventSource.on(event_types.APP_READY, apply);
        eventSource.on(event_types.SETTINGS_LOADED_AFTER, () => {
            loadSettings();
            apply();
        });
    } catch (err) {
        console.debug(LOG, 'évènements indisponibles', err);
    }
    console.log(LOG, 'chargé');
});
