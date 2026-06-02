import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { Card, RoleGate } from "./components";
import { useAuthStore } from "./store";

export const LoginPage = () => {
  const [email, setEmail] = useState("demo@elitepool.com");
  const [password, setPassword] = useState("Demo@123456");
  const setAuth = useAuthStore((s) => s.setAuth);
  const login = useMutation({
    mutationFn: async (demo?: boolean) => {
      const { data } = await api.post(demo ? "/auth/demo-login" : "/auth/login", demo ? {} : { email, password });
      return data;
    },
    onSuccess: (data) => setAuth(data.token, data.user),
  });
  return (
    <div className="center">
      <form className="panel" onSubmit={(e) => (e.preventDefault(), login.mutate(false))}>
        <h2>Smart Project System</h2>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
        <button type="submit">Login</button>
        <button type="button" onClick={() => login.mutate(true)}>
          Demo Login
        </button>
      </form>
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
  return (
    <div className="grid">
      <Card title="Total Projects" value={kpis?.totalProjects ?? 0} />
      <Card title="Total Tasks" value={kpis?.totalTasks ?? 0} />
      <Card title="Completed Tasks" value={kpis?.completedTasks ?? 0} />
      <Card title="Pending Tasks" value={kpis?.pendingTasks ?? 0} />
      <Card title="Overdue Tasks" value={kpis?.overdueTasks ?? 0} />
      <section className="panel">
        <h3>Tasks By Priority</h3>
        {(analytics?.tasksByPriority || []).map((i: any) => (
          <p key={i._id}>{i._id}: {i.count}</p>
        ))}
      </section>
      <section className="panel">
        <h3>Recent Activities</h3>
        {(activities || []).map((a: any) => (
          <p key={a._id}>{new Date(a.createdAt).toLocaleTimeString()} — {a.message}</p>
        ))}
      </section>
    </div>
  );
};

export const ProjectsPage = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["projects", search, status],
    queryFn: async () => (await api.get("/projects", { params: { search, status, sort: "-updatedAt" } })).data,
  });
  const createProject = useMutation({
    mutationFn: async () => (await api.post("/projects", { name, description, deadline, status: "Active" })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
  return (
    <div className="panel">
      <h2>Projects</h2>
      <div className="row">
        <input placeholder="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option><option>Active</option><option>Completed</option><option>On Hold</option>
        </select>
      </div>
      <RoleGate roles={["Admin", "ProjectManager"]}>
        <div className="row">
          <input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <button onClick={() => createProject.mutate()}>Create</button>
        </div>
      </RoleGate>
      {(data?.items || []).map((p: any) => (
        <article key={p._id} className="item">
          <h4>{p.name}</h4>
          <p>{p.description}</p>
          <p>Status: {p.status}</p>
        </article>
      ))}
    </div>
  );
};

export const TasksPage = () => {
  const [params, setParams] = useState({ search: "", status: "", priority: "", deadlineStatus: "", sort: "-updatedAt", page: 1 });
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
  const changeStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => (await api.patch(`/tasks/${id}`, { status })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
  const totalPages = useMemo(() => Math.max(1, Math.ceil((data?.total || 0) / 10)), [data?.total]);

  return (
    <div className="panel">
      <h2>Tasks</h2>
      <div className="row wrap">
        <input placeholder="Search title/description" value={params.search} onChange={(e) => setParams({ ...params, search: e.target.value })} />
        <select value={params.status} onChange={(e) => setParams({ ...params, status: e.target.value })}>
          <option value="">All Status</option><option>Todo</option><option>In Progress</option><option>Completed</option>
        </select>
        <select value={params.priority} onChange={(e) => setParams({ ...params, priority: e.target.value })}>
          <option value="">All Priority</option><option>High</option><option>Medium</option><option>Low</option>
        </select>
        <select value={params.deadlineStatus} onChange={(e) => setParams({ ...params, deadlineStatus: e.target.value })}>
          <option value="">Deadline</option><option>Upcoming</option><option>Overdue</option>
        </select>
        <select value={params.sort} onChange={(e) => setParams({ ...params, sort: e.target.value })}>
          <option value="-createdAt">Latest Created</option><option value="dueDate">Nearest Deadline</option><option value="-priority">Highest Priority</option><option value="-updatedAt">Recently Updated</option>
        </select>
      </div>
      <RoleGate roles={["Admin", "ProjectManager"]}>
        <div className="row wrap">
          <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
            <option value="">Project</option>{(projects?.items || []).map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <input placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
            <option value="">Assigned member</option>{(users || []).map((u: any) => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <button onClick={() => createTask.mutate()}>Create Task</button>
        </div>
      </RoleGate>
      {(data?.items || []).map((t: any) => (
        <article key={t._id} className="item">
          <h4>{t.title} ({t.priority})</h4>
          <p>{t.description}</p>
          <p>Assigned: {t.assignedTo?.name || "N/A"} | Due: {new Date(t.dueDate).toLocaleDateString()}</p>
          <select value={t.status} onChange={(e) => changeStatus.mutate({ id: t._id, status: e.target.value })}>
            <option>Todo</option><option>In Progress</option><option>Completed</option>
          </select>
        </article>
      ))}
      <div className="row">
        <button disabled={params.page <= 1} onClick={() => setParams({ ...params, page: params.page - 1 })}>Prev</button>
        <span>Page {params.page} of {totalPages}</span>
        <button disabled={params.page >= totalPages} onClick={() => setParams({ ...params, page: params.page + 1 })}>Next</button>
      </div>
    </div>
  );
};
