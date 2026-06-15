"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", password: "" });
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    const res = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.message);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    router.push("/dashboard");
  };

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <h2 style={styles.title}>Leave Management System</h2>
        <p style={styles.sub}>Sign in to continue</p>
        {error && <p style={styles.error}>{error}</p>}
        <input
          style={styles.input}
          placeholder="Name (A / B / C / D / admin)"
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
        <button style={styles.btn} onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#eff6ff" },
  box: { background: "white", padding: 36, borderRadius: 12, width: 340, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" },
  title: { fontSize: 20, fontWeight: 700, color: "#1d4ed8", marginBottom: 4 },
  sub: { fontSize: 13, color: "#6b7280", marginBottom: 20 },
  error: { background: "#fee2e2", color: "#b91c1c", padding: "8px 12px", borderRadius: 6, fontSize: 13, marginBottom: 12 },
  input: { width: "100%", padding: "10px 12px", marginBottom: 12, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14 },
  btn: { width: "100%", padding: "11px", background: "#2563eb", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer" },
};