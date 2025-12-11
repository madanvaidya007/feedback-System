/* ---------------- GET LOGGED-IN USER ---------------- */
const user = JSON.parse(localStorage.getItem("userData"));
const username = user ? user.username : "guest";

/* ---------------- SUBJECTS ---------------- */
const subjectsBySemester = {
  3: [
    "Engineering Mathematics III",
    "Discrete Mathematics",
    "Data Structures",
    "Computer Architecture & Organization",
    "OOP in C++ / Java",
    "Data Structures Lab & OOP Lab",
    "Seminar I",
  ],
  5: [
    "Database Systems",
    "Theory of Computation",
    "Software Engineering",
    "Human Computer Interaction / Numerical Methods",
    "Economics & Management / Business Communication",
    "Database & SE Lab",
    "Mini Project I",
  ],
  6: [
    "Compiler Design",
    "Computer Networks",
    "Machine Learning",
    "GIS / IoT / Embedded Systems",
  ],
  7: [
    "Artificial Intelligence",
    "Cloud Computing",
    "Bioinformatics / Big Data / Distributed Systems",
    "Cryptography / Business Intelligence / Blockchain",
    "Virtual Reality / Deep Learning / Design Thinking",
    "AI & Cloud Computing Lab",
    "Project Phase I",
  ],
  8: ["Project Phase II (In-house / Industry Internship)"],
};

/* ---------------- SELECTORS ---------------- */
const branchSelect = document.getElementById("branch");
const semesterSelect = document.getElementById("semester");
const subjectBody = document.getElementById("subjectBody");
const addSubjectBtn = document.getElementById("addSubjectBtn");
const submitFeedbackBtn = document.getElementById("submitFeedbackBtn");

/* ---------------- SAVE SELECTION (PER STUDENT) ---------------- */
branchSelect.addEventListener("change", () => {
  localStorage.setItem(`selectedBranch_${username}`, branchSelect.value);
  loadSubjects();
});

semesterSelect.addEventListener("change", () => {
  localStorage.setItem(`selectedSemester_${username}`, semesterSelect.value);
  loadSubjects();
});

/* ---------------- RESTORE SAVED SELECTION ---------------- */
window.addEventListener("load", () => {
  const savedBranch = localStorage.getItem(`selectedBranch_${username}`);
  const savedSemester = localStorage.getItem(`selectedSemester_${username}`);

  if (savedBranch) branchSelect.value = savedBranch;
  if (savedSemester) semesterSelect.value = savedSemester;

  if (savedBranch && savedSemester) loadSubjects();
});

/* ---------------- LOAD SUBJECTS ---------------- */
function loadSubjects() {
  const branch = branchSelect.value;
  const semester = semesterSelect.value;

  if (branch !== "cse" || !semester) {
    subjectBody.innerHTML =
      '<tr><td colspan="4" class="empty">Select branch and semester to view subjects</td></tr>';
    return;
  }

  const subjects = subjectsBySemester[semester] || [];
  renderSubjects(subjects);
}

/* ---------------- RENDER SUBJECTS ---------------- */
function renderSubjects(subjects) {
  subjectBody.innerHTML = "";

  subjects.forEach((subject, index) => {
    addRow(subject, getFeedbackStatus(subject), index + 1);
  });
  updateProgress(subjects);
}

/* ---------------- ADD ROW ---------------- */
function addRow(subjectName, status = "Pending", index = null) {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${index}</td>
    <td>${subjectName}</td>
    <td class="status">${status}</td>
    <td>
      <button class="fill-btn">
        ${status === "Done" ? "✅ Done" : "Fill Feedback"}
      </button>
    </td>
  `;

  subjectBody.appendChild(row);

  const fillBtn = row.querySelector(".fill-btn");

  fillBtn.addEventListener("click", () => {
    if (status === "Done") return;

    localStorage.setItem(`currentSubject_${username}`, subjectName);
    window.location.href = "teacher_feedback.html";
  });
}

/* ---------------- GET STATUS (PER STUDENT) ---------------- */
function getFeedbackStatus(subjectName) {
  const doneSubjects = JSON.parse(localStorage.getItem(`doneSubjects_${username}`) || "[]");
  return doneSubjects.includes(subjectName) ? "Done" : "Pending";
}

/* ---------------- FINAL SUBMIT ---------------- */
submitFeedbackBtn.addEventListener("click", () => {
  const rows = subjectBody.querySelectorAll("tr");

  const pending = Array.from(rows).some(
    row => row.querySelector(".status").textContent !== "Done"
  );

  if (pending) {
    alert("⚠ Please complete all subjects first!");
  } else {
    alert("🎉 All feedback submitted!");
    localStorage.removeItem(`doneSubjects_${username}`);
    window.location.href = "dashboard.html";
  }
});

function updateProgress(subjects){
  const done = JSON.parse(localStorage.getItem(`doneSubjects_${username}`) || "[]");
  const total = subjects.length;
  const count = subjects.filter(s => done.includes(s)).length;
  const pct = total ? Math.round((count/total)*100) : 0;
  const bar = document.getElementById('progressBar');
  const text = document.getElementById('progressText');
  if (bar) bar.style.width = pct + '%';
  if (text) text.textContent = `Progress: ${count}/${total}`;
}
