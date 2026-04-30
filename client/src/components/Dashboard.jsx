import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiRequest } from "../lib/api";

const taskStatuses = ["To Do", "In Progress", "Done"];
const taskPriorities = ["Low", "Medium", "High"];

const emptyProjectForm = { name: "", description: "" };
const emptyTaskForm = {
  title: "",
  description: "",
  project: "",
  assignedTo: "",
  dueDate: "",
  priority: "Medium",
};
const emptyMemberForm = { projectId: "", email: "" };

export const Dashboard = ({ auth }) => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [memberForm, setMemberForm] = useState(emptyMemberForm);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const projectsRes = await apiRequest("/projects", { token: auth.token });
      const myProjects = projectsRes.data || [];
      setProjects(myProjects);

      const taskRequests = myProjects.map((project) =>
        apiRequest(`/tasks/project/${project._id}`, { token: auth.token })
      );
      const allTaskResponses = await Promise.all(taskRequests);
      const projectTasks = allTaskResponses.flatMap((response) => response.data || []);
      setTasks(projectTasks);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const userInitial = auth.user?.name?.charAt(0)?.toUpperCase() || "U";

  const projectsWithRole = useMemo(
    () =>
      projects.map((project) => ({
        ...project,
        myRole: project.members.find((member) => member.user?._id === auth.user._id)?.role,
      })),
    [projects, auth.user._id]
  );

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === taskForm.project),
    [projects, taskForm.project]
  );

  const canCreateTask = selectedProject
    ? selectedProject.members.find((member) => member.user?._id === auth.user._id)?.role ===
      "Admin"
    : false;

  const selectedProjectMembers = selectedProject?.members || [];

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const projectMatch =
        selectedProjectId === "all" || task.project?._id === selectedProjectId;
      const statusMatch = statusFilter === "all" || task.status === statusFilter;
      const searchMatch =
        searchText.trim() === "" ||
        task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        (task.description || "").toLowerCase().includes(searchText.toLowerCase());
      return projectMatch && statusMatch && searchMatch;
    });
  }, [tasks, selectedProjectId, statusFilter, searchText]);

  const summary = useMemo(() => {
    const now = new Date();
    const tasksByStatus = {
      todo: filteredTasks.filter((task) => task.status === "To Do").length,
      inProgress: filteredTasks.filter((task) => task.status === "In Progress").length,
      done: filteredTasks.filter((task) => task.status === "Done").length,
    };
    const overdue = filteredTasks.filter(
      (task) => task.status !== "Done" && new Date(task.dueDate) < now
    ).length;
    return {
      projects: projects.length,
      total: filteredTasks.length,
      ...tasksByStatus,
      overdue,
    };
  }, [projects.length, filteredTasks]);

  const tasksPerUser = useMemo(() => {
    const counts = {};
    filteredTasks.forEach((task) => {
      if (!task.assignedTo) return;
      const id = task.assignedTo._id;
      if (!counts[id]) {
        counts[id] = { name: task.assignedTo.name, count: 0 };
      }
      counts[id].count += 1;
    });
    return Object.values(counts);
  }, [filteredTasks]);

  const createProject = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await apiRequest("/projects", {
        method: "POST",
        token: auth.token,
        body: projectForm,
      });
      setProjectForm(emptyProjectForm);
      await loadData();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setBusy(false);
    }
  };

  const createTask = async (event) => {
    event.preventDefault();
    if (!canCreateTask) return;
    setBusy(true);
    try {
      await apiRequest("/tasks", {
        method: "POST",
        token: auth.token,
        body: taskForm,
      });
      setTaskForm(emptyTaskForm);
      await loadData();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setBusy(false);
    }
  };

  const addMember = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await apiRequest(`/projects/${memberForm.projectId}/members`, {
        method: "POST",
        token: auth.token,
        body: { email: memberForm.email },
      });
      setMemberForm(emptyMemberForm);
      await loadData();
    } catch (memberError) {
      setError(memberError.message);
    } finally {
      setBusy(false);
    }
  };

  const removeMember = async (projectId, userId) => {
    setBusy(true);
    try {
      await apiRequest(`/projects/${projectId}/members/${userId}`, {
        method: "DELETE",
        token: auth.token,
      });
      await loadData();
    } catch (removeError) {
      setError(removeError.message);
    } finally {
      setBusy(false);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await apiRequest(`/tasks/${taskId}`, {
        method: "PUT",
        token: auth.token,
        body: { status },
      });
      await loadData();
    } catch (statusError) {
      setError(statusError.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-600">Loading workspace...</div>;
  }

  return (
    <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Task Manager</h1>
        </div>
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
            onClick={() => setShowUserMenu((prev) => !prev)}
            title={auth.user.name}
          >
            {userInitial}
          </button>

          {showUserMenu ? (
            <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
              <p className="px-2 py-1 text-xs text-slate-500">{auth.user.name}</p>
              <button className="btn-secondary mt-1 w-full" onClick={auth.logout}>
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Projects", summary?.projects ?? 0],
          ["Tasks", summary.total],
          ["In Progress", summary.inProgress],
          ["Overdue", summary.overdue],
        ].map(([label, value]) => (
          <article key={label} className="card">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-bold">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-4">
          <form className="card space-y-3" onSubmit={createProject}>
            <h2 className="text-lg font-semibold">Create Project</h2>
            <div>
              <label className="label">Name</label>
              <input
                className="input"
                required
                value={projectForm.name}
                onChange={(event) =>
                  setProjectForm((prev) => ({ ...prev, name: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                className="input min-h-24"
                value={projectForm.description}
                onChange={(event) =>
                  setProjectForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </div>
            <button className="btn-primary w-full" disabled={busy}>
              Add project
            </button>
          </form>

          <form className="card space-y-3" onSubmit={addMember}>
            <h2 className="text-lg font-semibold">Add Member</h2>
            <div>
              <label className="label">Project</label>
              <select
                className="input"
                required
                value={memberForm.projectId}
                onChange={(event) =>
                  setMemberForm((prev) => ({ ...prev, projectId: event.target.value }))
                }
              >
                <option value="">Select project</option>
                {projectsWithRole
                  .filter((project) => project.myRole === "Admin")
                  .map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="label">Member Email</label>
              <input
                className="input"
                type="email"
                required
                value={memberForm.email}
                onChange={(event) =>
                  setMemberForm((prev) => ({ ...prev, email: event.target.value }))
                }
              />
            </div>
            <button className="btn-secondary w-full" disabled={busy}>
              Add member
            </button>
          </form>

          <form className="card space-y-3" onSubmit={createTask}>
            <h2 className="text-lg font-semibold">Create Task</h2>
            <div>
              <label className="label">Project</label>
              <select
                className="input"
                required
                value={taskForm.project}
                onChange={(event) =>
                  setTaskForm((prev) => ({
                    ...prev,
                    project: event.target.value,
                    assignedTo: "",
                  }))
                }
              >
                <option value="">Select project</option>
                {projectsWithRole
                  .filter((project) => project.myRole === "Admin")
                  .map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
              </select>
            </div>
            {taskForm.project ? (
              <>
                <div>
                  <label className="label">Title</label>
                  <input
                    className="input"
                    required
                    value={taskForm.title}
                    onChange={(event) =>
                      setTaskForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    className="input min-h-20"
                    value={taskForm.description}
                    onChange={(event) =>
                      setTaskForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="label">Assign to</label>
                  <select
                    className="input"
                    required
                    value={taskForm.assignedTo}
                    onChange={(event) =>
                      setTaskForm((prev) => ({ ...prev, assignedTo: event.target.value }))
                    }
                  >
                    <option value="">Select member</option>
                    {selectedProjectMembers.map((member) => (
                      <option key={member.user?._id} value={member.user?._id}>
                        {member.user?.name} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Due date</label>
                    <input
                      className="input"
                      type="date"
                      required
                      value={taskForm.dueDate}
                      onChange={(event) =>
                        setTaskForm((prev) => ({ ...prev, dueDate: event.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="label">Priority</label>
                    <select
                      className="input"
                      value={taskForm.priority}
                      onChange={(event) =>
                        setTaskForm((prev) => ({ ...prev, priority: event.target.value }))
                      }
                    >
                      {taskPriorities.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button className="btn-primary w-full" disabled={busy || !canCreateTask}>
                  Add task
                </button>
              </>
            ) : null}
          </form>

          <div className="card">
            <h2 className="text-lg font-semibold">Tasks Per User</h2>
            <div className="mt-3 space-y-2">
              {tasksPerUser.length === 0 ? (
                <p className="text-sm text-slate-500">No assigned tasks yet.</p>
              ) : (
                tasksPerUser.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span>{item.name}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold">Project Members</h2>
            <div className="mt-3 space-y-3">
              {projects.map((project) => {
                const myRole = project.members.find(
                  (member) => member.user?._id === auth.user._id
                )?.role;
                return (
                  <div key={project._id} className="rounded-lg border border-slate-200 p-3">
                    <p className="font-medium">{project.name}</p>
                    <div className="mt-2 space-y-2">
                      {project.members.map((member) => (
                        <div
                          key={member.user?._id}
                          className="flex items-center justify-between rounded bg-slate-50 px-2 py-1 text-sm"
                        >
                          <span>
                            {member.user?.name} ({member.role})
                          </span>
                          {myRole === "Admin" &&
                          member.role !== "Admin" &&
                          member.user?._id !== auth.user._id ? (
                            <button
                              type="button"
                              className="btn-secondary text-xs"
                              onClick={() => removeMember(project._id, member.user._id)}
                              disabled={busy}
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card lg:col-span-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Task Board</h2>
            <button className="btn-secondary" onClick={loadData} disabled={busy}>
              Refresh
            </button>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <input
              className="input"
              placeholder="Search tasks..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
            <select
              className="input"
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
            >
              <option value="all">All projects</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
            <select
              className="input"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All status</option>
              {taskStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {filteredTasks.length === 0 ? (
            <p className="text-sm text-slate-500">No tasks yet.</p>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <article
                  key={task._id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{task.title}</h3>
                      <p className="text-sm text-slate-600">{task.description || "No notes"}</p>
                      <p className="mt-1 text-xs text-slate-500">Project: {task.project?.name}</p>
                      <p className="text-xs text-slate-500">
                        Assigned: {task.assignedTo?.name || "Unassigned"} | Priority:{" "}
                        {task.priority}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                      <select
                        className="input w-36"
                        value={task.status}
                        onChange={(event) => updateTaskStatus(task._id, event.target.value)}
                        disabled={busy}
                      >
                        {taskStatuses.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};
