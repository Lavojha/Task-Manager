export const DashboardHeader = ({
  activePanel,
  setActivePanel,
  auth,
  showUserMenu,
  setShowUserMenu,
  userMenuRef,
  userInitial,
}) => {
  const navButtonClass = (panel) =>
    `inline-flex w-32 items-center justify-center rounded-lg px-3 py-2 text-center text-xs font-medium text-white transition ${
      activePanel === panel ? "bg-blue-700 ring-2 ring-blue-300" : "bg-blue-600 hover:bg-blue-700"
    }`;

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-900 bg-black px-4 py-3 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Task Manager</h1>
      </div>
      <div className="hidden flex-1 justify-end md:flex">
        <nav className="flex items-center gap-2">
          <button
            type="button"
            className={navButtonClass("create-project")}
            onClick={() => setActivePanel("create-project")}
          >
            Create Project
          </button>
          <button
            type="button"
            className={navButtonClass("add-member")}
            onClick={() => setActivePanel("add-member")}
          >
            Add Member
          </button>
          <button
            type="button"
            className={navButtonClass("create-task")}
            onClick={() => setActivePanel("create-task")}
          >
            Create Task
          </button>
          <button
            type="button"
            className={navButtonClass("project-members")}
            onClick={() => setActivePanel("project-members")}
          >
            Project Members
          </button>
        </nav>
      </div>
      <div className="flex w-full flex-wrap gap-2 md:hidden">
        <button
          type="button"
          className={navButtonClass("create-project")}
          onClick={() => setActivePanel("create-project")}
        >
          Create Project
        </button>
        <button
          type="button"
          className={navButtonClass("add-member")}
          onClick={() => setActivePanel("add-member")}
        >
          Add Member
        </button>
        <button
          type="button"
          className={navButtonClass("create-task")}
          onClick={() => setActivePanel("create-task")}
        >
          Create Task
        </button>
        <button
          type="button"
          className={navButtonClass("project-members")}
          onClick={() => setActivePanel("project-members")}
        >
          Project Members
        </button>
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
  );
};
