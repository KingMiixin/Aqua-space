const state = {
  water: Number(localStorage.getItem("aqua_water") || 0),
  exercise: localStorage.getItem("aqua_exercise") === "true",
  tasks: JSON.parse(localStorage.getItem("aqua_tasks") || "[]"),
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

const priorityRank = {
  alta: 1,
  media: 2,
  baixa: 3,
};

function saveTasks() {
  localStorage.setItem("aqua_tasks", JSON.stringify(state.tasks));
}

function formatDate() {
  const now = new Date();
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(now);
}

function formatTaskDate(dateValue) {
  if (!dateValue) return "Sem data";
  const [year, month, day] = dateValue.split("-");
  return `${day}/${month}/${year}`;
}

function updateGreeting() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
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
  document.getElementById("exerciseStatus").textContent = state.exercise ? "Realizado hoje" : "Não realizado hoje";
  document.getElementById("toggleExercise").textContent = state.exercise ? "Desmarcar" : "Marcar como feito";

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

function createTask(task) {
  state.tasks.push(task);
  saveTasks();
  renderTasks();
}

function updateTaskStatus(taskId, status) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  task.status = status;
  saveTasks();
  renderTasks();
}

function deleteTask(taskId) {
  state.tasks = state.tasks.filter((item) => item.id !== taskId);
  saveTasks();
  renderTasks();
}

function getFilteredTasks() {
  const search = document.getElementById("taskSearch")?.value.toLowerCase().trim() || "";
  const filter = document.getElementById("taskFilter")?.value || "todas";

  return state.tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search) ||
      task.category.toLowerCase().includes(search) ||
      task.description.toLowerCase().includes(search);

    const matchesFilter = filter === "todas" || task.status === filter;

    return matchesSearch && matchesFilter;
  });
}

function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    const dateA = a.date || "9999-12-31";
    const dateB = b.date || "9999-12-31";

    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return priorityRank[a.priority] - priorityRank[b.priority];
  });
}

function renderTaskItem(task) {
  const item = document.createElement("article");
  item.className = `task-item ${task.status === "concluida" ? "done" : ""}`;

  const priorityText = {
    alta: "🔴 Alta",
    media: "🟡 Média",
    baixa: "🟢 Baixa",
  }[task.priority];

  item.innerHTML = `
    <p class="task-title">${escapeHTML(task.title)}</p>
    <div class="task-meta">
      <span class="badge">${escapeHTML(task.category)}</span>
      <span class="badge priority-${task.priority}">${priorityText}</span>
      <span class="badge">${formatTaskDate(task.date)}</span>
    </div>
    ${task.description ? `<p class="task-description">${escapeHTML(task.description)}</p>` : ""}
    <div class="task-actions">
      ${task.status !== "hoje" ? `<button class="ghost-btn" data-action="hoje">Hoje</button>` : ""}
      ${task.status !== "andamento" ? `<button class="ghost-btn" data-action="andamento">Em andamento</button>` : ""}
      ${task.status !== "concluida" ? `<button class="primary-btn" data-action="concluida">Concluir</button>` : ""}
      <button class="danger-btn" data-action="delete">Excluir</button>
    </div>
  `;

  item.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "delete") {
        deleteTask(task.id);
      } else {
        updateTaskStatus(task.id, action);
      }
    });
  });

  return item;
}

function renderTasks() {
  const lists = {
    hoje: document.getElementById("tasksHoje"),
    andamento: document.getElementById("tasksAndamento"),
    concluida: document.getElementById("tasksConcluida"),
  };

  Object.values(lists).forEach((list) => {
    if (list) list.innerHTML = "";
  });

  const filteredTasks = sortTasks(getFilteredTasks());

  ["hoje", "andamento", "concluida"].forEach((status) => {
    const statusTasks = filteredTasks.filter((task) => task.status === status);

    if (!statusTasks.length) {
      const empty = document.createElement("p");
      empty.className = "empty-message";
      empty.textContent = "Nada por aqui ainda.";
      lists[status].appendChild(empty);
      return;
    }

    statusTasks.forEach((task) => {
      lists[status].appendChild(renderTaskItem(task));
    });
  });

  updateDashboardNextTask();
}

function updateDashboardNextTask() {
  const nextTask = sortTasks(
    state.tasks.filter((task) => task.status !== "concluida")
  )[0];

  const title = document.getElementById("dashboardNextTaskTitle");
  const meta = document.getElementById("dashboardNextTaskMeta");

  if (!nextTask) {
    title.textContent = "Nenhuma tarefa cadastrada";
    meta.textContent = "Crie uma tarefa para ela aparecer aqui.";
    return;
  }

  title.textContent = nextTask.title;

  const priorityText = {
    alta: "prioridade alta",
    media: "prioridade média",
    baixa: "prioridade baixa",
  }[nextTask.priority];

  meta.textContent = `${nextTask.category} • ${formatTaskDate(nextTask.date)} • ${priorityText}`;
}

function escapeHTML(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("todayText").textContent = formatDate();
  updateGreeting();
  updateHabits();
  updateTimer();
  renderTasks();

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

  document.getElementById("taskForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const title = document.getElementById("taskTitle").value.trim();
    if (!title) return;

    createTask({
      id: crypto.randomUUID(),
      title,
      category: document.getElementById("taskCategory").value,
      priority: document.getElementById("taskPriority").value,
      status: document.getElementById("taskStatus").value,
      date: document.getElementById("taskDate").value,
      description: document.getElementById("taskDescription").value.trim(),
      createdAt: new Date().toISOString(),
    });

    event.target.reset();
    document.getElementById("taskPriority").value = "media";
    document.getElementById("taskStatus").value = "hoje";
  });

  document.getElementById("taskSearch").addEventListener("input", renderTasks);
  document.getElementById("taskFilter").addEventListener("change", renderTasks);
});
