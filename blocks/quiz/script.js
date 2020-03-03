const quiz = {
    frame: document.querySelector('.quiz-frame'),
    itemSelector: '.quiz-frame__item',
    itemActiveClass: '--active',
    itemDataIndex: 'data-quiz-index',
    progressSelector: '.quiz-frame__progress',
    progressStepSelector: '.quiz-frame__progress-step',
    prevButtonSelector: '.quiz-frame__prev',
    nextButtonSelector: '.quiz-frame__next',
    finishButtonSelector: '.quiz-frame__finish',

    movingPlaceholderSelector: '[data-moving-placeholder]',
    movingPlaceholderClass: 'moving-placeholder',

    /**
     * Получаем спиок элементов-вопросов
     * @returns {NodeListOf<Element>}
     */
    getList: function() {
        return this.frame.querySelectorAll(this.itemSelector);
    },

    /**
     * Получаем количество вопросов
     * @returns {number}
     */
    getCount: function() {
        return this.getList().length;
    },

    /**
     * Получаем элемент с текущим вопросом
     * @returns {Element}
     */
    getCurrent: function() {
        return this.frame.querySelector(this.itemSelector+'.'+this.itemActiveClass);
    },

    /**
     * Получаем индекс текущего вопроса
     * @returns {number}
     */
    getCurrentIndex: function() {
        return Number(this.getCurrent().dataset.quizIndex);
    },

    /**
     * Проверяем, является ли элемент первым
     * @returns {boolean}
     */
    isFirst: function() {
        return (this.getCurrentIndex() === 1);
    },

    /**
     * Проверяем, является ли элемент последним
     * @returns {boolean}
     */
    isLast: function() {
        return (this.getCurrentIndex() === this.getCount());
    },

    /**
     * Считаем и устанавливаем прогресс
     * @param activeIndex
     */
    setProgress: function(activeIndex = '') {
        const progress = activeIndex/this.getCount()*100;
        const progressStep = activeIndex+"/"+this.getCount();

        this.frame.querySelector(this.progressSelector).style.width = progress+'%';
        this.frame.querySelector(this.progressStepSelector).textContent = progressStep;
    },

    /**
     * Проходимся по всем элементам с вопросами и выставляем
     * индекс через data-атрибут
     */
    runQuestions: function() {
        const questionsList =  this.getList();
        let questionIndex = 0;

        for (let question of questionsList) {
            questionIndex ++;
            question.setAttribute(this.itemDataIndex, questionIndex)
        }
    },

    /**
     * Обернуть элемент в тэг
     * @param el
     * @param tagWrap
     * @param tagClass
     */
    wrapElement: function(el, tagWrap, tagClass) {
        const wrapper = document.createElement(tagWrap);
        if (tagClass)
            wrapper.classList.add(tagClass);

        el.parentNode.insertBefore(wrapper, el);
        wrapper.append(el);
    },

    /**
     * Смещающийся placeholder
     * @param selector
     */
    movingPlaceholder: function(selector) {
        const inputs = this.frame.querySelectorAll(selector);
        for (let input of inputs) {
            if (!input.placeholder)
                continue;
            this.wrapElement(input, 'div', this.movingPlaceholderClass);
            const label = document.createElement('span');
            label.classList.add(this.movingPlaceholderClass+'__label');
            label.innerText = input.placeholder;
            input.after(label);
            input.removeAttribute('placeholder');
            input.classList.add(this.movingPlaceholderClass+'__field');
        }
        document.addEventListener('blur', function (e) {
            if (e.target.classList.contains(quiz.movingPlaceholderClass+'__field')) {
                const el = e.target;

                if (el.value !== '') {
                    el.classList.add('--focus');
                } else {
                    el.classList.remove('--focus');
                }
            }
        }, true);
    },

    /**
     * Установить текущий активный вопрос
     * @param questionIndex
     */
    setActive: function(questionIndex) {
        /**
         * Предварительно удаляем класс с текущего элемента
         */
        if (this.getCurrent())
            this.getCurrent().classList.remove(this.itemActiveClass);

        this.frame.querySelector('['+this.itemDataIndex+'="'+questionIndex+'"]').classList.add(this.itemActiveClass);
        this.setProgress(questionIndex);

        if (this.isFirst()) {
            this.frame.querySelector(this.prevButtonSelector).setAttribute('disabled', 'disabled');
        } else {
            this.frame.querySelector(this.prevButtonSelector).removeAttribute('disabled');
        }

        if (this.isLast()) {
            this.frame.querySelector(this.nextButtonSelector).setAttribute('hidden', 'hidden');
            this.frame.querySelector(this.finishButtonSelector).removeAttribute('hidden');
        } else {
            this.frame.querySelector(this.nextButtonSelector).removeAttribute('hidden');
            this.frame.querySelector(this.finishButtonSelector).setAttribute('hidden', 'hidden');
        }
    },

    init: function() {
        if (!this.getCount())
            return false;

        this.runQuestions();
        this.setActive(1);

        this.movingPlaceholder(this.movingPlaceholderSelector);

        /**
         * Вешаем обработчик на кнопку "следующий вопрос"
         */
        this.frame.querySelector(this.nextButtonSelector).addEventListener('click', function(e){
            e.preventDefault();
            if (quiz.isLast() !== true)
                quiz.setActive(quiz.getCurrentIndex() + 1);
        });

        /**
         * Вешаем обработчик на кнопку "назад"
         */
        this.frame.querySelector(this.prevButtonSelector).addEventListener('click', function(e){
            e.preventDefault();
            if (quiz.isFirst() !== true)
                quiz.setActive(quiz.getCurrentIndex() - 1);
        });

        /**
         * При установке фокуса на input[type=text] "Другое"
         * ставим checked на input[type=radio]
         */
        this.frame.addEventListener('focus', function(e) {
            const otherID = e.target.dataset.otherId;
            const otherRadio = quiz.frame.querySelector('[id="' + otherID + '"]');
            if (otherRadio)
                otherRadio.checked = 'checked';
        }, true);

        /**
         * Подключаем маску на телефон
         * Плагины подключены на проекте (раскомментировать)
         */
        //PhoneMask('input[class*="phone"]', true, false);
        //app.applyPhoneMask($('.quiz-frame').find('input[class*="phone"]'));

        /**
         * Ставим флаг, что плагин инициализирован
         */
        this.frame.classList.add('--init');
    }
};

quiz.init();