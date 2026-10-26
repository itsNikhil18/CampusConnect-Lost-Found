import { useEffect, useMemo, useState } from "react";

const API = "http://127.0.0.1:8000/api/reports/";
const starterReports = [
  { id: "demo-1", title: "Black water bottle", item_type: "found", category: "Bottle", description: "Found near the library entrance.", location: "Central Library", event_date: "2026-10-21", contact_email: "demo@mitwpu.edu.in", status: "open" },
  { id: "demo-2", title: "Student ID card", item_type: "lost", category: "ID Card", description: "Lost after the afternoon lecture. Name is visible on the card.", location: "Academic Block", event_date: "2026-10-20", contact_email: "demo@mitwpu.edu.in", status: "open" },
  { id: "demo-3", title: "Blue umbrella", item_type: "found", category: "Accessories", description: "Blue folding umbrella left in a classroom.", location: "Block B, Room 204", event_date: "2026-10-19", contact_email: "demo@mitwpu.edu.in", status: "open" },
];

function App() {
  const [reports, setReports] = useState(starterReports);
  const [apiOnline, setApiOnline] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeView, setActiveView] = useState("community");
  const [myReports, setMyReports] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [authMode, setAuthMode] = useState("");
  const [authToken, setAuthToken] = useState(localStorage.getItem("cc_access") || "");
  const [currentUser, setCurrentUser] = useState(null);
  const [authForm, setAuthForm] = useState({ username: "", first_name: "", last_name: "", email: "", password: "", password_confirm: "", role: "student" });
  const [form, setForm] = useState({
    title: "", item_type: "lost", category: "Electronics", description: "",
    location: "", event_date: new Date().toISOString().slice(0, 10), contact_email: "", image: null,
  });
  const [imagePreview, setImagePreview] = useState("");

  async function loadReports() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("API unavailable");
      const data = await response.json();
      setReports(data);
      setApiOnline(true);
    } catch {
      setApiOnline(false);
    }
  }

  useEffect(() => { loadReports(); }, []);

  async function loadMyReports() {
    if (!authToken) {
      setNotice("Please log in to view your dashboard.");
      setAuthMode("login");
      return;
    }
    setDashboardLoading(true);
    try {
      const response = await fetch(`${API}?mine=true`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        throw new Error(detail.detail || "Could not load your reports.");
      }
      setMyReports(await response.json());
      setActiveView("dashboard");
    } catch (error) {
      setNotice(error.message);
    } finally {
      setDashboardLoading(false);
    }
  }

  async function updateReportStatus(reportId, newStatus) {
    try {
      const response = await fetch(`${API}${reportId}/status/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || data.status || "Could not update report status.");
      }
      setMyReports((current) => current.map((item) => item.id === reportId ? data : item));
      setReports((current) => current.map((item) => item.id === reportId ? data : item));
      setNotice(`Report marked ${newStatus}.`);
    } catch (error) {
      setNotice(error.message);
    }
  }


  const visibleReports = useMemo(() => reports.filter((item) => {
    const matchesType = filter === "all" || item.item_type === filter;
    const haystack = `${item.title} ${item.category} ${item.description} ${item.location}`.toLowerCase();
    return matchesType && haystack.includes(query.toLowerCase());
  }), [reports, filter, query]);

  const lostCount = reports.filter((item) => item.item_type === "lost").length;
  const foundCount = reports.filter((item) => item.item_type === "found").length;

  useEffect(() => {
    if (!authToken) return;
    fetch("http://127.0.0.1:8000/api/auth/me/", { headers: { Authorization: `Bearer ${authToken}` } })
      .then((r) => { if (!r.ok) throw new Error("Session expired"); return r.json(); })
      .then(setCurrentUser)
      .catch(() => { localStorage.removeItem("cc_access"); localStorage.removeItem("cc_refresh"); setAuthToken(""); setCurrentUser(null); });
  }, [authToken]);

  async function submitAuth(event) {
    event.preventDefault();
    setNotice("");
    const endpoint = authMode === "register" ? "register/" : "login/";
    try {
      const payload = authMode === "register"
        ? authForm
        : { username: authForm.email, password: authForm.password };
      const response = await fetch(`http://127.0.0.1:8000/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = Object.entries(data).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(" ") : typeof value === "object" ? JSON.stringify(value) : value}`).join(" ");
        throw new Error(message || "Please check your details.");
      }
      if (authMode === "register") {
        setNotice("Account created. Please log in with your username and password.");
        setAuthMode("login");
        setAuthForm({ username: "", first_name: "", last_name: "", email: "", password: "", password_confirm: "", role: "student" });
      } else {
        localStorage.setItem("cc_access", data.access);
        localStorage.setItem("cc_refresh", data.refresh);
        setAuthToken(data.access);
        const meResponse = await fetch("http://127.0.0.1:8000/api/auth/me/", { headers: { Authorization: `Bearer ${data.access}` } });
        if (meResponse.ok) setCurrentUser(await meResponse.json());
        setAuthMode("");
        setNotice("Welcome to CampusConnect!");
      }
    } catch (error) {
      setNotice(error.message);
    }
  }

  function logout() {
    localStorage.removeItem("cc_access");
    localStorage.removeItem("cc_refresh");
    setAuthToken("");
    setCurrentUser(null);
    setMyReports([]);
    setActiveView("community");
    setNotice("You have been logged out.");
  }

  function updateAuthForm(event) {
    setAuthForm({ ...authForm, [event.target.name]: event.target.value });
  }

  function openReport(type = "lost") {
    if (!authToken || !currentUser) {
      setNotice("Please log in or register before submitting a report.");
      setAuthMode("login");
      return;
    }
    setForm({ ...form, item_type: type });
    setShowForm(true);
  }

  function updateForm(event) {
    const { name, value, files } = event.target;
    if (name === "image") {
      const file = files?.[0] || null;
      setForm((current) => ({ ...current, image: file }));
      setImagePreview(file ? URL.createObjectURL(file) : "");
      return;
    }
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submitReport(event) {
    event.preventDefault();
    setNotice("");
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "image") {
          if (value) payload.append("image", value);
        } else {
          payload.append(key, value);
        }
      });
      const response = await fetch(API, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: payload,
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => ({}));
        throw new Error(Object.entries(detail).map(([key, value]) => `${key}: ${value}`).join(" "));
      }
      const saved = await response.json();
      setReports((current) => [saved, ...current.filter((item) => !String(item.id).startsWith("demo-"))]);
      setApiOnline(true);
      setNotice("Report submitted successfully.");
      setShowForm(false);
      setForm({ title: "", item_type: "lost", category: "Electronics", description: "", location: "", event_date: new Date().toISOString().slice(0, 10), contact_email: "", image: null });
      setImagePreview("");
      loadReports();
      if (activeView === "dashboard") loadMyReports();
    } catch (error) {
      setNotice(apiOnline ? `Could not submit: ${error.message}` : "Backend is offline. Start Django in the backend terminal, then try again.");
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" onClick={(e) => { e.preventDefault(); setActiveView("community"); setShowForm(false); setAuthMode(""); }} aria-label="CampusConnect home">
          <span className="brand-title">CampusConnect</span>
          <small className="brand-subtitle">MIT-WPU Lost N Found</small>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <button className={activeView === "community" && filter === "all" ? "nav-link active" : "nav-link"} onClick={() => { setActiveView("community"); setFilter("all"); }}>Home</button>
          <button className={filter === "lost" ? "nav-link active" : "nav-link"} onClick={() => { setActiveView("community"); setFilter("lost"); }}>Lost</button>
          <button className={filter === "found" ? "nav-link active" : "nav-link"} onClick={() => { setActiveView("community"); setFilter("found"); }}>Found</button>
          {currentUser && <button className={activeView === "dashboard" ? "nav-link active" : "nav-link"} onClick={loadMyReports}>My Reports</button>}
        </nav>
        <div className="top-actions">
          {currentUser ? <div className="user-actions"><span className="welcome-user">{currentUser.first_name || currentUser.username}</span><button className="button button-light" onClick={logout}>Log out</button></div> : <div className="user-actions"><button className="button button-light" onClick={() => setAuthMode("login")}>Login</button><button className="button button-primary" onClick={() => setAuthMode("register")}>Register</button></div>}
        </div>
      </header>
      <main>
        <section className="page-intro">
          <h1>Lost &amp; Found</h1>
          <p>Find what you lost. Help others find what they've lost.</p>
          <div className="intro-actions">
            <button className="button button-primary" onClick={() => openReport("lost")}>Report Lost Item</button>
            <button className="button button-outline" onClick={() => openReport("found")}>Report Found Item</button>
          </div>
        </section>
        {activeView === "dashboard" && <section className="reports-section">
          <div className="section-heading">
            <div><h2>My Reports</h2><p>View and manage the items you have reported.</p></div>
            <button className="button button-outline" onClick={() => setActiveView("community")}>Back to Home</button>
          </div>

          {dashboardLoading ? <div className="empty-state"><p>Loading your reports…</p></div> :
            myReports.length ? <div className="report-grid">{myReports.map((item) => <article className="report-card" key={item.id}>
              <div className={`report-art ${item.item_type}`}>
                {item.image ? <img className="report-photo" src={item.image.startsWith("http") ? item.image : `http://127.0.0.1:8000${item.image}`} alt={item.title} /> : <span>◇</span>}
                <label className={item.item_type}>{item.item_type === "lost" ? "LOST ITEM" : "FOUND ITEM"}</label>
              </div>
              <div className="report-content">
                <div className="report-meta"><span>{item.category}</span><span>•</span><span>{item.event_date}</span></div>
                <h3>{item.title}</h3><p>{item.description}</p>
                <div className="report-location"><span>⌖</span>{item.location}</div>
                <div className="report-footer"><span className={`status ${item.status}`}>{item.status}</span><a href={`mailto:${item.contact_email}?subject=${encodeURIComponent("CampusConnect: " + item.title)}`}>Contact ↗</a></div>
                <label className="status-control">Update status
                  <select value={item.status} onChange={(event) => updateReportStatus(item.id, event.target.value)}>
                    <option value="open">Open</option><option value="claimed">Claimed</option><option value="resolved">Resolved</option>
                  </select>
                </label>
              </div>
            </article>)}</div> :
            <div className="empty-state"><span>▤</span><h3>No reports yet</h3><p>Reports you submit will appear here.</p><button className="button button-primary" onClick={() => { setActiveView("community"); openReport("lost"); }}>Report an item</button></div>}
        </section>}

        {activeView === "community" && <section className="reports-section">
          <div className="section-heading"><div><h2>Recent Reports</h2><p>Browse reports shared by the MIT-WPU community.</p></div><button className="button button-primary" onClick={() => openReport("lost")}>Add Report</button></div>
          <div className="toolbar">
            <label className="searchbox"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search items, places, categories..." /></label>
            <div className="filters">
              {[["all", "All reports"], ["lost", "Lost"], ["found", "Found"]].map(([value, label]) => <button key={value} className={filter === value ? "filter active" : "filter"} onClick={() => setFilter(value)}>{label}</button>)}
            </div>
          </div>

          {visibleReports.length ? <div className="report-grid">{visibleReports.map((item) => <article className="report-card" key={item.id}>
            <div className={`report-art ${item.item_type}`}>
              {item.image
                ? <img className="report-photo" src={item.image.startsWith("http") ? item.image : `http://127.0.0.1:8000${item.image}`} alt={item.title} />
                : <span>{item.category === "Electronics" ? "⌁" : item.category === "ID Card" ? "▤" : item.category === "Bottle" ? "♧" : item.category === "Accessories" ? "✳" : "◇"}</span>}
              <label className={item.item_type}>{item.item_type === "lost" ? "LOST ITEM" : "FOUND ITEM"}</label>
            </div>
            <div className="report-content"><div className="report-meta"><span>{item.category}</span><span>•</span><span>{item.event_date}</span></div><h3>{item.title}</h3><p>{item.description}</p><div className="report-location"><span>⌖</span>{item.location}</div><div className="report-footer"><span className={`status ${item.status}`}>{item.status}</span><a href={`mailto:${item.contact_email}?subject=${encodeURIComponent("CampusConnect: " + item.title)}`}>Contact reporter ↗</a></div></div>
          </article>)}</div> : <div className="empty-state"><span>⌕</span><h3>No reports found</h3><p>Try another search, or create a new report.</p><button className="button button-primary" onClick={() => openReport("lost")}>Report an item</button></div>}
        </section>}


      </main>

      <footer>
        <a className="brand footer-brand" href="#" onClick={(e) => { e.preventDefault(); setActiveView("community"); }}>CampusConnect</a>
        <span>Built for a more connected campus.</span>
        <span>CampusConnect © 2026</span>
        <div className="project-credits">Developed with ❤️ by <strong>Nikhil &amp; Sagar</strong><small>MCA Project | MIT-WPU</small></div>
      </footer>


      {authMode && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setAuthMode(""); }}><section className="modal auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <div className="modal-heading"><div><div className="eyebrow dark">MIT-WPU COMMUNITY</div><h2 id="auth-title">{authMode === "register" ? "Create your account" : "Welcome back"}</h2><p>{authMode === "register" ? "Register with your campus email to join CampusConnect." : "Log in to report lost or found items."}</p></div><button className="close-button" onClick={() => setAuthMode("")} aria-label="Close">×</button></div>
        <form onSubmit={submitAuth} className="report-form">
          {authMode === "register" && <>
            <label>First name<input name="first_name" value={authForm.first_name} onChange={updateAuthForm} required /></label>
            <label>Last name<input name="last_name" value={authForm.last_name} onChange={updateAuthForm} required /></label>
            <label>Username<input name="username" value={authForm.username} onChange={updateAuthForm} minLength="3" required /></label>
            <label>Account type<select name="role" value={authForm.role} onChange={updateAuthForm}><option value="student">Student</option><option value="staff">Staff</option></select></label>
          </>}
          <label className="full-field">MIT-WPU email<input type="email" name="email" value={authForm.email} onChange={updateAuthForm} placeholder="you@mitwpu.edu.in" required /></label>
          <label className="full-field">Password<input type="password" name="password" value={authForm.password} onChange={updateAuthForm} minLength="8" autoComplete={authMode === "register" ? "new-password" : "current-password"} required /></label>
          {authMode === "register" && <label className="full-field">Confirm password<input type="password" name="password_confirm" value={authForm.password_confirm} onChange={updateAuthForm} minLength="8" autoComplete="new-password" required /></label>}
          <div className="auth-note full-field">Email-domain check only: email ownership is not verified by a confirmation code yet.</div>
          <div className="form-actions"><button type="button" className="button button-outline" onClick={() => setAuthMode(authMode === "register" ? "login" : "register")}>{authMode === "register" ? "I have an account" : "Create account"}</button><button type="submit" className="button button-primary">{authMode === "register" ? "Register ↗" : "Log in ↗"}</button></div>
        </form>
      </section></div>}

      {showForm && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="form-title"><div className="modal-heading"><div><div className="eyebrow dark">COMMUNITY REPORT</div><h2 id="form-title">Report an item</h2><p>Share enough details to help it find its way home.</p></div><button className="close-button" onClick={() => setShowForm(false)} aria-label="Close">×</button></div>
        <form onSubmit={submitReport} className="report-form">
          <label>Report type<select name="item_type" value={form.item_type} onChange={updateForm}><option value="lost">I lost an item</option><option value="found">I found an item</option></select></label>
          <label>Item name<input name="title" value={form.title} onChange={updateForm} placeholder="e.g. Black water bottle" required maxLength="120" /></label>
          <label>Category<select name="category" value={form.category} onChange={updateForm}>{["Electronics", "ID Card", "Bottle", "Accessories", "Books", "Clothing", "Keys", "Bag", "Other"].map((c) => <option key={c}>{c}</option>)}</select></label>
          <label>Location on campus<input name="location" value={form.location} onChange={updateForm} placeholder="e.g. Library, Block B" required /></label>
          <label>Date lost/found<input type="date" name="event_date" value={form.event_date} onChange={updateForm} required /></label>
          <label>Contact email<input type="email" name="contact_email" value={form.contact_email} onChange={updateForm} placeholder="you@mitwpu.edu.in" required /></label>
          <label className="full-field">Description<textarea name="description" value={form.description} onChange={updateForm} placeholder="Describe the item and any identifying details..." required rows="3" /></label>
          <label className="full-field">Item photo (optional)
            <input type="file" name="image" accept="image/*" onChange={updateForm} />
          </label>
          {imagePreview && <div className="image-preview-wrap full-field">
            <img className="image-preview" src={imagePreview} alt="Selected item preview" />
            <button type="button" className="button button-light" onClick={() => { setForm((current) => ({ ...current, image: null })); setImagePreview(""); }}>Remove photo</button>
          </div>}
          <div className="form-actions"><button type="button" className="button button-outline" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="button button-primary">Submit report ↗</button></div>
        </form>
      </section></div>}
      {notice && <div className="toast" role="status"><span>{notice}</span><button onClick={() => setNotice("")}>×</button></div>}
    </div>
  );
}

export default App;
