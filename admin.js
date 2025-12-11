// admin.js - One-page admin with charts, excel, pdf
// LOGO path from uploaded file per developer instruction:
const LOGO_URL = "/mnt/data/tea.txt"; // replace if needed

// storage keys
const AGG_KEY = "feedbackData";         // aggregated counts per subject
const RESP_KEY = "feedbackResponses";   // list of per-student responses
const SUG_KEY = "suggestionsList";      // suggestions array

// UI elements
const menuResults = document.getElementById("menuResults");
const menuSuggestions = document.getElementById("menuSuggestions");
const menuProfile = document.getElementById("menuProfile");
const menuChangePass = document.getElementById("menuChangePass");
const logoutBtn = document.getElementById("logoutBtn");

const resultsSection = document.getElementById("resultsSection");
const suggestionsSection = document.getElementById("suggestionsSection");
const profileSection = document.getElementById("profileSection");
const changePassSection = document.getElementById("changePassSection");

const subjectSelect = document.getElementById("subjectSelect");
const summaryTbody = document.querySelector("#summaryTable tbody");
const pieCanvas = document.getElementById("pieCanvas");
const barCanvas = document.getElementById("barCanvas");
const downloadExcelBtn = document.getElementById("downloadExcel");
const downloadPdfAllBtn = document.getElementById("downloadPdfAll");
const downloadPdfSubBtn = document.getElementById("downloadPdfSub");

const suggestionsList = document.getElementById("suggestionsList");
const adminUserSpan = document.getElementById("adminUser");
const adminEmailSpan = document.getElementById("adminEmail");

const oldPassInput = document.getElementById("oldPass");
const newPassInput = document.getElementById("newPass");
const confirmPassInput = document.getElementById("confirmPass");
const changePassBtn = document.getElementById("changePassBtn");

const logoImg = document.getElementById("logoImg");
const sidebarToggle = document.getElementById("sidebarToggle");

// set logo if available
logoImg.src = LOGO_URL;

// init storage if missing
if (!localStorage.getItem(AGG_KEY)) localStorage.setItem(AGG_KEY, "{}");
if (!localStorage.getItem(RESP_KEY)) localStorage.setItem(RESP_KEY, "[]");
if (!localStorage.getItem(SUG_KEY)) localStorage.setItem(SUG_KEY, "[]");

// simple nav
menuResults.addEventListener("click", () => showSection("results"));
menuSuggestions.addEventListener("click", () => showSection("suggestions"));
menuProfile.addEventListener("click", () => showSection("profile"));
menuChangePass.addEventListener("click", () => showSection("changePass"));
logoutBtn.addEventListener("click", () => { localStorage.removeItem("loggedInUser"); window.location.href = "login.html"; });
sidebarToggle?.addEventListener("click", () => {
  const container = document.querySelector('.admin-container');
  if (!container) return;
  container.classList.toggle('nav-open');
});

function showSection(key) {
  document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
  menuResults.classList.remove("active");
  menuSuggestions.classList.remove("active");
  menuProfile.classList.remove("active");
  menuChangePass.classList.remove("active");

  if (key === "results") { resultsSection.classList.remove("hidden"); menuResults.classList.add("active"); loadResults(); }
  if (key === "suggestions") { suggestionsSection.classList.remove("hidden"); menuSuggestions.classList.add("active"); loadSuggestions(); }
  if (key === "profile") { profileSection.classList.remove("hidden"); menuProfile.classList.add("active"); loadProfile(); }
  if (key === "changePass") { changePassSection.classList.remove("hidden"); menuChangePass.classList.add("active"); }
}

