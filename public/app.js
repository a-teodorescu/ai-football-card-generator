let mode = "auto";

const form = document.getElementById("cardForm");
const photoBox = document.getElementById("photoBox");
const resultBox = document.getElementById("resultBox");
const promptOutput = document.getElementById("promptOutput");
const downloadLink = document.getElementById("downloadLink");

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    mode = tab.dataset.mode;
    photoBox.classList.toggle("hidden", mode !== "photo");
  });
});

function collectFields() {
  return {
    playerName: document.getElementById("playerName").value,
    clubName: document.getElementById("clubName").value,
    nationality: document.getElementById("nationality").value,
    position: document.getElementById("position").value,
    rating: document.getElementById("rating").value,
    clubColors: document.getElementById("clubColors").value,
    pace: document.getElementById("pace").value,
    shooting: document.getElementById("shooting").value,
    passing: document.getElementById("passing").value,
    dribbling: document.getElementById("dribbling").value,
    defending: document.getElementById("defending").value,
    physical: document.getElementById("physical").value,
    extraNotes: document.getElementById("extraNotes").value
  };
}

async function buildPrompt() {
  const response = await fetch("/api/build-prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(collectFields())
  });
  const data = await response.json();
  promptOutput.textContent = data.prompt || "";
  return data.prompt;
}

document.getElementById("btnPrompt").addEventListener("click", buildPrompt);

function showLoading() {
  downloadLink.classList.add("hidden");
  resultBox.innerHTML = `
    <div class="empty">
      <h2>Generez cardul...</h2>
      <p>Poate dura câteva secunde dacă ai conectat API-ul.</p>
    </div>
  `;
}

function showPromptOnly(data) {
  promptOutput.textContent = data.prompt || "";
  resultBox.innerHTML = `
    <div class="empty">
      <h2>Mock mode</h2>
      <p>${data.message || "Nu există API key configurat. Promptul este pregătit pentru generare."}</p>
    </div>
  `;
}

function showImage(base64) {
  const src = `data:image/png;base64,${base64}`;
  resultBox.innerHTML = `<img alt="Generated football card" src="${src}" />`;
  downloadLink.href = src;
  downloadLink.classList.remove("hidden");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showLoading();

  try {
    let response;

    if (mode === "photo") {
      const file = document.getElementById("photo").files[0];
      if (!file) {
        resultBox.innerHTML = `
          <div class="empty">
            <h2>Lipsește poza</h2>
            <p>În modul Upload photo trebuie să încarci o poză.</p>
          </div>
        `;
        return;
      }

      const fd = new FormData();
      Object.entries(collectFields()).forEach(([key, value]) => fd.append(key, value));
      fd.append("photo", file);
      response = await fetch("/api/generate-card-with-photo", {
        method: "POST",
        body: fd
      });
    } else {
      response = await fetch("/api/generate-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(collectFields())
      });
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.details || data.error || "Generation failed");
    }

    if (data.mock) {
      showPromptOnly(data);
      return;
    }

    if (data.imageBase64) {
      promptOutput.textContent = data.revisedPrompt || promptOutput.textContent;
      showImage(data.imageBase64);
      return;
    }

    resultBox.innerHTML = `
      <div class="empty">
        <h2>Nu am primit imagine</h2>
        <p>Verifică răspunsul API în consolă.</p>
      </div>
    `;
  } catch (error) {
    resultBox.innerHTML = `
      <div class="empty">
        <h2>Eroare</h2>
        <p>${error.message}</p>
      </div>
    `;
  }
});
