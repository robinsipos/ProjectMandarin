// js/uiManager.js
const dom = {};
let activeScreen = 'mainMenu';

// Updated icons for Font Awesome
const icons = {
    correct: `<i class="fas fa-check-circle"></i>`,
    incorrect: `<i class="fas fa-times-circle"></i>`,
};

export const cacheDomElements = () => {
    const elements = {
        mainContainer: document.querySelector('.main-container'),
        screens: {
            mainMenu: document.getElementById('main-menu-screen'),
            quizSettings: document.getElementById('quiz-settings-screen'),
            quiz: document.getElementById('quiz-container'),
            results: document.getElementById('results-screen'),
            settings: document.getElementById('settings-screen')
        },
        modals: {
            about: document.getElementById('about-modal'),
            hint: document.getElementById('hint-window'),
            confirmQuit: document.getElementById('confirm-quit-modal')
        },
        buttons: {
            startNewQuiz: document.getElementById('start-new-quiz-btn'),
            settings: document.getElementById('settings-btn'),
            about: document.getElementById('about-btn'),
            startQuiz: document.getElementById('start-quiz-btn'),
            backToMainFromQuizSetup: document.getElementById('back-to-main-from-quiz-setup-btn'),
            endQuiz: document.getElementById('end-quiz-btn'),
            cancelQuit: document.getElementById('cancel-quit-btn'),
            confirmQuit: document.getElementById('confirm-quit-btn'),
            backToMainFromSettings: document.getElementById('back-to-main-from-settings-btn'),
            playAgain: document.getElementById('play-again-btn'),
            newQuizFromResults: document.getElementById('new-quiz-from-results-btn'),
            backToMainFromResults: document.getElementById('back-to-main-from-results-btn'),
            closeAbout: document.getElementById('close-about-btn'),
            closeHint: document.getElementById('close-hint-btn')
        },
        toggles: {
            darkMode: document.getElementById('dark-mode-toggle'),
            pinyin: document.getElementById('pinyin-toggle')
        },
        quizElements: {
            hanziDisplay: document.getElementById('hanzi-display'),
            pinyinDisplay: document.getElementById('pinyin-display'),
            feedback: document.getElementById('feedback'),
            optionsContainer: document.getElementById('options-container'),
            scoreContainer: document.getElementById('score-container'),
            hintExplanation: document.getElementById('hint-explanation'),
            funFact: document.getElementById('fun-fact'),
            finalScore: document.getElementById('final-score'),
            finalAccuracy: document.getElementById('final-accuracy'),
            finalTime: document.getElementById('final-time'),
            resultsListContainer: document.getElementById('results-list-container')
        }
    };

    if (!elements.mainContainer) throw new Error("Critical: Main container not found.");
    for (const key in elements.screens) {
        if (!elements.screens[key]) throw new Error(`Critical: Screen element '${key}' not found.`);
    }
    const criticalQuizElements = ['hanziDisplay', 'optionsContainer', 'scoreContainer', 'pinyinDisplay'];
    for (const key of criticalQuizElements) {
        if (!elements.quizElements[key]) throw new Error(`Critical: Quiz element '${key}' not found. Quiz functionality is severely impaired.`);
    }

    Object.assign(dom, elements);
    return dom;
};

export const getDomElements = () => dom;

export const showScreen = (screenName) => {
    if (activeScreen === screenName) return;

    const currentScreen = dom.screens[activeScreen];
    const newScreen = dom.screens[screenName];

    if (currentScreen) {
        currentScreen.classList.remove('active');
        currentScreen.setAttribute('aria-hidden', 'true');
    }

    if (newScreen) {
        void newScreen.offsetWidth; // Force reflow for transition
        newScreen.classList.add('active');
        newScreen.setAttribute('aria-hidden', 'false');
        newScreen.focus();
    } else {
        console.error(`Screen element '${screenName}' not found. Cannot switch screens.`);
        return;
    }
    activeScreen = screenName;
};

export const toggleModal = (modalName, show) => {
    const modalElement = dom.modals[modalName];
    if (modalElement) {
        modalElement.classList.toggle('active', show);
        modalElement.setAttribute('aria-hidden', !show);
        if (show) {
            const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
            const firstFocusableElement = modalElement.querySelector(focusableElements);
            firstFocusableElement ? firstFocusableElement.focus() : modalElement.focus();
        } else {
            dom.screens[activeScreen]?.focus();
        }
    } else {
        console.warn(`Modal element '${modalName}' not found. Cannot toggle.`);
    }
};

