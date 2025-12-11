// Login Validation
document.getElementById("loginForm")?.addEventListener("submit", async function(e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  try {
    const res = await fetch('api/login.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username, password }) });
    const json = await res.json();
    if (!res.ok || !json || json.ok !== true) { alert("❌ Invalid username or password!"); return; }
    localStorage.setItem("userData", JSON.stringify(json.user));
    localStorage.setItem("loggedInUser", json.user.username);
    alert("✅ Login successful!");
    if (json.user.role === "admin") window.location.href = "admin_dashboard.html"; else window.location.href = "dashboard.html";
  } catch (err) { alert('❌ Server error. Please try again.'); }
});


// Register Validation
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (!username || !email || !mobile || !password || !confirmPassword) { alert("⚠️ Please fill all fields!"); return; }
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!emailPattern.test(email)) { alert("❌ Invalid email format!"); return; }
    const mobilePattern = /^[0-9]{10}$/;
    if (!mobilePattern.test(mobile)) { alert("📱 Please enter valid 10-digit mobile number!"); return; }
    if (password.length < 6) { alert("🔒 Password must be at least 6 characters long!"); return; }
    if (password !== confirmPassword) { alert("❌ Passwords do not match!"); return; }
    const role = document.querySelector("input[name='role']:checked").value;
    try {
      const res = await fetch('api/register.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username, email, mobile, password, role }) });
      const json = await res.json();
      if (!res.ok || !json || json.ok !== true) {
        if (json && json.error === 'ADMIN_EXISTS') alert('❌ Admin already exists! Only one admin can register.');
        else if (json && json.error === 'USER_EXISTS') alert('❌ Username or email already exists!');
        else alert('❌ Registration failed!');
        return;
      }
      localStorage.setItem("userData", JSON.stringify(json.user));
      alert("✅ Registration Successful!");
      if (role === "admin") window.location.href = "admin_dashboard.html"; else window.location.href = "dashboard.html";
    } catch (err) { alert('❌ Server error. Please try again.'); }
  });
}
