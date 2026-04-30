import { useState } from "react";

const initialSignup = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "Member",
};
const initialLogin = { email: "", password: "" };

export const AuthScreen = ({ onLogin, onSignup, pending }) => {
  const [mode, setMode] = useState("login");
  const [signupData, setSignupData] = useState(initialSignup);
  const [loginData, setLoginData] = useState(initialLogin);
  const [formError, setFormError] = useState("");

  const submitLogin = (event) => {
    event.preventDefault();
    onLogin(loginData.email, loginData.password);
  };

  const submitSignup = (event) => {
    event.preventDefault();
    setFormError("");

    if (signupData.password !== signupData.confirmPassword) {
      setFormError("Password and confirm password must match.");
      return;
    }

    const payload = {
      name: signupData.name.trim(),
      email: signupData.email.trim(),
      password: signupData.password,
      role: signupData.role,
    };
    onSignup(payload);
  };

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-12">
      <div className="pointer-events-none absolute left-8 top-10 h-40 w-40 rounded-full bg-brand-50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-12 right-8 h-52 w-52 rounded-full bg-emerald-100 blur-3xl" />

      <section className="grid w-full gap-6 md:grid-cols-2">
        <div className="card relative space-y-5 overflow-hidden text-center md:flex md:min-h-full md:flex-col md:items-center md:justify-center">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-brand-50" />
          <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-emerald-50" />

          <span className="relative inline-flex rounded-full border border-brand-200 bg-brand-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
            Collaborative Workspace
          </span>
          <h1 className="relative text-4xl font-extrabold leading-tight md:text-5xl">
            <span className="bg-gradient-to-r from-brand-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Team Task Management
            </span>
            <br />
            Web Application
          </h1>
          <p className="relative mx-auto max-w-lg text-base leading-7 text-slate-600">
            Manage projects with your team, assign tasks with clear priorities, track task status
            from To Do to Done, and stay updated with overdue and progress insights in one place.
          </p>
          <div className="relative flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              Projects
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              Team Roles
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              Smart Dashboard
            </span>
          </div>
        </div>

        <div className="card border-slate-200/90 bg-white/90 backdrop-blur">
          <div className="mb-5 flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              className={`btn w-1/2 ${mode === "login" ? "bg-white shadow-sm" : ""}`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={`btn w-1/2 ${mode === "signup" ? "bg-white shadow-sm" : ""}`}
              onClick={() => setMode("signup")}
            >
              Signup
            </button>
          </div>

          {mode === "login" ? (
            <form className="space-y-4" onSubmit={submitLogin}>
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(event) =>
                    setLoginData((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  className="input"
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(event) =>
                    setLoginData((prev) => ({ ...prev, password: event.target.value }))
                  }
                />
              </div>
              <button className="btn-primary w-full" disabled={pending}>
                {pending ? "Please wait..." : "Login"}
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={submitSignup}>
              {formError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </div>
              ) : null}
              <div>
                <label className="label">Name</label>
                <input
                  className="input"
                  required
                  value={signupData.name}
                  onChange={(event) =>
                    setSignupData((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  required
                  value={signupData.email}
                  onChange={(event) =>
                    setSignupData((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  className="input"
                  type="password"
                  required
                  minLength={6}
                  value={signupData.password}
                  onChange={(event) =>
                    setSignupData((prev) => ({ ...prev, password: event.target.value }))
                  }
                />
              </div>
              <div>
                <label className="label">Role</label>
                <select
                  className="input"
                  value={signupData.role}
                  onChange={(event) =>
                    setSignupData((prev) => ({ ...prev, role: event.target.value }))
                  }
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input
                  className="input"
                  type="password"
                  required
                  minLength={6}
                  value={signupData.confirmPassword}
                  onChange={(event) =>
                    setSignupData((prev) => ({
                      ...prev,
                      confirmPassword: event.target.value,
                    }))
                  }
                />
              </div>
              <button className="btn-primary w-full" disabled={pending}>
                {pending ? "Please wait..." : "Create account"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};
