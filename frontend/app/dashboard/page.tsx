"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = "http://localhost:5000";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState("");
  const [leaves, setLeaves] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [tab, setTab] = useState("leaves");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editLeave, setEditLeave] = useState<any>(null);

  const [form, setForm] = useState({
    leaveType: "", startDate: "", endDate: "", reason: "",
  });

  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (!t || !u) { router.push("/login"); return; }
    setToken(t);
    const parsed = JSON.parse(u);
    setUser(parsed);
    setBalance(parsed.leaveBalance);
  }, []);

  useEffect(() => {
    if (token) fetchLeaves();
  }, [token]);

  const headers = { "Content-Type": "application/json", Authorization: token };

  const fetchLeaves = async () => {
    const res = await fetch(`${API}/api/leaves`, { headers });
    const data = await res.json();
    setLeaves(Array.isArray(data) ? data : []);
  };

  const fetchBalance = async () => {
    const res = await fetch(`${API}/api/users/me`, { headers });
    const data = await res.json();
    setBalance(data.leaveBalance);
    const u = JSON.parse(localStorage.getItem("user")!);
    u.leaveBalance = data.leaveBalance;
    localStorage.setItem("user", JSON.stringify(u));
  };

  const applyLeave = async () => {
    setError(""); setSuccess("");
    const res = await fetch(`${API}/api/leaves`, {
      method: "POST", headers,
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.message);
    setSuccess("Leave applied!");
    setBalance(data.leaveBalance);
    setForm({ leaveType: "", startDate: "", endDate: "", reason: "" });
    fetchLeaves();
  };

  const deleteLeave = async (id: string) => {
    const res = await fetch(`${API}/api/leaves/${id}`, { method: "DELETE", headers });
    const data = await res.json();
    if (!res.ok) return setError(data.message);
    setSuccess("Leave deleted.");
    setBalance(data.leaveBalance);
    fetchLeaves();
  };

  const submitEdit = async () => {
    setError(""); setSuccess("");
    const res = await fetch(`${API}/api/leaves/${editLeave._id}`, {
      method: "PUT", headers,
      body: JSON.stringify(editLeave),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.message);
    setSuccess("Leave updated!");
    setBalance(data.leaveBalance);
    setEditLeave(null);
    fetchLeaves();
  };

  const approveReject = async (id: string, status: string) => {
    await fetch(`${API}/api/leaves/approve/${id}`, {
      method: "PUT", headers,
      body: JSON.stringify({ status }),
    });
    fetchLeaves();
  };

  const logout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div style={s.page}>

      {/* SIDEBAR */}
      <div style={s.sidebar}>
        <div>
          <div style={s.logo}>LMS</div>
          {["leaves", ...(user.role === "admin" ? ["employees"] : [])].map(t => (
            <div key={t} onClick={() => setTab(t)}
              style={{ ...s.menuItem, ...(tab === t ? s.menuActive : {}) }}>
              {t === "leaves" ? "📋 Leaves" : "👥 Employees"}
            </div>
          ))}
        </div>
        <div>
          {user.role === "employee" && (
            <div style={s.balanceBox}>
              <div style={s.balanceNum}>{balance}</div>
              <div style={s.balanceLbl}>days left</div>
            </div>
          )}
          <div style={s.userInfo}>{user.name} · {user.role}</div>
          <button onClick={logout} style={s.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={s.main}>
        <h1 style={s.heading}>
          {tab === "leaves" ? "Leave Requests" : "All Employees"}
        </h1>

        {error && <div style={s.errBox}>{error}</div>}
        {success && <div style={s.sucBox}>{success}</div>}

        {/* APPLY FORM — employees only */}
        {tab === "leaves" && user.role === "employee" && (
          <div style={s.card}>
            <h3 style={s.cardTitle}>Apply for Leave</h3>
            <div style={s.grid}>
              <select style={s.input} value={form.leaveType}
                onChange={e => setForm({ ...form, leaveType: e.target.value })}>
                <option value="">Leave Type</option>
                <option>Sick Leave</option>
                <option>Casual Leave</option>
                <option>Annual Leave</option>
                <option>Emergency Leave</option>
              </select>
              <input style={s.input} type="date" value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })} />
              <input style={s.input} type="date" value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })} />
              <input style={s.input} placeholder="Reason" value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })} />
            </div>
            <button style={s.applyBtn} onClick={applyLeave}>Apply Leave</button>
          </div>
        )}

        {/* EDIT MODAL */}
        {editLeave && (
          <div style={s.modal}>
            <div style={s.modalBox}>
              <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Edit Leave</h3>
              <select style={s.input} value={editLeave.leaveType}
                onChange={e => setEditLeave({ ...editLeave, leaveType: e.target.value })}>
                <option>Sick Leave</option>
                <option>Casual Leave</option>
                <option>Annual Leave</option>
                <option>Emergency Leave</option>
              </select>
              <input style={s.input} type="date" value={editLeave.startDate}
                onChange={e => setEditLeave({ ...editLeave, startDate: e.target.value })} />
              <input style={s.input} type="date" value={editLeave.endDate}
                onChange={e => setEditLeave({ ...editLeave, endDate: e.target.value })} />
              <input style={s.input} placeholder="Reason" value={editLeave.reason}
                onChange={e => setEditLeave({ ...editLeave, reason: e.target.value })} />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button style={s.applyBtn} onClick={submitEdit}>Save</button>
                <button style={{ ...s.applyBtn, background: "#6b7280" }}
                  onClick={() => setEditLeave(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* LEAVES TABLE */}
        {tab === "leaves" && (
          <div style={s.card}>
            <div style={{ overflowX: "auto" }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {user.role === "admin" && <th style={s.th}>Employee</th>}
                    <th style={s.th}>Type</th>
                    <th style={s.th}>Start</th>
                    <th style={s.th}>End</th>
                    <th style={s.th}>Reason</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.length === 0 ? (
                    <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#9ca3af" }}>No leave records.</td></tr>
                  ) : leaves.map((l: any) => (
                    <tr key={l._id} style={s.tr}>
                      {user.role === "admin" && <td style={s.td}>{l.employeeName}</td>}
                      <td style={s.td}>{l.leaveType}</td>
                      <td style={s.td}>{l.startDate}</td>
                      <td style={s.td}>{l.endDate}</td>
                      <td style={s.td}>{l.reason}</td>
                      <td style={s.td}>
                        <span style={{ ...s.badge, ...statusColor(l.status) }}>{l.status}</span>
                      </td>
                      <td style={s.td}>
                        {user.role === "admin" ? (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button style={{ ...s.actionBtn, background: "#16a34a" }}
                              onClick={() => approveReject(l._id, "Approved")}>✓</button>
                            <button style={{ ...s.actionBtn, background: "#dc2626" }}
                              onClick={() => approveReject(l._id, "Rejected")}>✕</button>
                          </div>
                        ) : l.status === "Pending" ? (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button style={{ ...s.actionBtn, background: "#2563eb" }}
                              onClick={() => setEditLeave(l)}>✏</button>
                            <button style={{ ...s.actionBtn, background: "#dc2626" }}
                              onClick={() => deleteLeave(l._id)}>🗑</button>
                          </div>
                        ) : <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function statusColor(status: string): React.CSSProperties {
  if (status === "Approved") return { background: "#dcfce7", color: "#166534" };
  if (status === "Rejected") return { background: "#fee2e2", color: "#991b1b" };
  return { background: "#fef9c3", color: "#854d0e" };
}

const s: Record<string, React.CSSProperties> = {
  page: { display: "flex", height: "100vh", fontFamily: "Segoe UI, sans-serif" },
  sidebar: { width: 200, background: "#1e3a5f", color: "white", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "24px 12px 20px" },
  logo: { fontSize: 22, fontWeight: 800, color: "#60a5fa", marginBottom: 32, paddingLeft: 8 },
  menuItem: { padding: "10px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, marginBottom: 4, color: "#cbd5e1" },
  menuActive: { background: "#2563eb", color: "white" },
  balanceBox: { background: "#172554", borderRadius: 10, padding: "12px", textAlign: "center", marginBottom: 12 },
  balanceNum: { fontSize: 28, fontWeight: 700, color: "#60a5fa" },
  balanceLbl: { fontSize: 11, color: "#93c5fd" },
  userInfo: { fontSize: 12, color: "#94a3b8", textAlign: "center", marginBottom: 10 },
  logoutBtn: { width: "100%", padding: "8px", background: "#dc2626", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13 },
  main: { flex: 1, padding: "28px 32px", overflowY: "auto" },
  heading: { fontSize: 22, fontWeight: 700, color: "#1e3a5f", marginBottom: 16 },
  errBox: { background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13 },
  sucBox: { background: "#dcfce7", color: "#166534", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13 },
  card: { background: "white", borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" },
  cardTitle: { fontSize: 15, fontWeight: 600, color: "#1e3a5f", marginBottom: 14 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 },
  input: { width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13 },
  applyBtn: { padding: "9px 20px", background: "#2563eb", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13 },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 600 },
  th: { background: "#f8fafc", padding: "11px 14px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#475569", borderBottom: "1px solid #e2e8f0" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "11px 14px", fontSize: 13, color: "#374151" },
  badge: { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 },
  actionBtn: { padding: "4px 10px", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 },
  modalBox: { background: "white", padding: 28, borderRadius: 12, width: 380, display: "flex", flexDirection: "column", gap: 10 },
};