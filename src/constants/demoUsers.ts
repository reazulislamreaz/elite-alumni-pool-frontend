export type DemoRole = "Admin" | "ProjectManager" | "TeamMember";

export const DEMO_PASSWORD = "Demo@123456";

export const DEMO_ACCOUNTS: {
  role: DemoRole;
  label: string;
  description: string;
  email: string;
  password: string;
  accent: "admin" | "manager" | "member";
}[] = [
  {
    role: "Admin",
    label: "Admin",
    description: "Full system access — projects, tasks, team, settings",
    email: "admin@demo.elitepool.com",
    password: DEMO_PASSWORD,
    accent: "admin",
  },
  {
    role: "ProjectManager",
    label: "Manager",
    description: "Create projects, assign tasks, manage team workload",
    email: "manager@demo.elitepool.com",
    password: DEMO_PASSWORD,
    accent: "manager",
  },
  {
    role: "TeamMember",
    label: "Team Member",
    description: "View assigned work and update task status",
    email: "member@demo.elitepool.com",
    password: DEMO_PASSWORD,
    accent: "member",
  },
];