// populate summary table and subject list
async function loadResults() {
  let data = {};
  try {
    const res = await fetch("api/get_aggregate.php");
    const json = await res.json();
    if (res.ok && json && json.data) {
      data = json.data;
      localStorage.setItem(AGG_KEY, JSON.stringify(data));
    } else {
      data = JSON.parse(localStorage.getItem(AGG_KEY) || "{}");
    }
  } catch (e) {
    data = JSON.parse(localStorage.getItem(AGG_KEY) || "{}");
  }
  try {
    const rres = await fetch("api/get_responses.php");
    const rjson = await rres.json();
    if (rres.ok && rjson && rjson.data) {
      localStorage.setItem(RESP_KEY, JSON.stringify(rjson.data));
    }
  } catch (e) {}
  summaryTbody.innerHTML = "";
  subjectSelect.innerHTML = '<option value="">-- choose subject --</option>';
  updateMetrics(data);

  for (const subject in data) {
    const d = data[subject];
    const total = (d.excellent + d.verygood + d.good + d.fair + d.poor) || 0;
    if (total === 0) continue;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${subject}</td>
      <td>${((d.excellent / total) * 100).toFixed(1)}%</td>
      <td>${((d.verygood / total) * 100).toFixed(1)}%</td>
      <td>${((d.good / total) * 100).toFixed(1)}%</td>
      <td>${((d.fair / total) * 100).toFixed(1)}%</td>
      <td>${((d.poor / total) * 100).toFixed(1)}%</td>
    `;
    summaryTbody.appendChild(tr);

    const opt = document.createElement("option");
    opt.value = subject;
    opt.textContent = subject;
    subjectSelect.appendChild(opt);
  }

  // if a subject is selected, update charts; else clear charts
  let sel = subjectSelect.value;
  if (!sel && subjectSelect.options.length > 1) {
    sel = subjectSelect.options[1].value;
    subjectSelect.value = sel;
  }
  if (sel) { updateCharts(sel); } else { clearCharts(); }
  renderStudentTableForSelected();
}

function updateMetrics(data) {
  let subjects = 0;
  let totalRatings = 0;
  let excellentRate = 0;
  for (const k in data) {
    const d = data[k];
    const t = (d.excellent + d.verygood + d.good + d.fair + d.poor) || 0;
    if (t > 0) {
      subjects++;
      totalRatings += t;
    }
  }
  const sel = subjectSelect.value;
  if (sel && data[sel]) {
    const d = data[sel];
    const t = (d.excellent + d.verygood + d.good + d.fair + d.poor) || 0;
    excellentRate = t ? ((d.excellent / t) * 100).toFixed(1) : 0;
  }
  const elSub = document.getElementById("metricSubjects");
  const elTot = document.getElementById("metricTotalRatings");
  const elExc = document.getElementById("metricExcellentRate");
  if (elSub) elSub.textContent = String(subjects);
  if (elTot) elTot.textContent = String(totalRatings);
  if (elExc) elExc.textContent = (excellentRate || 0) + "%";
  const hasData = subjects > 0;
  downloadExcelBtn.disabled = !hasData;
  downloadPdfAllBtn.disabled = !hasData;
  downloadPdfSubBtn.disabled = !(sel && data[sel] && ((data[sel].excellent + data[sel].verygood + data[sel].good + data[sel].fair + data[sel].poor) > 0));
}

// suggestions list
async function loadSuggestions() {
  suggestionsList.innerHTML = "";
  let list = [];
  try {
    const res = await fetch("api/get_suggestions.php");
    const json = await res.json();
    if (res.ok && json && json.data) list = json.data;
  } catch (e) {}
  if (!list || list.length === 0) { suggestionsList.innerHTML = "<li>No suggestions yet.</li>"; return; }
  list.forEach(s => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${s.subject}</strong> — ${s.text} <div class="muted">By ${s.user} on ${new Date(s.date).toLocaleString()}</div>`;
    suggestionsList.appendChild(li);
  });
}

// profile
function loadProfile() {
  const user = JSON.parse(localStorage.getItem("userData") || "{}");
  adminUserSpan.textContent = user.username || "admin";
  adminEmailSpan.textContent = user.email || "admin@site.com";
}

// change password logic
changePassBtn.addEventListener("click", async () => {
  const oldP = oldPassInput.value.trim();
  const newP = newPassInput.value.trim();
  const conf = confirmPassInput.value.trim();
  const user = JSON.parse(localStorage.getItem("userData") || "{}");
  if (!user || user.role !== "admin") { alert("Only admin can change password."); return; }
  if (newP.length < 5) { alert("Password too short."); return; }
  if (newP !== conf) { alert("Confirmation mismatch."); return; }
  try {
    const res = await fetch("api/change_password.php", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ username: user.username, old_password: oldP, new_password: newP }) });
    const json = await res.json();
    if (!res.ok || !json || json.ok !== true) { alert("Failed to update password."); return; }
    alert("Password updated. Redirecting to dashboard.");
    window.location.href = "admin_dashboard.html";
  } catch (e) { alert("Server error. Try again."); }
});

