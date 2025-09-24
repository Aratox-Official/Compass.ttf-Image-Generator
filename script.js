const textInput = document.getElementById('textInput');
const fontSizeInput = document.getElementById('fontSize');
const colorTypeSelect = document.getElementById('colorType');
const colorPicker = document.getElementById('colorPicker');
const gradientStart = document.getElementById('gradientStart');
const gradientEnd = document.getElementById('gradientEnd');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const canvas = document.getElementById('textCanvas');
const ctx = canvas.getContext('2d');

const solidColorControls = document.getElementById('solidColorControls');
const gradientColorControls = document.getElementById('gradientColorControls');

const modeToggleBtn = document.querySelector('.mode-toggle');
const body = document.body;

const enableBorderCheckbox = document.getElementById('enableBorder');
const borderControlsDiv = document.getElementById('borderControls');
const borderWidthInput = document.getElementById('borderWidth');
const borderColorInput = document.getElementById('borderColor');

enableBorderCheckbox.addEventListener('change', () => {
  borderControlsDiv.style.display = enableBorderCheckbox.checked ? 'block' : 'none';
  generateImage();
});

function toggleColorControls() {
  const val = colorTypeSelect.value;
  if (val === 'solid') {
    solidColorControls.style.display = 'block';
    gradientColorControls.style.display = 'none';
  } else {
    solidColorControls.style.display = 'none';
    gradientColorControls.style.display = 'block';
  }
}

async function generateImage() {
  const lines = textInput.value.split('\n');
  const fontSize = parseInt(fontSizeInput.value, 10) || 48;
  const colorTypeVal = colorTypeSelect.value;
  const borderWidth = parseInt(borderWidthInput.value, 10) || 0;
  const borderColor = borderColorInput.value;
  const gradientDirection = colorTypeVal;

  try {
    await document.fonts.load(`${fontSize}px "Compass"`);
  } catch {}

  ctx.font = `${fontSize}px "Compass"`;

  let maxWidth = 0;
  lines.forEach(line => {
    const width = ctx.measureText(line).width;
    if (width > maxWidth) maxWidth = width;
  });

  const padding = 20;
  canvas.width = Math.max(200, Math.ceil(maxWidth + padding * 2));
  canvas.height = Math.ceil(fontSize * lines.length * 1.2 + padding * 2);

  ctx.font = `${fontSize}px "Compass"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (colorTypeVal === 'solid') {
    ctx.fillStyle = colorPicker.value;
  } else {
    let gradient;
    if (gradientDirection === 'gradient_horizontal') {
      gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    } else if (gradientDirection === 'gradient_vertical') {
      gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    } else {
      gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    }
    gradient.addColorStop(0, gradientStart.value);
    gradient.addColorStop(1, gradientEnd.value);
    ctx.fillStyle = gradient;
  }

  const x = canvas.width / 2;
  const startY = 20 + fontSize / 2;

  lines.forEach((line, i) => {
    const y = startY + i * fontSize * 1.2;

    if (enableBorderCheckbox.checked && borderWidth > 0) {
      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = borderColor;
      ctx.strokeText(line, x, y);
    }

    ctx.fillText(line, x, y);
  });

  downloadBtn.disabled = false;
  copyBtn.disabled = false;
}

async function copyImageToClipboard() {
  if (navigator.clipboard && window.ClipboardItem) {
    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        } catch (err) {
          console.error('Clipboard error:', err);
        }
      }
    }, 'image/png');
  } else {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'custom_text.png';
    link.click();
  }
}

function toggleMode() {
  if (body.classList.contains('dark-mode')) {
    body.classList.replace('dark-mode', 'light-mode');
    modeToggleBtn.textContent = 'Switch to Dark Mode';
    document.cookie = "mode=light; path=/; max-age=" + 365*24*60*60;
  } else {
    body.classList.replace('light-mode', 'dark-mode');
    modeToggleBtn.textContent = 'Switch to Light Mode';
    document.cookie = "mode=dark; path=/; max-age=" + 365*24*60*60;
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function setInitialMode() {
  const savedMode = getCookie('mode');
  if (savedMode === 'light') {
    body.classList.replace('dark-mode', 'light-mode');
    modeToggleBtn.textContent = 'Switch to Dark Mode';
  } else {
    body.classList.replace('light-mode', 'dark-mode');
    modeToggleBtn.textContent = 'Switch to Light Mode';
  }
}

[textInput, fontSizeInput, colorTypeSelect, colorPicker, gradientStart, gradientEnd, borderWidthInput, borderColorInput].forEach(el => {
  el.addEventListener('input', () => {
    toggleColorControls();
    generateImage();
  });
});

downloadBtn.addEventListener('click', () => {
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'custom_text.png';
  link.click();
});

copyBtn.addEventListener('click', copyImageToClipboard);
modeToggleBtn.addEventListener('click', toggleMode);
enableBorderCheckbox.addEventListener('change', () => {
  borderControlsDiv.style.display = enableBorderCheckbox.checked ? 'block' : 'none';
  generateImage();
});

borderWidthInput.addEventListener('input', generateImage);
borderColorInput.addEventListener('input', generateImage);

toggleColorControls();
setInitialMode();
generateImage();

document.getElementById('colorType').addEventListener('change', () => {
  toggleColorControls();
  generateImage();
});
