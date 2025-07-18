// js/settingsManager.js
const SETTINGS_KEYS = {
    HSK_LEVELS: 'hskLevels',
    QUANTITY: 'quantity',
    SHOW_PINYIN: 'showPinyin',
    DARK_MODE: 'darkMode'
};

let currentSettings = {
    savedLevels: ['1'],
    savedQuantity: '20',
    showPinyin: true,
    darkMode: true
};

export const getSetting = (key) => currentSettings[key];

export const setSetting = (key, value) => {
    currentSettings[key] = value;
    try {
        if (typeof value === 'boolean' || typeof value === 'number') {
            localStorage.setItem(SETTINGS_KEYS[key], value.toString());
        } else if (Array.isArray(value)) {
            localStorage.setItem(SETTINGS_KEYS[key], JSON.stringify(value));
        } else {
            localStorage.setItem(SETTINGS_KEYS[key], value);
        }
    } catch (e) {
        console.error(`Error saving setting '${key}' to local storage:`, e);
    }
};

export const loadSettings = (domElements) => {
    try {
        const darkModeEnabled = localStorage.getItem(SETTINGS_KEYS.DARK_MODE);
        if (darkModeEnabled === null) {
            document.body.classList.add('dark-mode');
            if (domElements.darkMode) domElements.darkMode.checked = true;
            setSetting('darkMode', true);
        } else {
            const isDarkMode = darkModeEnabled === 'true';
            document.body.classList.toggle('dark-mode', isDarkMode);
            if (domElements.darkMode) domElements.darkMode.checked = isDarkMode;
            setSetting('darkMode', isDarkMode);
        }

        const savedLevels = JSON.parse(localStorage.getItem(SETTINGS_KEYS.HSK_LEVELS));
        if (savedLevels && savedLevels.length > 0) {
            setSetting('savedLevels', savedLevels);
            document.querySelectorAll('input[name="hsk-level"]').forEach(cb => {
                cb.checked = savedLevels.includes(cb.value);
            });
        } else {
            const defaultHsk1 = document.querySelector('input[name="hsk-level"][value="1"]');
            if (defaultHsk1) defaultHsk1.checked = true;
            setSetting('savedLevels', ['1']);
        }

        const savedQuantity = localStorage.getItem(SETTINGS_KEYS.QUANTITY);
        if (savedQuantity) {
            setSetting('savedQuantity', savedQuantity);
            const quantityRadio = document.querySelector(`input[name="quantity"][value="${savedQuantity}"]`);
            if (quantityRadio) quantityRadio.checked = true;
        } else {
            const defaultQuantity20 = document.querySelector('input[name="quantity"][value="20"]');
            if (defaultQuantity20) defaultQuantity20.checked = true;
            setSetting('savedQuantity', '20');
        }

        const showPinyin = localStorage.getItem(SETTINGS_KEYS.SHOW_PINYIN);
        if (showPinyin !== null) {
            const isPinyinVisible = showPinyin === 'true';
            setSetting('showPinyin', isPinyinVisible);
            if (domElements.pinyin) domElements.pinyin.checked = isPinyinVisible;
        } else {
            setSetting('showPinyin', true);
            if (domElements.pinyin) domElements.pinyin.checked = true;
        }

    } catch (e) {
        console.error("Failed to load settings from local storage, falling back to defaults:", e);
        setSetting('savedLevels', ['1']);
        setSetting('savedQuantity', '20');
        setSetting('showPinyin', true);
        setSetting('darkMode', true);

        document.body.classList.add('dark-mode');
        if (domElements.darkMode) domElements.darkMode.checked = true;
        const defaultHsk1 = document.querySelector('input[name="hsk-level"][value="1"]');
        if (defaultHsk1) defaultHsk1.checked = true;
        const defaultQuantity20 = document.querySelector('input[name="quantity"][value="20"]');
        if (defaultQuantity20) defaultQuantity20.checked = true;
        if (domElements.pinyin) domElements.pinyin.checked = true;
    }
};

export const saveCurrentSettings = () => {
    const selectedLevels = Array.from(document.querySelectorAll('input[name="hsk-level"]:checked')).map(cb => cb.value);
    const selectedQuantity = document.querySelector('input[name="quantity"]:checked')?.value || '20';
    const showPinyin = document.getElementById('pinyin-toggle')?.checked || false;
    const darkMode = document.body.classList.contains('dark-mode');

    setSetting('savedLevels', selectedLevels);
    setSetting('savedQuantity', selectedQuantity);
    setSetting('showPinyin', showPinyin);
    setSetting('darkMode', darkMode);
};