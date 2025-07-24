const slider = document.getElementById('humanSlider');
const sliderValue = document.getElementById('sliderValue');
const sliderDesc = document.getElementById('sliderDesc');

const descs = [
  { min: 0, max: 12, text: '“A medium cult”' },
  { min: 13, max: 37, text: '“The entire family tree”' },
  { min: 38, max: 50, text: '“Feeding the resistance”' }
];

function updateSlider() {
  const value = parseInt(slider.value, 10);
  sliderValue.textContent = value;
  for (const d of descs) {
    if (value >= d.min && value <= d.max) {
      sliderDesc.textContent = d.text;
      break;
    }
  }
}

slider.addEventListener('input', updateSlider);
window.addEventListener('DOMContentLoaded', updateSlider); 