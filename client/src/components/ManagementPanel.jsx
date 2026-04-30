const TaskAssignmentSelector = ({ selectedProjectMembers, taskForm, setTaskForm }) => {
  return (
    <div>
      <label className="label">Assign to</label>
      <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-2">
        {selectedProjectMembers.map((member) => {
          const userId = member.user?._id;
          const checked = taskForm.assignedTo.includes(userId);
          return (
            <label
              key={userId}
              className="flex cursor-pointer items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm"
            >
              <span>
                {member.user?.name} ({member.role})
              </span>
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) =>
                  setTaskForm((prev) => ({
                    ...prev,
                    assignedTo: event.target.checked
                      ? [...prev.assignedTo, userId]
                      : prev.assignedTo.filter((id) => id !== userId),
                  }))
                }
              />
            </label>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">Selected: {taskForm.assignedTo.length} member(s)</p>
    </div>
  );
};

export const ManagementPanel = ({
  activePanel,
  createProject,
  projectForm,
  setProjectForm,
  busy,
  addMember,
  memberForm,
  setMemberForm,
  projectsWithRole,
  createTask,
  taskForm,
  setTaskForm,
  selectedProjectMembers,
  taskPriorities,
  canCreateTask,
  tasksPerUser,
  projects,
  auth,
  removeMember,
}) => {
  return (
    <div className="space-y-5 lg:col-span-4">
      <form
        className={`card card-hover space-y-3 ${activePanel === "create-project" ? "block" : "hidden"}`}
        onSubmit={createProject}
      >
        <h2 className="text-lg font-semibold">Create Project</h2>
        <div>
          <label className="label">Name</label>
          <input
            className="input"
            required
            value={projectForm.name}
            onChange={(event) => setProjectForm((prev) => ({ ...prev, name: event.target.value }))}
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

      <form
        className={`card card-hover space-y-3 ${activePanel === "add-member" ? "block" : "hidden"}`}
        onSubmit={addMember}
      >
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
            onChange={(event) => setMemberForm((prev) => ({ ...prev, email: event.target.value }))}
          />
        </div>
        <button className="btn-secondary w-full" disabled={busy}>
          Add member
        </button>
      </form>

      <form
        className={`card card-hover space-y-3 ${activePanel === "create-task" ? "block" : "hidden"}`}
        onSubmit={createTask}
      >
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
                assignedTo: [],
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

            <TaskAssignmentSelector
              selectedProjectMembers={selectedProjectMembers}
              taskForm={taskForm}
              setTaskForm={setTaskForm}
            />

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
            <button
              className="btn-primary w-full"
              disabled={busy || !canCreateTask || taskForm.assignedTo.length === 0}
            >
              Add task
            </button>
          </>
        ) : null}
      </form>

      <div className="card card-hover">
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

      <div className={`card card-hover ${activePanel === "project-members" ? "block" : "hidden"}`}>
        <h2 className="text-lg font-semibold">Project Members</h2>
        <div className="mt-3 space-y-3">
          {projects.map((project) => {
            const myRole = project.members.find((member) => member.user?._id === auth.user._id)?.role;
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
  );
};
