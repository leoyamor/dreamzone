const lottoNumbersContainer = document.querySelector('.lotto-numbers');
const generateBtn = document.getElementById('generate-btn');

const MIN_NUMBER = 1;
const MAX_NUMBER = 45;
const DRAW_COUNT = 6;
const SET_COUNT = 5;

const generateNumbers = () => {
    const numbers = new Set();
    while (numbers.size < DRAW_COUNT) {
        numbers.add(Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER);
    }
    return Array.from(numbers).sort((a, b) => a - b);
};

const getNumberColor = (number) => {
    if (number <= 10) return '#fbc400'; // Yellow
    if (number <= 20) return '#69c8f2'; // Blue
    if (number <= 30) return '#ff7272'; // Red
    if (number <= 40) return '#aaa'; // Gray
    return '#b0d840'; // Green
};

const displayNumberSets = (sets) => {
    lottoNumbersContainer.innerHTML = '';
    sets.forEach((numbers, setIndex) => {
        const setRow = document.createElement('div');
        setRow.classList.add('lotto-set');

        const setLabel = document.createElement('span');
        setLabel.classList.add('lotto-set-label');
        setLabel.textContent = `세트 ${setIndex + 1}`;
        setRow.appendChild(setLabel);

        const numbersWrap = document.createElement('div');
        numbersWrap.classList.add('lotto-set-numbers');

        numbers.forEach((number, index) => {
            const numberDiv = document.createElement('div');
            numberDiv.classList.add('lotto-number');
            numberDiv.textContent = number;
            numberDiv.style.backgroundColor = getNumberColor(number);
            numberDiv.style.animationDelay = `${setIndex * 120 + index * 140}ms`;
            numbersWrap.appendChild(numberDiv);
        });

        setRow.appendChild(numbersWrap);
        lottoNumbersContainer.appendChild(setRow);
    });
};

generateBtn.addEventListener('click', () => {
    generateBtn.classList.remove('is-bouncing');
    void generateBtn.offsetWidth;
    generateBtn.classList.add('is-bouncing');
    const sets = Array.from({ length: SET_COUNT }, () => generateNumbers());
    displayNumberSets(sets);
});

// Initial generation
displayNumberSets(Array.from({ length: SET_COUNT }, () => generateNumbers()));
