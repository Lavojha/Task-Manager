import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiRequest } from "../lib/api";
import { DashboardHeader } from "./DashboardHeader";
import { SummaryCards } from "./SummaryCards";
import { ManagementPanel } from "./ManagementPanel";
import { TaskBoard } from "./TaskBoard";

const taskStatuses = ["To Do", "In Progress", "Done"];
const taskPriorities = ["Low", "Medium", "High"];

const emptyProjectForm = { name: "", description: "" };
const emptyTaskForm = {
  title: "",
  description: "",
  project: "",
  assignedTo: [],
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
  const [activePanel, setActivePanel] = useState("create-project");
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
      const assignees = Array.isArray(task.assignedTo) ? task.assignedTo : [];
      assignees.forEach((assignee) => {
        const id = assignee._id;
        if (!counts[id]) {
          counts[id] = { name: assignee.name, count: 0 };
        }
        counts[id].count += 1;
      });
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
      <DashboardHeader
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        auth={auth}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        userMenuRef={userMenuRef}
        userInitial={userInitial}
      />

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <SummaryCards summary={summary} />

      <section className="grid gap-5 lg:grid-cols-12">
        <ManagementPanel
          activePanel={activePanel}
          createProject={createProject}
          projectForm={projectForm}
          setProjectForm={setProjectForm}
          busy={busy}
          addMember={addMember}
          memberForm={memberForm}
          setMemberForm={setMemberForm}
          projectsWithRole={projectsWithRole}
          createTask={createTask}
          taskForm={taskForm}
          setTaskForm={setTaskForm}
          selectedProjectMembers={selectedProjectMembers}
          taskPriorities={taskPriorities}
          canCreateTask={canCreateTask}
          tasksPerUser={tasksPerUser}
          projects={projects}
          auth={auth}
          removeMember={removeMember}
        />

        <TaskBoard
          loadData={loadData}
          busy={busy}
          searchText={searchText}
          setSearchText={setSearchText}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          projects={projects}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          taskStatuses={taskStatuses}
          filteredTasks={filteredTasks}
          updateTaskStatus={updateTaskStatus}
        />
      </section>
    </main>
  );
};
