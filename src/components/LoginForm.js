import { useState, useEffect } from "react";


const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [hayToken, setHayToken] = useState(false);

useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setHayToken(true);
    localStorage.setItem("primera_vez", "true");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

  // 🚫 Verificar si ya hay sesión
  const existingToken = localStorage.getItem("token");
  if (existingToken) {
    setError("Ya hay una sesión activa. Cierra la sesión actual antes de iniciar una nueva.");
    setShowModal(true);
    return;
  }

  // 🚫 Verificar todos los campos llenos
  if (!email || !password) {
    setError("Todos los campos son obligatorios.");
    setShowModal(true);
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
      setShowModal(true);
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
    setShowModal(true);
  }
};


useEffect(() => {
  if (showModal) {
    const timer = setTimeout(() => {
      setShowModal(false);
      setError("");
    }, 2000);

    return () => clearTimeout(timer);
  }
}, [showModal]);

  return (
    <div className="form">
      <div className="contem">
        <div className="left-section">
          <h2 className="title-sesion">Iniciar Sesión</h2>

          <form onSubmit={handleSubmit}>
            {showModal && (
            <div className="modal-overlay">
              <div className="modal-content-error">
                <p>{error}</p>
              </div>
            </div>
          )}
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
          {hayToken && (
            <a href="/Home" className="link-registro" style={{ marginLeft: "10" }}>
              🏠 Ir al Inicio
            </a>
          )}
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
