const MODEL_URL = "./my_model/";

const imageInput = document.getElementById("image-input");
const resetBtn = document.getElementById("reset-btn");
const statusEl = document.getElementById("status");
const imageContainer = document.getElementById("image-container");
const labelContainer = document.getElementById("label-container");
const topResult = document.getElementById("top-result");
const topScore = document.getElementById("top-score");

let model;
let maxPredictions = 0;
let modelReady = false;
let previewImage = null;

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

const loadModel = async () => {
    if (modelReady) return;
    setStatus("모델을 불러오는 중...");
    const modelURL = `${MODEL_URL}model.json`;
    const metadataURL = `${MODEL_URL}metadata.json`;
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    modelReady = true;
    setStatus("사진을 올리면 바로 분석합니다.");
};

const buildLabelsFromPrediction = (prediction) => {
    labelContainer.innerHTML = "";
    return prediction.map((item) => {
        const labelRow = buildLabelRow(item.className);
        labelContainer.appendChild(labelRow.row);
        return labelRow;
    });
};

const predictImage = async (image) => {
    await loadModel();
    const prediction = await model.predict(image);

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
};

const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
        setStatus("이미지 파일만 업로드할 수 있습니다.");
        return;
    }

    setStatus("이미지를 불러오는 중...");
    const imageUrl = window.URL.createObjectURL(file);
    const image = new Image();
    image.alt = "업로드한 얼굴 사진";
    image.onload = async () => {
        if (previewImage) {
            previewImage.remove();
        }
        imageContainer.innerHTML = "";
        imageContainer.appendChild(image);
        previewImage = image;
        setStatus("분석 중입니다...");
        try {
            await loadModel();
            const prediction = await model.predict(image);
            const labelRows =
                labelContainer.childElementCount === maxPredictions
                    ? Array.from(labelContainer.children).map((row) => ({
                          row,
                          value: row.querySelector(".label-value"),
                          fill: row.querySelector(".label-fill"),
                      }))
                    : buildLabelsFromPrediction(prediction);

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
            setStatus("분석 완료! 다른 사진도 테스트해보세요.");
        } catch (error) {
            setStatus("모델을 불러오거나 분석하는 중 오류가 발생했습니다.");
            console.error(error);
        }
        window.URL.revokeObjectURL(imageUrl);
    };
    image.onerror = () => {
        setStatus("이미지를 불러오지 못했습니다. 다시 시도해주세요.");
        window.URL.revokeObjectURL(imageUrl);
    };
    image.src = imageUrl;
};

const reset = () => {
    imageInput.value = "";
    imageContainer.innerHTML = "<div class=\"placeholder\">이미지를 업로드해주세요</div>";
    resetLabels();
    setStatus("사진을 올리면 바로 분석합니다.");
};

imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    handleFile(file);
});

resetBtn.addEventListener("click", reset);

resetLabels();
