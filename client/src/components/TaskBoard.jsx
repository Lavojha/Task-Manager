export const TaskBoard = ({
  loadData,
  busy,
  searchText,
  setSearchText,
  selectedProjectId,
  setSelectedProjectId,
  projects,
  statusFilter,
  setStatusFilter,
  taskStatuses,
  filteredTasks,
  updateTaskStatus,
}) => {
  const statusTone = (status) => {
    if (status === "Done") return "bg-emerald-100 text-emerald-700";
    if (status === "In Progress") return "bg-amber-100 text-amber-700";
    return "bg-slate-200 text-slate-700";
  };

  const priorityTone = (priority) => {
    if (priority === "High") return "bg-rose-100 text-rose-700";
    if (priority === "Medium") return "bg-amber-100 text-amber-700";
    return "bg-sky-100 text-sky-700";
  };

  return (
    <div className="card card-hover lg:col-span-8">
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
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm font-medium text-slate-600">No tasks found for current filters.</p>
          <p className="mt-1 text-xs text-slate-500">Try changing project/status or create a task.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <article
              key={task._id}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{task.title}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusTone(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${priorityTone(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{task.description || "No notes"}</p>
                  <p className="mt-1 text-xs text-slate-500">Project: {task.project?.name}</p>
                  <p className="text-xs text-slate-500">
                    Assigned:{" "}
                    {Array.isArray(task.assignedTo) && task.assignedTo.length > 0
                      ? task.assignedTo.map((user) => user.name).join(", ")
                      : "Unassigned"}{" "}
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
  );
};
