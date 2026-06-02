import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "./api";
import { DEMO_ACCOUNTS, type DemoRole } from "./constants/demoUsers";
import { Card, PageHeader, RoleGate } from "./components";
import { useAuthStore } from "./store";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  const onAuthSuccess = (data: { token: string; user: { id: string; name: string; email: string; role: DemoRole } }) => {
    setAuth(data.token, data.user);
    navigate("/", { replace: true });
  };

  const login = useMutation({
    mutationFn: async () => (await api.post("/auth/login", { email, password })).data,
    onSuccess: onAuthSuccess,
  });

  const demoLogin = useMutation({
    mutationFn: async (role: DemoRole) => (await api.post("/auth/demo-login", { role })).data,
    onSuccess: onAuthSuccess,
  });

  if (token) return <Navigate to="/" replace />;

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <div className="authLayout">
      <aside className="authHero">
        <h1 className="authHeroTitle">Manage projects with clarity.</h1>
        <p className="authHeroText">
          Track tasks, collaborate with your team, and monitor progress from one polished workspace.
        </p>
        <ul className="authHeroList">
          <li>Role-based access for Admin, Manager, and Members</li>
          <li>Real-time KPIs and workload insights</li>
          <li>Smart validation and activity tracking</li>
        </ul>
      </aside>
      <div className="authMain">
        <form
          className="authPanel authPanelWide"
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            login.mutate(undefined, { onError: (err: any) => setError(err?.response?.data?.message || "Login failed") });
          }}
        >
          <div>
            <h2 className="authTitle">Welcome back</h2>
            <p className="authSubtitle">Sign in with your account or use a demo role below.</p>
          </div>

          <div className="demoSection">
            <p className="demoSectionTitle">Quick demo access — one click</p>
            <div className="demoCards">
              {DEMO_ACCOUNTS.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  className={`demoCard demoCard--${demo.accent}`}
                  disabled={demoLogin.isPending}
                  onClick={() => demoLogin.mutate(demo.role, { onError: (err: any) => setError(err?.response?.data?.message || "Demo login failed") })}
                >
                  <div className="demoCardHead">
                    <span className="demoCardTitle">{demo.label}</span>
                    <span className={`demoPill demoPill--${demo.accent}`}>Demo</span>
                  </div>
                  <p className="demoCardDesc">{demo.description}</p>
                  <code className="demoCardCreds">
                    {demo.email} · {demo.password}
                  </code>
                </button>
              ))}
            </div>
          </div>

          <div className="authDivider">or sign in manually</div>

          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
            />
          </div>
          {error ? <p className="errorText">{error}</p> : null}
          <button type="submit" className="btnPrimary" disabled={login.isPending}>
            {login.isPending ? "Signing in…" : "Sign in"}
          </button>

          <p className="authSubtitle">
            Prefill credentials:{" "}
            {DEMO_ACCOUNTS.map((d, i) => (
              <span key={d.role}>
                <button type="button" className="linkAccent linkBtn" onClick={() => fillDemo(d.email, d.password)}>
                  {d.label}
                </button>
                {i < DEMO_ACCOUNTS.length - 1 ? " · " : ""}
              </span>
            ))}
          </p>
          <p className="authSubtitle">
            New here? <Link to="/signup" className="linkAccent">Create account</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("TeamMember");
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  const signup = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/auth/signup", { name, email, password, role });
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      navigate("/", { replace: true });
    },
  });
  if (token) return <Navigate to="/" replace />;

  const [error, setError] = useState("");
  return (
    <div className="authLayout">
      <aside className="authHero">
        <h1 className="authHeroTitle">Join your team.</h1>
        <p className="authHeroText">Create an account and start managing projects in minutes.</p>
      </aside>
      <div className="authMain">
        <form
          className="authPanel"
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            signup.mutate(undefined, { onError: (err: any) => setError(err?.response?.data?.message || "Signup failed") });
          }}
        >
          <h2 className="authTitle">Create account</h2>
          <p className="authSubtitle">Set up your profile and choose a role.</p>
          <div className="field">
            <label htmlFor="signup-name">Full name</label>
            <input id="signup-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div className="field">
            <label htmlFor="signup-email">Email</label>
            <input id="signup-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </div>
          <div className="field">
            <label htmlFor="signup-password">Password</label>
            <input id="signup-password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Min. 6 characters" />
          </div>
          <div className="field">
            <label htmlFor="signup-role">Role</label>
            <select id="signup-role" aria-label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Admin">Admin</option>
              <option value="ProjectManager">Project Manager</option>
              <option value="TeamMember">Team Member</option>
            </select>
          </div>
          {error ? <p className="errorText">{error}</p> : null}
          <button type="submit" className="btnPrimary">Create account</button>
          <p className="authSubtitle">
            Already have an account? <Link to="/login" className="linkAccent">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export const DashboardPage = () => {
  const { data: kpis } = useQuery({ queryKey: ["kpis"], queryFn: async () => (await api.get("/dashboard/kpis")).data });
  const { data: analytics } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => (await api.get("/dashboard/analytics")).data,
  });
  const { data: activities } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => (await api.get("/collaboration/activities?limit=10")).data,
  });
  const { data: workload } = useQuery({
    queryKey: ["workload"],
    queryFn: async () => (await api.get("/dashboard/workload")).data,
  });
  const { data: tasksData } = useQuery({
    queryKey: ["dashboard-task-list"],
    queryFn: async () => (await api.get("/tasks", { params: { limit: 50, sort: "dueDate" } })).data,
  });
  const upcoming = (tasksData?.items || []).filter((t: any) => new Date(t.dueDate) >= new Date()).slice(0, 5);
  const highPriority = (tasksData?.items || []).filter((t: any) => t.priority === "High" && t.status !== "Completed").slice(0, 5);
  const projectProgress = analytics?.projectProgress || [];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of projects, tasks, and team productivity." />
      <div className="grid">
      <Card title="Total Projects" value={kpis?.totalProjects ?? 0} />
      <Card title="Total Tasks" value={kpis?.totalTasks ?? 0} />
      <Card title="Completed" value={kpis?.completedTasks ?? 0} tone="success" />
      <Card title="Pending" value={kpis?.pendingTasks ?? 0} tone="warning" />
      <Card title="Overdue" value={kpis?.overdueTasks ?? 0} tone="danger" />
      </div>
      <div className="grid gridLarge mtLg">
      <section className="panel">
        <h3>Tasks By Priority</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={analytics?.tasksByPriority || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </section>
      <section className="panel">
        <h3>Task Status Distribution</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={analytics?.statusDist || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={90} fill="#10b981" />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </section>
      <section className="panel">
        <h3>Project Progress Trend</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={projectProgress}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="projectName" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="completionPercent" stroke="#4f46e5" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </section>
      <section className="panel">
        <h3>Upcoming Deadlines</h3>
        {upcoming.map((t: any) => (
          <div key={t._id} className="listRow">{t.title} — {new Date(t.dueDate).toLocaleDateString()}</div>
        ))}
      </section>
      <section className="panel">
        <h3>High Priority Tasks</h3>
        {highPriority.map((t: any) => (
          <div key={t._id} className="listRow">{t.title} <span className="badge badge--danger">{t.status}</span></div>
        ))}
      </section>
      <section className="panel">
        <h3>Member Workload Summary</h3>
        {(workload || []).map((m: any) => (
          <div key={m._id} className="listRow">Member {String(m._id).slice(-6)} — {m.total} total · {m.completed} done · {m.pending} pending</div>
        ))}
      </section>
      <section className="panel">
        <h3>Project Summary</h3>
        {projectProgress.slice(0, 6).map((p: any) => (
          <div key={String(p.projectId)} className="listRow">
            {p.projectName} — {p.pending} pending, {p.completionPercent}% completed
          </div>
        ))}
      </section>
      <section className="panel">
        <h3>Recent Activities</h3>
        {(activities || []).map((a: any) => (
          <div key={a._id} className="listRow">{new Date(a.createdAt).toLocaleTimeString()} — {a.message}</div>
        ))}
      </section>
    </div>
    </>
  );
};

