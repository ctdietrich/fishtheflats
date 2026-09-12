const form = document.getElementById("catch-form");
const formError = document.getElementById("form-error");
const speciesSelect = document.getElementById("species");
const catchList = document.getElementById("catch-list");
const emptyState = document.getElementById("empty-state");
const statTotal = document.getElementById("stat-total");
const statLongest = document.getElementById("stat-longest");
const breakdown = document.getElementById("species-breakdown");

async function loadSpecies() {
  const res = await fetch("/api/species");
  const { species } = await res.json();
  speciesSelect.innerHTML = species
    .map((s) => `<option value="${s}">${s}</option>`)
    .join("");
}

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

async function loadCatches() {
  const [catchesRes, statsRes] = await Promise.all([
    fetch("/api/catches"),
    fetch("/api/stats"),
  ]);
  const { catches } = await catchesRes.json();
  const stats = await statsRes.json();

  statTotal.textContent = stats.total;
  statLongest.textContent = stats.longest
    ? `${stats.longest.lengthIn}" ${stats.longest.species}`
    : "–";

  breakdown.innerHTML = Object.entries(stats.bySpecies)
    .sort((a, b) => b[1] - a[1])
    .map(([species, count]) => `<li><span>${species}</span><span>${count}</span></li>`)
    .join("");

  emptyState.style.display = catches.length ? "none" : "block";
  catchList.innerHTML = catches
    .map(
      (c) => `
      <li class="catch" data-id="${c.id}">
        <div class="catch__main">
          <span class="catch__title">${c.species} · ${c.lengthIn}"</span>
          <span class="catch__meta">${c.spot} — ${c.angler} · ${formatDate(c.caughtAt)}</span>
        </div>
        <button class="catch__delete" data-id="${c.id}">Remove</button>
      </li>`
    )
    .join("");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.textContent = "";
  const payload = {
    species: speciesSelect.value,
    lengthIn: document.getElementById("lengthIn").value,
    spot: document.getElementById("spot").value,
    angler: document.getElementById("angler").value,
  };

  const res = await fetch("/api/catches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const { error } = await res.json();
    formError.textContent = error || "Something went wrong.";
    return;
  }

  form.reset();
  await loadCatches();
});

catchList.addEventListener("click", async (e) => {
  const button = e.target.closest(".catch__delete");
  if (!button) return;
  await fetch(`/api/catches/${button.dataset.id}`, { method: "DELETE" });
  await loadCatches();
});

loadSpecies().then(loadCatches);