export const updateQuizQuestion = (question, currentQuestionIndex, totalQuestions, score) => {
    if (dom.quizElements.hanziDisplay) dom.quizElements.hanziDisplay.textContent = question.simplified;
    if (dom.quizElements.scoreContainer) dom.quizElements.scoreContainer.innerHTML = `Question: ${currentQuestionIndex + 1} / ${totalQuestions} | Score: ${score}`;
    // The pinyin display logic now depends on a setting from settingsManager
    // This will be handled in a combined way by the event listener in app.js
};

export const updatePinyinDisplay = (pinyin, showPinyinSetting) => {
    if (dom.quizElements.pinyinDisplay) {
        dom.quizElements.pinyinDisplay.textContent = showPinyinSetting && pinyin ? pinyin : '';
        dom.quizElements.pinyinDisplay.setAttribute('aria-hidden', !showPinyinSetting);
    }
};

export const displayOptions = (options, checkAnswerCallback) => {
    if (!dom.quizElements.optionsContainer) {
        console.error("Options container element not found. Cannot display options.");
        return;
    }
    dom.quizElements.optionsContainer.innerHTML = '';
    options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'action-btn option-btn';
        button.textContent = option;
        button.style.setProperty('--option-index', index);
        button.setAttribute('aria-label', `Choose ${option}`);
        button.onclick = () => checkAnswerCallback(button);
        dom.quizElements.optionsContainer.appendChild(button);
    });
};

export const highlightAnswer = (selectedButton, correctAnswerText) => {
    if (!dom.quizElements.optionsContainer) return;
    dom.quizElements.optionsContainer.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
        if (btn.textContent === correctAnswerText) {
            btn.classList.add('correct');
        } else if (btn === selectedButton) {
            btn.classList.add('incorrect');
        }
    });
};

export const displayFeedback = (message, isCorrect) => {
    if (!dom.quizElements.feedback) {
        console.warn("Feedback display element not found, skipping visual feedback.");
        return;
    }
    const icon = isCorrect ? icons.correct : icons.incorrect;
    dom.quizElements.feedback.innerHTML = `${icon} ${message}`;
    dom.quizElements.feedback.classList.add('show');
    dom.quizElements.feedback.setAttribute('aria-live', 'polite');
    dom.quizElements.feedback.setAttribute('aria-atomic', 'true');
};

export const hideFeedback = () => {
    if (!dom.quizElements.feedback) return;
    dom.quizElements.feedback.classList.remove('show');
    dom.quizElements.feedback.removeAttribute('aria-live');
    dom.quizElements.feedback.removeAttribute('aria-atomic');
};

export const populateHintModal = (question) => {
    if (dom.quizElements.hintExplanation) {
        dom.quizElements.hintExplanation.textContent = question.explanation || `The correct answer for "${question.simplified}" is "${question.answer}".`;
    }
    if (dom.quizElements.funFact) {
        dom.quizElements.funFact.textContent = question.funFact ? `Fun Fact: ${question.funFact}` : "";
    }
};

export const updateResultsScreen = (results, startTime) => {
    const totalQuestions = results.length;
    const correctAnswers = results.filter(r => r.isCorrect).length;
    const timeDiff = Math.round((new Date() - startTime) / 1000);
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions * 100).toFixed(1) : 0;

    if (dom.quizElements.finalScore) dom.quizElements.finalScore.textContent = `${correctAnswers} / ${totalQuestions}`;
    if (dom.quizElements.finalAccuracy) dom.quizElements.finalAccuracy.textContent = `${accuracy}%`;
    if (dom.quizElements.finalTime) dom.quizElements.finalTime.textContent = `${Math.floor(timeDiff / 60)}m ${timeDiff % 60}s`;

    if (dom.quizElements.resultsListContainer) {
        dom.quizElements.resultsListContainer.innerHTML = results.map(result => `
            <div class="result-item">
                <div class="result-item-hanzi">${result.question.simplified}</div>
                <div class="result-item-details">
                    <p>Correct: ${result.question.answer}</p>
                    <p class="result-user-answer ${result.isCorrect ? '' : 'incorrect-text'}">Your Answer: ${result.userAnswer}</p>
                </div>
                <div class="result-icon">${result.isCorrect ? icons.correct : icons.incorrect}</div>
            </div>`).join('');
    }
};

export const resetQuizUI = () => {
    hideFeedback();
    if (dom.quizElements.optionsContainer) {
        dom.quizElements.optionsContainer.querySelectorAll('.option-btn').forEach(btn => {
            btn.className = 'action-btn option-btn';
            btn.disabled = false;
            btn.removeAttribute('aria-disabled');
        });
    }
};