export const ProjectsPage = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("-updatedAt");
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [memberSelections, setMemberSelections] = useState<Record<string, string>>({});
  const qc = useQueryClient();
  const { data: users } = useQuery({ queryKey: ["project-users"], queryFn: async () => (await api.get("/users")).data });
  const { data } = useQuery({
    queryKey: ["projects", search, status, sort, page],
    queryFn: async () => (await api.get("/projects", { params: { search, status, sort, page, limit: 8 } })).data,
  });
  const createProject = useMutation({
    mutationFn: async () =>
      (await api.post("/projects", { name, description, deadline: new Date(deadline).toISOString(), status: "Active" })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
  const updateProject = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => (await api.patch(`/projects/${id}`, { status })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
  const deleteProject = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/projects/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
  const addMember = useMutation({
    mutationFn: async ({ id, memberId }: { id: string; memberId: string }) =>
      (await api.post(`/projects/${id}/members`, { memberIds: [memberId] })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / 8));
  return (
    <>
      <PageHeader title="Projects" subtitle="Create and manage project timelines and status." />
      <div className="panel">
      <div className="toolbar">
        <input placeholder="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select aria-label="Filter project status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option><option>Active</option><option>Completed</option><option>On Hold</option>
        </select>
        <select aria-label="Sort projects" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="-createdAt">Latest Created</option>
          <option value="deadline">Nearest Deadline</option>
          <option value="-updatedAt">Recently Updated</option>
        </select>
      </div>
      <RoleGate roles={["Admin", "ProjectManager"]}>
        <div className="toolbar mtSm">
          <input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input aria-label="Project deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <button type="button" className="btnPrimary" onClick={() => createProject.mutate()}>Create project</button>
        </div>
      </RoleGate>
      {(data?.items || []).map((p: any) => (
        <article key={p._id} className="item">
          <h4>{p.name}</h4>
          <p>{p.description}</p>
          <p>Status: {p.status} | Deadline: {new Date(p.deadline).toLocaleDateString()}</p>
          <p>Members: {(p.members || []).map((m: any) => m.name).join(", ") || "None"}</p>
          <RoleGate roles={["Admin", "ProjectManager"]}>
            <div className="row">
              <select aria-label="Update project status" value={p.status} onChange={(e) => updateProject.mutate({ id: p._id, status: e.target.value })}>
                <option>Active</option>
                <option>Completed</option>
                <option>On Hold</option>
              </select>
              <button type="button" className="btnDanger" onClick={() => deleteProject.mutate(p._id)}>Delete</button>
            </div>
            <div className="row">
              <select
                aria-label="Add member to project"
                value={memberSelections[p._id] || ""}
                onChange={(e) => setMemberSelections((prev) => ({ ...prev, [p._id]: e.target.value }))}
              >
                <option value="">Select member</option>
                {(users || []).map((u: any) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btnGhost"
                disabled={!memberSelections[p._id]}
                onClick={() => addMember.mutate({ id: p._id, memberId: memberSelections[p._id] })}
              >
                Add Member
              </button>
            </div>
          </RoleGate>
        </article>
      ))}
      <div className="pagination">
        <button type="button" className="btnGhost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button type="button" className="btnGhost" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
    </>
  );
};

export const TasksPage = () => {
  const [params, setParams] = useState({
    search: "",
    projectId: "",
    assignedTo: "",
    status: "",
    priority: "",
    deadlineStatus: "",
    sort: "-updatedAt",
    page: 1,
  });
  const [activeTaskId, setActiveTaskId] = useState<string>("");
  const [commentBody, setCommentBody] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string>("");
  const [form, setForm] = useState({
    projectId: "",
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "Medium",
  });
  const qc = useQueryClient();
  const { data: users } = useQuery({ queryKey: ["users"], queryFn: async () => (await api.get("/users")).data });
  const { data: projects } = useQuery({ queryKey: ["project-select"], queryFn: async () => (await api.get("/projects")).data });
  const { data } = useQuery({
    queryKey: ["tasks", params],
    queryFn: async () => (await api.get("/tasks", { params: { ...params, limit: 10 } })).data,
  });
  const createTask = useMutation({
    mutationFn: async () => (await api.post("/tasks", { ...form, dueDate: new Date(form.dueDate).toISOString(), status: "Todo" })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const updateTask = useMutation({
    mutationFn: async () =>
      (
        await api.patch(`/tasks/${editingTaskId}`, {
          title: form.title,
          description: form.description,
          assignedTo: form.assignedTo,
          dueDate: new Date(form.dueDate).toISOString(),
          priority: form.priority,
          projectId: form.projectId,
        })
      ).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setEditingTaskId("");
      setForm({ projectId: "", title: "", description: "", assignedTo: "", dueDate: "", priority: "Medium" });
    },
  });
  const changeStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => (await api.patch(`/tasks/${id}`, { status })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const deleteTask = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/tasks/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const { data: comments } = useQuery({
    queryKey: ["task-comments", activeTaskId],
    queryFn: async () => (await api.get(`/collaboration/tasks/${activeTaskId}/comments`)).data,
    enabled: Boolean(activeTaskId),
  });
  const addComment = useMutation({
    mutationFn: async () => (await api.post(`/collaboration/tasks/${activeTaskId}/comments`, { body: commentBody })).data,
    onSuccess: () => {
      setCommentBody("");
      qc.invalidateQueries({ queryKey: ["task-comments", activeTaskId] });
    },
  });
  const uploadAttachment = useMutation({
    mutationFn: async ({ taskId, file }: { taskId: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      return (await api.post(`/collaboration/tasks/${taskId}/attachments`, formData)).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const totalPages = useMemo(() => Math.max(1, Math.ceil((data?.total || 0) / 10)), [data?.total]);

  return (
    <>
      <PageHeader title="Tasks" subtitle="Filter, assign, and update work across projects." />
      <div className="panel">
      <div className="toolbar">
        <input placeholder="Search title/description" value={params.search} onChange={(e) => setParams({ ...params, search: e.target.value })} />
        <select aria-label="Filter by project" value={params.projectId} onChange={(e) => setParams({ ...params, projectId: e.target.value })}>
          <option value="">All Projects</option>
          {(projects?.items || []).map((p: any) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
        <select aria-label="Filter by assignee" value={params.assignedTo} onChange={(e) => setParams({ ...params, assignedTo: e.target.value })}>
          <option value="">All Members</option>
          {(users || []).map((u: any) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>
        <select aria-label="Filter task status" value={params.status} onChange={(e) => setParams({ ...params, status: e.target.value })}>
          <option value="">All Status</option><option>Todo</option><option>In Progress</option><option>Completed</option>
        </select>
        <select aria-label="Filter task priority" value={params.priority} onChange={(e) => setParams({ ...params, priority: e.target.value })}>
          <option value="">All Priority</option><option>High</option><option>Medium</option><option>Low</option>
        </select>
        <select aria-label="Filter deadline status" value={params.deadlineStatus} onChange={(e) => setParams({ ...params, deadlineStatus: e.target.value })}>
          <option value="">Deadline</option><option>Upcoming</option><option>Overdue</option>
        </select>
        <select aria-label="Sort tasks" value={params.sort} onChange={(e) => setParams({ ...params, sort: e.target.value })}>
          <option value="-createdAt">Latest Created</option><option value="dueDate">Nearest Deadline</option><option value="-priority">Highest Priority</option><option value="-updatedAt">Recently Updated</option>
        </select>
      </div>
      <RoleGate roles={["Admin", "ProjectManager"]}>
        <div className="toolbar">
          <select aria-label="Project for task" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
            <option value="">Project</option>{(projects?.items || []).map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <input placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select aria-label="Assign member" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
            <option value="">Assigned member</option>{(users || []).map((u: any) => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
          <select aria-label="Task priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <input aria-label="Task due date" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          {editingTaskId ? (
            <>
              <button type="button" className="btnPrimary" onClick={() => updateTask.mutate()}>Save changes</button>
              <button type="button" className="btnGhost" onClick={() => setEditingTaskId("")}>Cancel</button>
            </>
          ) : (
            <button type="button" className="btnPrimary" onClick={() => createTask.mutate()}>Create task</button>
          )}
        </div>
      </RoleGate>
      {(data?.items || []).map((t: any) => (
        <article key={t._id} className="item">
          <h4>{t.title} ({t.priority})</h4>
          <p>{t.description}</p>
          <p>Assigned: {t.assignedTo?.name || "N/A"} | Due: {new Date(t.dueDate).toLocaleDateString()}</p>
          <div className="row">
            <span className={`badge ${t.status === "Completed" ? "badge--success" : t.status === "In Progress" ? "badge--warning" : "badge--neutral"}`}>
              {t.status}
            </span>
          </div>
          <select aria-label="Task status" value={t.status} onChange={(e) => changeStatus.mutate({ id: t._id, status: e.target.value })}>
            <option>Todo</option><option>In Progress</option><option>Completed</option>
          </select>
          <div className="row">
            <button type="button" className="btnGhost" onClick={() => setActiveTaskId((prev) => (prev === t._id ? "" : t._id))}>
              {activeTaskId === t._id ? "Hide discussion" : "Comments & Attachments"}
            </button>
            <label className="btnGhost clickableLabel">
              Upload file
              <input
                type="file"
                className="fileInputHidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadAttachment.mutate({ taskId: t._id, file });
                }}
              />
            </label>
          </div>
          {Array.isArray(t.attachments) && t.attachments.length > 0 ? (
            <div className="listRow">Attachments: {t.attachments.map((a: any) => a.fileName).join(", ")}</div>
          ) : null}
          {activeTaskId === t._id ? (
            <div className="panel">
              <h3>Task Discussion</h3>
              {(comments || []).map((c: any) => (
                <div key={c._id} className="listRow">
                  <strong>{c.authorId?.name || "User"}:</strong> {c.body}
                </div>
              ))}
              <textarea placeholder="Write a comment..." value={commentBody} onChange={(e) => setCommentBody(e.target.value)} />
              <button type="button" className="btnPrimary" onClick={() => addComment.mutate()} disabled={!commentBody.trim()}>
                Add Comment
              </button>
            </div>
          ) : null}
          <RoleGate roles={["Admin", "ProjectManager"]}>
            <button
              type="button"
              className="btnGhost"
              onClick={() => {
                setEditingTaskId(t._id);
                setForm({
                  projectId: t.projectId,
                  title: t.title,
                  description: t.description,
                  assignedTo: t.assignedTo?._id || t.assignedTo,
                  dueDate: new Date(t.dueDate).toISOString().slice(0, 10),
                  priority: t.priority,
                });
              }}
            >
              Edit
            </button>
            <button type="button" className="btnDanger" onClick={() => deleteTask.mutate(t._id)}>Delete</button>
          </RoleGate>
        </article>
      ))}
      <div className="pagination">
        <button type="button" className="btnGhost" disabled={params.page <= 1} onClick={() => setParams({ ...params, page: params.page - 1 })}>Previous</button>
        <span>Page {params.page} of {totalPages}</span>
        <button type="button" className="btnGhost" disabled={params.page >= totalPages} onClick={() => setParams({ ...params, page: params.page + 1 })}>Next</button>
      </div>
    </div>
    </>
  );
};

export const TeamPage = () => {
  const [memberQuery, setMemberQuery] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const { data: users } = useQuery({
    queryKey: ["user-search", memberQuery],
    queryFn: async () => (await api.get("/users/search", { params: { q: memberQuery } })).data,
  });
  const { data: tasks } = useQuery({
    queryKey: ["team-tasks"],
    queryFn: async () => (await api.get("/tasks", { params: { limit: 200 } })).data,
  });
  const { data: memberTasks } = useQuery({
    queryKey: ["member-task-list", selectedMemberId],
    queryFn: async () => (await api.get("/tasks", { params: { assignedTo: selectedMemberId, limit: 50, sort: "-updatedAt" } })).data,
    enabled: Boolean(selectedMemberId),
  });
  const workload = useMemo(() => {
    const map: Record<string, { total: number; completed: number; pending: number }> = {};
    (tasks?.items || []).forEach((t: any) => {
      const n = t.assignedTo?.name || "Unassigned";
      map[n] = map[n] || { total: 0, completed: 0, pending: 0 };
      map[n].total += 1;
      if (t.status === "Completed") map[n].completed += 1;
      else map[n].pending += 1;
    });
    return Object.entries(map);
  }, [tasks?.items]);
  return (
    <>
      <PageHeader title="Team" subtitle="Search members and review workload distribution." />
      <div className="panel">
      <div className="toolbar">
        <input placeholder="Search team members by name" value={memberQuery} onChange={(e) => setMemberQuery(e.target.value)} />
        <select aria-label="Select member task list" value={selectedMemberId} onChange={(e) => setSelectedMemberId(e.target.value)}>
          <option value="">Select member for task list</option>
          {(users || []).map((u: any) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid">
        {(users || []).map((u: any) => (
          <article key={u._id} className="item">
            <h4>{u.name}</h4>
            <p>{u.email}</p>
            <p>{u.role}</p>
          </article>
        ))}
      </div>
      <h3>Workload Summary</h3>
      {workload.map(([name, stat]) => (
        <div key={name} className="listRow">{name} — {stat.total} tasks · {stat.completed} completed · {stat.pending} pending</div>
      ))}
      {selectedMemberId ? (
        <>
          <h3>Member-wise Task List</h3>
          {(memberTasks?.items || []).map((t: any) => (
            <div key={t._id} className="listRow">
              {t.title} — {t.status} — Due {new Date(t.dueDate).toLocaleDateString()}
            </div>
          ))}
        </>
      ) : null}
    </div>
    </>
  );
};

export const NotificationsPage = () => {
  const qc = useQueryClient();
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/collaboration/notifications")).data,
  });
  const markRead = useMutation({
    mutationFn: async (id: string) => (await api.patch(`/collaboration/notifications/${id}/read`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
  return (
    <>
      <PageHeader title="Notifications" subtitle="Stay updated on assignments and project changes." />
      <div className="panel">
      {(notifications || []).map((n: any) => (
        <article key={n._id} className="item">
          <h4>{n.title}</h4>
          <p>{n.message}</p>
          <p>{new Date(n.createdAt).toLocaleString()}</p>
          {!n.isRead ? (
            <button type="button" className="btnPrimary" onClick={() => markRead.mutate(n._id)}>Mark as read</button>
          ) : (
            <span className="badge badge--success">Read</span>
          )}
        </article>
      ))}
    </div>
    </>
  );
};
