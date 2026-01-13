const lottoNumbersContainer = document.querySelector('.lotto-numbers');
const generateBtn = document.getElementById('generate-btn');

const MIN_NUMBER = 1;
const MAX_NUMBER = 45;
const DRAW_COUNT = 6;

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

const displayNumbers = (numbers) => {
    lottoNumbersContainer.innerHTML = '';
    numbers.forEach((number, index) => {
        const numberDiv = document.createElement('div');
        numberDiv.classList.add('lotto-number');
        numberDiv.textContent = number;
        numberDiv.style.backgroundColor = getNumberColor(number);
        numberDiv.style.animationDelay = `${index * 160}ms`;
        lottoNumbersContainer.appendChild(numberDiv);
    });
};

generateBtn.addEventListener('click', () => {
    generateBtn.classList.remove('is-bouncing');
    void generateBtn.offsetWidth;
    generateBtn.classList.add('is-bouncing');
    const numbers = generateNumbers();
    displayNumbers(numbers);
});

// Initial generation
displayNumbers(generateNumbers());
