import { useState } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { Dashboard } from "./components/Dashboard";
import { useAuth } from "./context/AuthContext";

function App() {
  const auth = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (email, password) => {
    setPending(true);
    setError("");
    try {
      await auth.login(email, password);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setPending(false);
    }
  };

  const handleSignup = async (payload) => {
    setPending(true);
    setError("");
    try {
      await auth.signup(payload);
    } catch (signupError) {
      setError(signupError.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      {error ? (
        <div className="mx-auto mt-4 w-full max-w-md rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {auth.isAuthenticated ? (
        <Dashboard auth={auth} />
      ) : (
        <AuthScreen onLogin={handleLogin} onSignup={handleSignup} pending={pending} />
      )}
    </>
  );
}

export default App;
