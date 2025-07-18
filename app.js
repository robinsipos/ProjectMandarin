// js/app.js
import * as DataManager from './dataManager.js';
import * as UIManager from './uiManager.js';
import * as SettingsManager from './settingsManager.js';
import * as QuizLogic from './quizLogic.js';

const App = (() => {
    let dom = {}; // Local reference to DOM elements

    const init = async () => {
        try {
            dom = UIManager.cacheDomElements(); // Populate UIManager's internal dom object and get reference
            await DataManager.loadVocabData(); // Load vocabulary data asynchronously
            SettingsManager.loadSettings(dom.toggles); // Load settings and update UI toggles
            setupEventListeners();
            UIManager.showScreen('mainMenu');
        } catch (error) {
            console.error("Fatal Error during application initialization:", error.message);
            document.body.innerHTML = "<p style='color:red; text-align:center; font-size:1.5rem;'>Application Error: Missing critical components. Please refresh the page.</p>";
        }
    };

    const setupEventListeners = () => {
        dom.toggles.darkMode.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode', dom.toggles.darkMode.checked);
            SettingsManager.setSetting('darkMode', dom.toggles.darkMode.checked);
        });

        dom.buttons.startNewQuiz.addEventListener('click', () => UIManager.showScreen('quizSettings'));
        dom.buttons.settings.addEventListener('click', () => UIManager.showScreen('settings'));
        dom.buttons.about.addEventListener('click', () => UIManager.toggleModal('about', true));

        dom.buttons.startQuiz.addEventListener('click', () => QuizLogic.initializeQuiz(false));
        dom.buttons.backToMainFromQuizSetup.addEventListener('click', () => UIManager.showScreen('mainMenu'));

        document.querySelectorAll('input[name="hsk-level"], input[name="quantity"]').forEach(input => {
            input.addEventListener('change', SettingsManager.saveCurrentSettings);
        });

        dom.toggles.pinyin.addEventListener('change', () => {
            SettingsManager.setSetting('showPinyin', dom.toggles.pinyin.checked);
            const currentQuestion = QuizLogic.getQuizState().currentQuestion;
            if (currentQuestion) {
                UIManager.updatePinyinDisplay(currentQuestion.pinyin, SettingsManager.getSetting('showPinyin'));
            }
        });

        dom.buttons.endQuiz.addEventListener('click', () => UIManager.toggleModal('confirmQuit', true));

        dom.buttons.closeAbout.addEventListener('click', () => UIManager.toggleModal('about', false));
        dom.buttons.closeHint.addEventListener('click', () => {
            UIManager.toggleModal('hint', false);
            QuizLogic.loadQuestion();
        });
        dom.buttons.cancelQuit.addEventListener('click', () => UIManager.toggleModal('confirmQuit', false));
        dom.buttons.confirmQuit.addEventListener('click', () => {
            UIManager.toggleModal('confirmQuit', false);
            UIManager.showScreen('mainMenu');
        });

        Object.values(dom.modals).forEach(modal => {
            modal?.addEventListener('click', (e) => {
                if (e.target === modal) {
                    const modalName = modal.id.replace('-modal', '').replace('-window', '');
                    UIManager.toggleModal(modalName, false);
                }
            });
        });

        dom.buttons.playAgain.addEventListener('click', () => QuizLogic.initializeQuiz(true));
        dom.buttons.newQuizFromResults.addEventListener('click', () => UIManager.showScreen('quizSettings'));
        dom.buttons.backToMainFromResults.addEventListener('click', () => UIManager.showScreen('mainMenu'));

        dom.buttons.backToMainFromSettings.addEventListener('click', () => UIManager.showScreen('mainMenu'));
    };

    return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});