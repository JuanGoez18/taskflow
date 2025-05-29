import { useState } from "react";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, contraseña: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Error al iniciar sesión.");
        return;
      }

      // Guardar token en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirigir según el tipo de usuario
      if (data.user.tipo === "admin") {
        window.location.href = "/Dashboard";
      } else {
        window.location.href = "/Home";
      }

    } catch (error) {
      console.error("🚨 Error al conectar con el servidor:", error);
      setError("Error al conectar con el servidor.");
    }
  };

  return (
    <div className="form">
      <div className="contem">
        <div className="left-section">
          <h2 className="title-sesion">Iniciar Sesión</h2>

          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="cjcorreo">
              <label className="lbcorreo">Correo Electrónico</label>
              <input
                type="email"
                className="inpcorreo"
                placeholder="ejemplo@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="cjcontraseña">
              <label className="lbcontraseña">Contraseña</label>
              <input
                type="password"
                className="inpcontraseña"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="button" onClick={() => window.history.back()}>Cancelar</button>
            <button type="submit" className="btn-iniciar-sesion">
              Iniciar Sesión
            </button>
          </form>

          <p className="txt-notenercuenta">¿No tienes cuenta? <a href="/Registro" className="link-registro">Regístrate aquí</a></p>
          <a href="/Recuperacion" className="link-registro">🔐Recuperar Contraseña</a>
        </div>

        <div className="right-section">
          <p className="taskflow-phrase">
            "Organiza tus tareas, prioriza tu tiempo, alcanza tus metas — con TaskFlow."
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
