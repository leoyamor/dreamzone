const URL = "./my_model/";

const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");
const statusEl = document.getElementById("status");
const webcamContainer = document.getElementById("webcam-container");
const labelContainer = document.getElementById("label-container");
const topResult = document.getElementById("top-result");
const topScore = document.getElementById("top-score");

let model;
let webcam;
let maxPredictions = 0;
let running = false;
let animationId = null;

const setStatus = (message) => {
    statusEl.textContent = message;
};

const formatPercent = (value) => `${Math.round(value * 100)}%`;

const resetLabels = () => {
    labelContainer.innerHTML = "";
    topResult.textContent = "아직 분석 전";
    topScore.textContent = "--%";
};

const buildLabelRow = (className) => {
    const row = document.createElement("div");
    row.className = "label-row";

    const text = document.createElement("div");
    text.className = "label-text";

    const name = document.createElement("span");
    name.className = "label-name";
    name.textContent = className;

    const value = document.createElement("span");
    value.className = "label-value";
    value.textContent = "0%";

    text.appendChild(name);
    text.appendChild(value);

    const track = document.createElement("div");
    track.className = "label-track";

    const fill = document.createElement("div");
    fill.className = "label-fill";

    track.appendChild(fill);

    row.appendChild(text);
    row.appendChild(track);

    return { row, value, fill };
};

const init = async () => {
    if (running) return;

    startBtn.disabled = true;
    setStatus("모델을 불러오는 중...");

    try {
        const modelURL = `${URL}model.json`;
        const metadataURL = `${URL}metadata.json`;

        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        webcam = new tmImage.Webcam(360, 360, true);
        await webcam.setup();
        await webcam.play();

        webcamContainer.innerHTML = "";
        webcamContainer.appendChild(webcam.canvas);

        webcam.update();
        const initialPrediction = await model.predict(webcam.canvas);

        labelContainer.innerHTML = "";
        const labelRows = initialPrediction.map((item) => {
            const labelRow = buildLabelRow(item.className);
            labelContainer.appendChild(labelRow.row);
            return labelRow;
        });

        running = true;
        stopBtn.disabled = false;
        setStatus("분석 중입니다. 화면을 보면서 변화를 확인해보세요.");

        const loop = async () => {
            if (!running) return;
            webcam.update();
            const prediction = await model.predict(webcam.canvas);

            let topIndex = 0;
            prediction.forEach((item, index) => {
                if (item.probability > prediction[topIndex].probability) {
                    topIndex = index;
                }

                const row = labelRows[index];
                const percent = item.probability;
                row.value.textContent = formatPercent(percent);
                row.fill.style.width = `${Math.round(percent * 100)}%`;
            });

            topResult.textContent = prediction[topIndex].className;
            topScore.textContent = formatPercent(prediction[topIndex].probability);

            animationId = window.requestAnimationFrame(loop);
        };

        animationId = window.requestAnimationFrame(loop);
    } catch (error) {
        setStatus("카메라 접근을 허용하거나 모델 경로를 확인해주세요.");
        startBtn.disabled = false;
        console.error(error);
    }
};

const stop = () => {
    if (!running) return;
    running = false;
    stopBtn.disabled = true;
    startBtn.disabled = false;
    if (animationId) {
        window.cancelAnimationFrame(animationId);
        animationId = null;
    }
    if (webcam) {
        webcam.stop();
    }
    setStatus("정지되었습니다. 다시 시작하려면 테스트 시작을 눌러주세요.");
};

startBtn.addEventListener("click", init);
stopBtn.addEventListener("click", stop);
window.addEventListener("beforeunload", stop);

resetLabels();
