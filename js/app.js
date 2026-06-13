const state = {
  water: Number(localStorage.getItem("aqua_water") || 0),
  exercise: localStorage.getItem("aqua_exercise") === "true",
  pomodoroSeconds: 25 * 60,
  pomodoroInterval: null,
};

const sectionTitles = {
  dashboard: "Dashboard",
  tarefas: "Tarefas",
  agenda: "Agenda",
  estudos: "Estudos",
  financeiro: "Financeiro",
  diario: "Diário",
  projetos: "Projetos",
  configuracoes: "Configurações",
};

function formatDate() {
  const now = new Date();
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(now);
}

function updateGreeting() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" :
    hour < 18 ? "Boa tarde" :
    "Boa noite";

  document.getElementById("greeting").textContent = `${greeting}, KingMiixin 🩵`;
}

function showSection(sectionId) {
  document.querySelectorAll(".page-section").forEach((section) => {
    section.classList.toggle("active", section.id === sectionId);
  });

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.section === sectionId);
  });

  document.getElementById("pageTitle").textContent = sectionTitles[sectionId] || "Aqua Space";
  document.querySelector(".sidebar").classList.remove("open");
}

function updateHabits() {
  document.getElementById("waterCount").textContent = state.water;
  document.getElementById("exerciseStatus").textContent = state.exercise
    ? "Realizado hoje"
    : "Não realizado hoje";
  document.getElementById("toggleExercise").textContent = state.exercise
    ? "Desmarcar"
    : "Marcar como feito";

  localStorage.setItem("aqua_water", String(state.water));
  localStorage.setItem("aqua_exercise", String(state.exercise));
}

function formatTimer(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
}

function updateTimer() {
  document.getElementById("pomodoroTimer").textContent = formatTimer(state.pomodoroSeconds);
}

function startPomodoro() {
  if (state.pomodoroInterval) return;

  state.pomodoroInterval = setInterval(() => {
    state.pomodoroSeconds -= 1;
    updateTimer();

    if (state.pomodoroSeconds <= 0) {
      clearInterval(state.pomodoroInterval);
      state.pomodoroInterval = null;
      state.pomodoroSeconds = 25 * 60;
      updateTimer();
      alert("Pomodoro concluído! Hora de respirar um pouquinho 🌊");
    }
  }, 1000);
}

function resetPomodoro() {
  clearInterval(state.pomodoroInterval);
  state.pomodoroInterval = null;
  state.pomodoroSeconds = 25 * 60;
  updateTimer();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("todayText").textContent = formatDate();
  updateGreeting();
  updateHabits();
  updateTimer();

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => showSection(button.dataset.section));
  });

  document.getElementById("menuToggle").addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("open");
  });

  document.getElementById("addWater").addEventListener("click", () => {
    state.water = Math.min(state.water + 1, 10);
    updateHabits();
  });

  document.getElementById("toggleExercise").addEventListener("click", () => {
    state.exercise = !state.exercise;
    updateHabits();
  });

  document.getElementById("startPomodoro").addEventListener("click", startPomodoro);
  document.getElementById("resetPomodoro").addEventListener("click", resetPomodoro);
});
