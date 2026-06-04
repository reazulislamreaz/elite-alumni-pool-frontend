import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "./api";
import { DEMO_ACCOUNTS, type DemoRole } from "./constants/demoUsers";
import {
  Card,
  CHART,
  ChartPanel,
  EmptyState,
  MemberCard,
  NotificationItem,
  PageCard,
  PageHeader,
  PanelTitle,
  RoleGate,
  TaskProgress,
} from "./components";
import { useAuthStore } from "./store";

const getApiError = (err: unknown) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Request failed";

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
          Track tasks, collaborate with your team, and monitor progress from one workspace.
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
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();

  const signup = useMutation({
    mutationFn: async () => {
      // New accounts are always Team Members — Admin/Manager are assigned
      // internally, so the role isn't user-selectable at signup.
      const { data } = await api.post("/auth/signup", { name, email, password });
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
          <p className="authSubtitle">Set up your profile to get started.</p>
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
          <p className="authSubtitle">
            New accounts join as <strong>Team Members</strong>. Use a demo login to explore Admin or Manager access.
          </p>
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
  const projectSummary = analytics?.projectSummary || [];
  const productivity = analytics?.productivity || [];

  const tasksByPriority = analytics?.tasksByPriority || [];
  const statusDist = analytics?.statusDist || [];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of projects, tasks, and team productivity." />
      <div className="kpiRow">
        <Card title="Total Projects" value={kpis?.totalProjects ?? 0} />
        <Card title="Total Tasks" value={kpis?.totalTasks ?? 0} />
        <Card title="Completed" value={kpis?.completedTasks ?? 0} tone="success" />
        <Card title="Pending" value={kpis?.pendingTasks ?? 0} tone="warning" />
        <Card title="Overdue" value={kpis?.overdueTasks ?? 0} tone="danger" />
      </div>
      <div className="dashboardGrid">
        <ChartPanel title="Tasks By Priority" isEmpty={!tasksByPriority.length}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={tasksByPriority}>
              <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="_id" tick={{ fill: CHART.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: CHART.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }} />
              <Bar dataKey="count" fill={CHART.primary} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Task Status Distribution" isEmpty={!statusDist.length}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={statusDist} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={88} fill={CHART.accent} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="Project Progress Trend" isEmpty={!projectProgress.length}>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={projectProgress}>
              <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="projectName" tick={{ fill: CHART.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: CHART.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }} />
              <Line type="monotone" dataKey="completionPercent" stroke={CHART.primary} strokeWidth={2.5} dot={{ fill: CHART.primary, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
        <section className="panel listPanel">
          <PanelTitle>Upcoming Deadlines</PanelTitle>
          {upcoming.length ? (
            upcoming.map((t: any) => (
              <div key={t._id} className="listRow">
                <span className="listRowTitle">{t.title}</span>
                <span className="listRowMeta">{new Date(t.dueDate).toLocaleDateString()}</span>
              </div>
            ))
          ) : (
            <p className="emptyState">No upcoming deadlines.</p>
          )}
        </section>
        <section className="panel listPanel">
          <PanelTitle>High Priority Tasks</PanelTitle>
          {highPriority.length ? (
            highPriority.map((t: any) => (
              <div key={t._id} className="listRow listRow--between">
                <span className="listRowTitle">{t.title}</span>
                <span className="badge badge--danger">{t.status}</span>
              </div>
            ))
          ) : (
            <p className="emptyState">No high priority tasks.</p>
          )}
        </section>
        <ChartPanel title="Team Productivity Overview" isEmpty={!productivity.length}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={productivity}>
              <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: CHART.axis, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: CHART.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }} />
              <Bar dataKey="completed" stackId="a" fill={CHART.primary} name="Completed" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pending" stackId="a" fill={CHART.secondary} name="Pending" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
        <section className="panel listPanel">
          <PanelTitle>Member Workload Summary</PanelTitle>
          {(workload || []).length ? (
            (workload || []).map((m: any) => (
              <div key={m._id} className="workloadRow">
                <span className="workloadName">{m.name}</span>
                <div className="workloadStats">
                  <span>{m.total} total</span>
                  <span className="workloadStat--done">{m.completed} done</span>
                  <span className="workloadStat--pending">{m.pending} pending</span>
                </div>
              </div>
            ))
          ) : (
            <p className="emptyState">No workload data yet.</p>
          )}
        </section>
        <section className="panel listPanel">
          <PanelTitle>Project Summary</PanelTitle>
          {projectSummary.slice(0, 6).map((p: any) => (
            <div key={String(p.projectId)} className="listRow">
              <div className="listRowTitle">{p.summaryLine}</div>
              <small>{p.deadlineLabel}</small>
            </div>
          ))}
          {!projectSummary.length ? <p className="emptyState">No project data yet.</p> : null}
        </section>
        <section className="panel listPanel">
          <PanelTitle>Recent Activities</PanelTitle>
          {(activities || []).length ? (
            (activities || []).map((a: any) => (
              <div key={a._id} className="listRow">
                <span className="listRowTitle">{a.message}</span>
                <small>
                  {new Date(a.createdAt).toLocaleTimeString()}
                  {a.actorId?.name ? ` · ${a.actorId.name}` : ""}
                </small>
              </div>
            ))
          ) : (
            <p className="emptyState">No recent activity.</p>
          )}
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
  const [editingProjectId, setEditingProjectId] = useState("");
  const [editForm, setEditForm] = useState({ name: "", description: "", deadline: "", status: "Active" });
  const [projectError, setProjectError] = useState("");
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
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      (await api.patch(`/projects/${id}`, payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setEditingProjectId("");
      setProjectError("");
    },
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
      <PageCard>
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
          <button
            type="button"
            className="btnPrimary"
            onClick={() =>
              createProject.mutate(undefined, { onError: (e) => setProjectError(getApiError(e)) })
            }
          >
            Create project
          </button>
          {projectError ? <p className="errorText">{projectError}</p> : null}
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
              <button
                type="button"
                className="btnGhost"
                onClick={() => {
                  setEditingProjectId(p._id);
                  setEditForm({
                    name: p.name,
                    description: p.description,
                    deadline: new Date(p.deadline).toISOString().slice(0, 10),
                    status: p.status,
                  });
                }}
              >
                Edit details
              </button>
              <button type="button" className="btnDanger" onClick={() => deleteProject.mutate(p._id)}>Delete</button>
            </div>
            {editingProjectId === p._id ? (
              <div className="toolbar mtSm">
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" />
                <input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description" />
                <input type="date" aria-label="Edit deadline" value={editForm.deadline} onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })} />
                <select aria-label="Edit status" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                  <option>Active</option>
                  <option>Completed</option>
                  <option>On Hold</option>
                </select>
                <button
                  type="button"
                  className="btnPrimary"
                  onClick={() =>
                    updateProject.mutate(
                      {
                        id: p._id,
                        payload: {
                          name: editForm.name,
                          description: editForm.description,
                          deadline: new Date(editForm.deadline).toISOString(),
                          status: editForm.status,
                        },
                      },
                      { onError: (e) => setProjectError(getApiError(e)) }
                    )
                  }
                >
                  Save project
                </button>
              </div>
            ) : null}
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
    </PageCard>
    </>
  );
};