// charts
let pieChart = null, barChart = null;
function updateCharts(subject) {
  const data = JSON.parse(localStorage.getItem(AGG_KEY) || "{}");
  const d = data[subject] || {excellent:0,verygood:0,good:0,fair:0,poor:0};
  const total = d.excellent + d.verygood + d.good + d.fair + d.poor || 0;
  const values = [
    ((d.excellent/ (total||1)) *100).toFixed(1),
    ((d.verygood/ (total||1))*100).toFixed(1),
    ((d.good/ (total||1))*100).toFixed(1),
    ((d.fair/ (total||1))*100).toFixed(1),
    ((d.poor/ (total||1))*100).toFixed(1)
  ].map(x => Number(x));

  const labels = ["Excellent","Very Good","Good","Fair","Poor"];
  const colors = ["#28a745","#17a2b8","#ffc107","#fd7e14","#dc3545"];

  // pie
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(pieCanvas.getContext("2d"), {
    type: "pie",
    data: { labels, datasets:[{ data: values, backgroundColor: colors }] },
    options: { responsive:false, maintainAspectRatio:true, plugins:{ title:{ display:true, text:`Distribution - ${subject}` } } }
  });

  // bar
  if (barChart) barChart.destroy();
  barChart = new Chart(barCanvas.getContext("2d"), {
    type: "bar",
    data: { labels, datasets:[{ label: "%", data: values, backgroundColor: colors }] },
    options: { responsive:false, maintainAspectRatio:true, scales:{ y:{ beginAtZero:true, max:100 } }, plugins:{ title:{ display:true, text:`% Ratings - ${subject}` } } }
  });
}

function clearCharts() {
  if (pieChart) { pieChart.destroy(); pieChart=null; }
  if (barChart) { barChart.destroy(); barChart=null; }
  const ctx1 = pieCanvas.getContext("2d"); ctx1.clearRect(0,0,pieCanvas.width,pieCanvas.height);
  const ctx2 = barCanvas.getContext("2d"); ctx2.clearRect(0,0,barCanvas.width,barCanvas.height);
}

// handle subject selection change
subjectSelect.addEventListener("change", (e) => {
  const s = e.target.value;
  if (s) updateCharts(s);
  else clearCharts();
  const data = JSON.parse(localStorage.getItem(AGG_KEY) || "{}");
  updateMetrics(data);
  renderStudentTableForSelected();
});

