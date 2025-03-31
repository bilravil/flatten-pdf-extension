const screens = {
  step1: document.getElementById("step-1"),
  step2: document.getElementById("step-2"),
  step3: document.getElementById("step-3"),
  step4: document.getElementById("step-4"),
};

function showStep(id) {
  Object.entries(screens).forEach(([key, screen]) => {
    if (key === id) {
      screen.classList.add("active");
    } else {
      screen.classList.remove("active");
    }
  });
}

const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("file-input");
const filenameDisplay = document.getElementById("filename");
const filesizeDisplay = document.getElementById("filesize");
const flattenBtn = document.getElementById("flatten-btn");
const restartBtn = document.getElementById("restart-btn");
const downloadLink = document.getElementById("download-link");
const outputFilenameDisplay = document.getElementById("output-filename");
const emojiButtons = document.querySelectorAll(".emoji-btn");
const feedbackThanks = document.getElementById("feedback-thanks");

let file = null;

// File processing
function handleFile(selectedFile) {
  if (selectedFile && selectedFile.type === "application/pdf") {
    file = selectedFile;
    filenameDisplay.textContent = truncateFilename(file.name, 25);
    filesizeDisplay.textContent = formatBytes(file.size);
    showStep("step2");
  } else {
    alert("Please upload a valid PDF file.");
  }
}

// Upload file via input
fileInput.addEventListener("change", (e) => {
  if (e.target.files && e.target.files.length > 0) {
    handleFile(e.target.files[0]);
    e.target.value = ""; // сброс значения
  }
});

// Drag & Drop
["dragenter", "dragover"].forEach((eventName) => {
  dropArea.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.add("drag-over");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.remove("drag-over");
  });
});

dropArea.addEventListener("drop", (e) => {
  const droppedFiles = e.dataTransfer.files;
  if (droppedFiles.length) {
    handleFile(droppedFiles[0]);
  }
});

emojiButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const emoji = btn.textContent;

    // Show thanks label
    document.querySelector(".feedback-options").style.display = "none";
    feedbackThanks.style.display = "block";

    const url =
      emoji === "😊"
        ? "https://chrome.google.com/webstore/detail/your-extension-id/reviews"
        : "https://docs.google.com/forms/d/e/1FAIpQLScZ9oF3Vpq_S5Ca0hous_k8RUjXuemIkTU3vPxCrPdkQx65HA/viewform";

    chrome.tabs.create({ url });
  });
});

// Navigations

flattenBtn.addEventListener("click", async () => {
  showStep("step3");

  const delay = new Promise((res) => setTimeout(res, 1000));

  try {
    const [blob] = await Promise.all([flattenPdf(file), delay]);
    const blobUrl = URL.createObjectURL(blob);

    const flattenedName = generateFlattenedFilename(file.name);

    downloadLink.href = blobUrl;
    downloadLink.download = flattenedName;
    outputFilenameDisplay.textContent = `📄 ${flattenedName}`;

    downloadLink.click();

    showStep("step4");
  } catch (err) {
    alert("Something went wrong while processing the file.");
    showStep("step2");
  }
});

async function flattenPdf(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();

    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
    const form = pdfDoc.getForm();
    form.flatten();

    const outputBytes = await pdfDoc.save();
    return new Blob([outputBytes], { type: "application/pdf" });
  } catch (error) {
    console.error("PDF flatten error:", error);
    throw error;
  }
}

restartBtn.addEventListener("click", () => {
  location.reload();
});

document.getElementById("delete-file").addEventListener("click", () => {
  file = null;
  fileInput.value = "";
  showStep("step1");
});

// Utils
function truncateFilename(name, maxLength) {
  if (name.length <= maxLength) return name;
  const ext = name.includes(".") ? "." + name.split(".").pop() : "";
  const base = name.replace(ext, "");
  return base.substring(0, maxLength - ext.length - 3) + "..." + ext;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function generateFlattenedFilename(original) {
  const dotIndex = original.lastIndexOf(".");
  if (dotIndex === -1) return original + "-flattened.pdf";

  const base = original.substring(0, dotIndex);
  return base + "-flattened.pdf";
}

// Localization
document.getElementById("upload-title").innerText = locale.uploadTitle;
document.getElementById("upload-subtitle").innerText = locale.uploadSubtitle;
document.getElementById("upload-button").innerText = locale.uploadButton;
document.getElementById("ready-title").innerText = locale.readyTitle;
document.getElementById("flatten-btn").innerText = locale.flattenBtn;
document.getElementById("processing-title").innerText = locale.processingTitle;
document.getElementById("processing-subtitle").innerText =
  locale.processingSubtitle;
document.getElementById("done-title").innerText = locale.doneTitle;
document.getElementById("done-subtitle").innerText = locale.doneSubtitle;
document.getElementById("download-link").innerText = locale.downloadLink;
document.getElementById("feedback-label").innerText = locale.feedbackLabel;
document.getElementById("restart-btn").innerText = locale.restartBtn;