export const TasksPage = () => {
  const currentUser = useAuthStore((s) => s.user);
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
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("In Progress");
  const [taskError, setTaskError] = useState("");
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
  const { data: projects } = useQuery({
    queryKey: ["project-select"],
    queryFn: async () => (await api.get("/projects", { params: { limit: 100 } })).data,
  });
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
  const bulkUpdate = useMutation({
    mutationFn: async () => (await api.patch("/tasks/bulk", { taskIds: selectedTaskIds, status: bulkStatus })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setSelectedTaskIds([]);
    },
  });
  const totalPages = useMemo(() => Math.max(1, Math.ceil((data?.total || 0) / 10)), [data?.total]);

  // Tasks can only be assigned to members of the chosen project, so the
  // assignee dropdown is scoped to that project's members.
  const selectedProject = (projects?.items || []).find((p: any) => p._id === form.projectId);
  const assignableMembers = selectedProject?.members || [];

  const canUpdateTaskStatus = (task: any) => {
    if (currentUser?.role === "Admin" || currentUser?.role === "ProjectManager") return true;
    const assigneeId = task.assignedTo?._id || task.assignedTo;
    return String(assigneeId) === currentUser?.id;
  };

  const toggleTaskSelect = (id: string) => {
    setSelectedTaskIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle={
          currentUser?.role === "TeamMember"
            ? "View and update status on tasks assigned to you."
            : "Filter, assign, and update work across projects."
        }
      />
      <PageCard>
      {taskError ? <p className="errorText">{taskError}</p> : null}
      <RoleGate roles={["Admin", "ProjectManager"]}>
        {selectedTaskIds.length > 0 ? (
          <div className="bulkBar">
            <span>{selectedTaskIds.length} selected</span>
            <select aria-label="Bulk status" value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
              <option>Todo</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
            <button type="button" className="btnPrimary" onClick={() => bulkUpdate.mutate()}>
              Apply bulk status
            </button>
          </div>
        ) : null}
      </RoleGate>
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
          <select
            aria-label="Project for task"
            value={form.projectId}
            onChange={(e) => setForm({ ...form, projectId: e.target.value, assignedTo: "" })}
          >
            <option value="">Project</option>{(projects?.items || []).map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <input placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select aria-label="Assign member" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} disabled={!form.projectId}>
            <option value="">{form.projectId ? "Assigned member" : "Select a project first"}</option>
            {assignableMembers.map((u: any) => <option key={u._id} value={u._id}>{u.name}</option>)}
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
            <button
              type="button"
              className="btnPrimary"
              onClick={() => createTask.mutate(undefined, { onError: (e) => setTaskError(getApiError(e)) })}
            >
              Create task
            </button>
          )}
        </div>
      </RoleGate>
      {(data?.items || []).map((t: any) => (
        <article key={t._id} className="item">
          <div className="row">
            <RoleGate roles={["Admin", "ProjectManager"]}>
              <input
                type="checkbox"
                aria-label={`Select task ${t.title}`}
                checked={selectedTaskIds.includes(t._id)}
                onChange={() => toggleTaskSelect(t._id)}
              />
            </RoleGate>
            <h4>{t.title} ({t.priority})</h4>
          </div>
          <p>{t.description}</p>
          <p>
            Project: {t.projectId?.name || "N/A"} | Assigned: {t.assignedTo?.name || "N/A"} | Due:{" "}
            {new Date(t.dueDate).toLocaleDateString()}
          </p>
          <TaskProgress status={t.status} />
          <div className="row">
            <span className={`badge ${t.status === "Completed" ? "badge--success" : t.status === "In Progress" ? "badge--warning" : "badge--neutral"}`}>
              {t.status}
            </span>
          </div>
          {canUpdateTaskStatus(t) ? (
            <select
              aria-label="Task status"
              value={t.status}
              onChange={(e) =>
                changeStatus.mutate(
                  { id: t._id, status: e.target.value },
                  { onError: (err) => setTaskError(getApiError(err)) }
                )
              }
            >
              <option>Todo</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          ) : (
            <p className="emptyState">Status updates are limited to assigned members.</p>
          )}
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
                  projectId: t.projectId?._id || t.projectId,
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
    </PageCard>
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
      <PageCard>
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
        {(users || []).length ? (
          <div className="memberGrid">
            {(users || []).map((u: any) => (
              <MemberCard key={u._id} name={u.name} email={u.email} role={u.role} />
            ))}
          </div>
        ) : (
          <EmptyState title="No members found" description="Try a different search term." />
        )}
        <div className="sectionDivider">
          <PanelTitle>Workload Summary</PanelTitle>
          {workload.length ? (
            workload.map(([name, stat]) => (
              <div key={name} className="workloadRow">
                <span className="workloadName">{name}</span>
                <div className="workloadStats">
                  <span>{stat.total} tasks</span>
                  <span className="workloadStat--done">{stat.completed} completed</span>
                  <span className="workloadStat--pending">{stat.pending} pending</span>
                </div>
              </div>
            ))
          ) : (
            <p className="emptyState">No task assignments to summarize yet.</p>
          )}
        </div>
        {selectedMemberId ? (
          <div className="sectionDivider">
            <PanelTitle>Member-wise Task List</PanelTitle>
            {(memberTasks?.items || []).length ? (
              (memberTasks?.items || []).map((t: any) => (
                <div key={t._id} className="listRow listRow--between">
                  <span className="listRowTitle">{t.title}</span>
                  <span className="listRowMeta">
                    {t.status} · Due {new Date(t.dueDate).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="emptyState">This member has no assigned tasks.</p>
            )}
          </div>
        ) : null}
      </PageCard>
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
  const items = notifications || [];

  return (
    <>
      <PageHeader title="Notifications" subtitle="Stay updated on assignments and project changes." />
      <PageCard className="pageCard--flush">
        {items.length ? (
          <div className="notificationList">
            {items.map((n: any) => (
              <NotificationItem
                key={n._id}
                title={n.title}
                message={n.message}
                createdAt={n.createdAt}
                isRead={n.isRead}
                onMarkRead={!n.isRead ? () => markRead.mutate(n._id) : undefined}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="You're all caught up"
            description="New assignments and project updates will appear here."
          />
        )}
      </PageCard>
    </>
  );
};
