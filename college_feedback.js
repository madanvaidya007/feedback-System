document.getElementById("feedbackForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const user = JSON.parse(localStorage.getItem("userData") || "{}");
  const username = user && user.username ? user.username : "guest";
  const subject = "College Feedback";

  const labels = ["excellent","verygood","good","fair","poor"];
  const answers = {};
  for (let i = 1; i <= 15; i++) {
    const name = "q" + i;
    const inputs = document.querySelectorAll("input[name='"+name+"']");
    let sel = -1;
    inputs.forEach((inp, idx) => { if (inp.checked) sel = idx; });
    if (sel < 0) { alert("Please answer question " + i + "."); return; }
    answers[name] = labels[sel];
  }

  const suggestion = document.getElementById("suggestions").value.trim();

  try {
    const res = await fetch("api/submit_feedback.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, subject, answers, suggestion: suggestion || null })
    });
    const json = await res.json();
    if (!res.ok || !json || json.ok !== true) throw new Error("Submit failed");
  } catch (err) {
    alert("Server error. Please try again.");
    return;
  }

  alert("Thank you for your feedback!");
  window.location.href = "dashboard.html";
});
