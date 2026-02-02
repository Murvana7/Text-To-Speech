const textarea = document.querySelector("textarea");
const voiceList = document.querySelector("select");
const speechBtn = document.querySelector("button");

const synth = window.speechSynthesis;
let isPaused = false;
let intervalId = null;

function loadVoices() {
  const voices = synth.getVoices();
  voiceList.innerHTML = "";

  voices.forEach((voice) => {
    const option = document.createElement("option");
    option.value = voice.name;
    option.textContent = voice.name;

    // Optional default (works mainly in Chrome if available)
    if (voice.name === "Google US English") option.selected = true;

    voiceList.appendChild(option);
  });
}

// Some browsers load voices later
synth.addEventListener("voiceschanged", loadVoices);
loadVoices();

function textToSpeech(text) {
  const utterance = new SpeechSynthesisUtterance(text);

  const voices = synth.getVoices();
  const selectedVoice = voices.find(v => v.name === voiceList.value);
  if (selectedVoice) utterance.voice = selectedVoice;

  utterance.onend = () => {
    clearInterval(intervalId);
    intervalId = null;
    speechBtn.innerText = "Convert To Speech";
    isPaused = false;
  };

  synth.speak(utterance);
}

speechBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const text = textarea.value.trim();
  if (!text) return;

  // Start speaking if not currently speaking
  if (!synth.speaking) {
    textToSpeech(text);
    speechBtn.innerText = "Pause Speech";
    isPaused = false;

    // Keep UI in sync
    clearInterval(intervalId);
    intervalId = setInterval(() => {
      if (!synth.speaking) {
        clearInterval(intervalId);
        intervalId = null;
        speechBtn.innerText = "Convert To Speech";
        isPaused = false;
      }
    }, 300);

    return;
  }

  // Toggle pause/resume
  if (!isPaused) {
    synth.pause();
    isPaused = true;
    speechBtn.innerText = "Resume Speech";
  } else {
    synth.resume();
    isPaused = false;
    speechBtn.innerText = "Pause Speech";
  }
});
