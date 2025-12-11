// SHOW CURRENT SUBJECT NAME
const userObj = JSON.parse(localStorage.getItem("userData") || "{}");
const username = userObj && userObj.username ? userObj.username : "guest";
const subject = localStorage.getItem("currentSubject_" + username) || localStorage.getItem("currentSubject");
document.getElementById("subjectTitle").textContent = "Subject: " + (subject || "");

// SUBMIT FEEDBACK
document.getElementById("teacherFeedbackForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  if (!subject) {
    alert("Subject not found!");
    return;
  }

  const labels = ["excellent","verygood","good","fair","poor"];
  const answers = {};
  const rows = document.querySelectorAll("tbody tr");
  rows.forEach((row, idx) => {
    const qName = "q" + (idx + 1);
    const inputs = row.querySelectorAll(`input[name='${qName}']`);
    let selIdx = -1;
    inputs.forEach((inp, i) => { if (inp.checked) selIdx = i; });
    if (selIdx >= 0) {
      answers[qName] = labels[selIdx];
    }
  });

  const sug = document.getElementById("suggestions").value.trim();

  try {
    const res = await fetch("api/submit_feedback.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, subject, answers, suggestion: sug || null })
    });
    const json = await res.json();
    if (!res.ok || !json || json.ok !== true) {
      throw new Error(json && json.error ? json.error : "SUBMIT_FAILED");
    }
  } catch (err) {
    alert("Failed to submit to server. Please try again.");
    return;
  }

  let doneSubjects = JSON.parse(localStorage.getItem("doneSubjects_" + username) || "[]");
  if (!doneSubjects.includes(subject)) {
    doneSubjects.push(subject);
    localStorage.setItem("doneSubjects_" + username, JSON.stringify(doneSubjects));
  }

  alert("✅ Feedback submitted successfully!");
  localStorage.removeItem("currentSubject_" + username);
  window.location.href = "feedback.html";
});