function renderStudentTableForSelected() {
  const wrap = document.getElementById('studentTableWrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  const subj = subjectSelect.value;
  if (!subj) return;
  const card = document.createElement('div');
  card.className = 'student-table-card';
  const filterText = document.getElementById('studentFilter') ? document.getElementById('studentFilter').value : '';
  card.appendChild(buildStudentTableDOM(subj, filterText));
  wrap.appendChild(card);
}

document.getElementById('studentFilter')?.addEventListener('input', () => renderStudentTableForSelected());

// Excel export using SheetJS
downloadExcelBtn.addEventListener("click", () => {
  const data = JSON.parse(localStorage.getItem(AGG_KEY) || "{}");
  const rows = [["Subject","Excellent %","Very Good %","Good %","Fair %","Poor %"]];
  for (const subj in data) {
    const d = data[subj];
    const total = d.excellent + d.verygood + d.good + d.fair + d.poor || 0;
    rows.push([
      subj,
      total ? ((d.excellent/total)*100).toFixed(1) : "0.0",
      total ? ((d.verygood/total)*100).toFixed(1) : "0.0",
      total ? ((d.good/total)*100).toFixed(1) : "0.0",
      total ? ((d.fair/total)*100).toFixed(1) : "0.0",
      total ? ((d.poor/total)*100).toFixed(1) : "0.0",
    ]);
  }
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Feedback");
  XLSX.writeFile(wb, "Feedback_Report.xlsx");
});

// PDF generation helpers
async function domToImage(node) {
  const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#ffffff", useCORS:true });
  return canvas.toDataURL("image/png");
}

// generate single-subject PDF
downloadPdfSubBtn.addEventListener("click", async () => {
  const subj = subjectSelect.value;
  if (!subj) { alert("Select a subject first."); return; }
  await generateSubjectPDF(subj);
});

// generate full multi-page PDF (one page per subject)
downloadPdfAllBtn.addEventListener("click", async () => {
  await generateFullPDF();
});

// get student responses for a subject
function getResponsesFor(subject) {
  const all = JSON.parse(localStorage.getItem(RESP_KEY) || "[]");
  return all.filter(r => r.subject === subject);
}

// Build student-wise table DOM for subject
function buildStudentTableDOM(subject, filterText = "") {
  const responses = getResponsesFor(subject).filter(r => !filterText || (r.username || "").toLowerCase().includes(filterText.toLowerCase()));
  const wrap = document.createElement("div");
  wrap.style.background = "#fff"; wrap.style.padding = "8px"; wrap.style.borderRadius = "6px";
  const title = document.createElement("h4"); title.textContent = `Student-wise responses (${responses.length})`; wrap.appendChild(title);

  if (responses.length === 0) {
    const p = document.createElement("p"); p.textContent = "No responses yet."; wrap.appendChild(p); return wrap;
  }

  const table = document.createElement("table");
  table.style.borderCollapse = "collapse"; table.style.width = "100%"; table.style.fontSize="11px";
  const thead = document.createElement("thead");
  thead.innerHTML = `<tr><th style="border:1px solid #ddd;padding:6px">Student</th><th style="border:1px solid #ddd;padding:6px">Date</th><th style="border:1px solid #ddd;padding:6px">Excellent</th><th style="border:1px solid #ddd;padding:6px">Very Good</th><th style="border:1px solid #ddd;padding:6px">Good</th><th style="border:1px solid #ddd;padding:6px">Fair</th><th style="border:1px solid #ddd;padding:6px">Poor</th><th style="border:1px solid #ddd;padding:6px">Suggestion</th></tr>`;
  table.appendChild(thead);
  const tbody = document.createElement("tbody");
  responses.forEach(r => {
    const counts = { excellent:0, verygood:0, good:0, fair:0, poor:0 };
    for (const q in r.answers) { const v = r.answers[q]; if (counts[v] !== undefined) counts[v]++; }
    const tr = document.createElement("tr");
    tr.innerHTML = `<td style="border:1px solid #eee;padding:6px">${r.username}</td><td style="border:1px solid #eee;padding:6px">${new Date(r.date).toLocaleString()}</td>
      <td style="border:1px solid #eee;padding:6px">${counts.excellent}</td><td style="border:1px solid #eee;padding:6px">${counts.verygood}</td><td style="border:1px solid #eee;padding:6px">${counts.good}</td><td style="border:1px solid #eee;padding:6px">${counts.fair}</td><td style="border:1px solid #eee;padding:6px">${counts.poor}</td>
      <td style="border:1px solid #eee;padding:6px">${r.suggestion || ""}</td>`;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  return wrap;
}

// generate a single-subject pdf (chart + student table + summary)
async function generateSubjectPDF(subject) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  let y = 40;

  // Title
  pdf.setFontSize(16);
  pdf.text(`Subject Report: ${subject}`, margin, y);
  y += 18;
  pdf.setFontSize(10);
  const agg = JSON.parse(localStorage.getItem(AGG_KEY) || "{}")[subject] || {excellent:0,verygood:0,good:0,fair:0,poor:0};
  const total = agg.excellent+agg.verygood+agg.good+agg.fair+agg.poor || 0;
  pdf.text(`Total responses (sum across questions & students): ${total}`, margin, y); y+=16;

  // create temporary chart for subject
  const tmpWrap = document.createElement("div");
  tmpWrap.style.width = "600px"; tmpWrap.style.height = "350px"; tmpWrap.style.position="absolute"; tmpWrap.style.left="-9999px";
  const tmpCanvas = document.createElement("canvas"); tmpCanvas.width=600; tmpCanvas.height=350; tmpWrap.appendChild(tmpCanvas);
  document.body.appendChild(tmpWrap);

  // render bar chart
  const values = [
    agg.excellent?((agg.excellent/ (total||1))*100).toFixed(1):0,
    agg.verygood?((agg.verygood/ (total||1))*100).toFixed(1):0,
    agg.good?((agg.good/ (total||1))*100).toFixed(1):0,
    agg.fair?((agg.fair/ (total||1))*100).toFixed(1):0,
    agg.poor?((agg.poor/ (total||1))*100).toFixed(1):0
  ].map(Number);
  const tmpChart = new Chart(tmpCanvas.getContext("2d"), {
    type: "bar",
    data: { labels:["Excellent","Very Good","Good","Fair","Poor"], datasets:[{ data: values, backgroundColor:["#28a745","#17a2b8","#ffc107","#fd7e14","#dc3545"] }]},
    options: { plugins:{ title:{ display:true, text:`% Ratings - ${subject}` } }, scales:{ y:{ beginAtZero:true, max:100 } } }
  });
  await new Promise(r => setTimeout(r,300));
  const chartImg = await html2canvas(tmpCanvas, { scale: 2, backgroundColor:"#ffffff" });
  pdf.addImage(chartImg.toDataURL("image/png"), "PNG", margin, y, 520, 220);
  tmpChart.destroy(); document.body.removeChild(tmpWrap);
  y += 230;

  // add student table (as image)
  const stDom = buildStudentTableDOM(subject);
  stDom.style.position="absolute"; stDom.style.left="-9999px"; document.body.appendChild(stDom);
  await new Promise(r => setTimeout(r,150));
  const stImg = await html2canvas(stDom, { scale: 2, backgroundColor:"#ffffff" });
  pdf.addImage(stImg.toDataURL("image/png"), "PNG", margin, y, 520, 400);
  document.body.removeChild(stDom);

  pdf.save(`${subject.replace(/\s+/g,'_')}_Report.pdf`);
}

// full PDF: summary page + per-subject pages
async function generateFullPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  let y = 40;

  // Title & date
  pdf.setFontSize(18); pdf.text("Full Feedback Report", margin, y); y+=18;
  pdf.setFontSize(10); pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, y); y+=18;

  // add summary table image
  const tableNode = document.getElementById("summaryTable");
  const tableImgData = await html2canvas(tableNode, { scale: 2, backgroundColor: "#ffffff" });
  pdf.addImage(tableImgData.toDataURL("image/png"), "PNG", margin, y, 520, 200);
  y += 220;

  const agg = JSON.parse(localStorage.getItem(AGG_KEY) || "{}");
  for (const subject in agg) {
    const d = agg[subject];
    const total = d.excellent+d.verygood+d.good+d.fair+d.poor || 0;
    if (total === 0) continue;

    pdf.addPage();
    y = 40; pdf.setFontSize(14); pdf.text(subject, margin, y); y+=18;
    pdf.setFontSize(10); pdf.text(`Responses (sum across Qs & students): ${total}`, margin, y); y+=12;

    // create chart and student table similar to single-subject
    // chart
    const tmpWrap = document.createElement("div");
    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = 600; tmpCanvas.height = 320;
    tmpWrap.style.position="absolute"; tmpWrap.style.left="-9999px"; tmpWrap.appendChild(tmpCanvas);
    document.body.appendChild(tmpWrap);

    const tmpChart = new Chart(tmpCanvas.getContext("2d"), {
      type: "pie",
      data: {
        labels:["Excellent","Very Good","Good","Fair","Poor"],
        datasets:[{ data:[
          ((d.excellent/(total||1))*100).toFixed(1),
          ((d.verygood/(total||1))*100).toFixed(1),
          ((d.good/(total||1))*100).toFixed(1),
          ((d.fair/(total||1))*100).toFixed(1),
          ((d.poor/(total||1))*100).toFixed(1)
        ].map(Number), backgroundColor:["#28a745","#17a2b8","#ffc107","#fd7e14","#dc3545"] }]
      },
      options: { plugins:{ title:{ display:true, text:`Distribution - ${subject}` } } }
    });
    await new Promise(r=>setTimeout(r,300));
    const chartImg = await html2canvas(tmpCanvas, { scale:2, backgroundColor:"#ffffff" });
    pdf.addImage(chartImg.toDataURL("image/png"), "PNG", margin, y, 260, 200);
    tmpChart.destroy(); document.body.removeChild(tmpWrap);

    // student table
    const stDom = buildStudentTableDOM(subject);
    stDom.style.position="absolute"; stDom.style.left="-9999px"; document.body.appendChild(stDom);
    await new Promise(r=>setTimeout(r,150));
    const stImg = await html2canvas(stDom, { scale: 2, backgroundColor:"#ffffff" });
    pdf.addImage(stImg.toDataURL("image/png"), "PNG", margin + 280, y, 260, 300);
    document.body.removeChild(stDom);
  }

  pdf.save(`Full_Feedback_Report_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.pdf`);
}

// initial load
showSection("results");
loadResults();
