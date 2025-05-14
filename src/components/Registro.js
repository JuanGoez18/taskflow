import { useState } from "react";

const Registro = ({ onClose }) => {
  const [formulario, setFormulario] = useState({
    nombre: "",
    apellido: "",
    email: "",
    edad: "",
    contraseña: "",
  });

  const [modalExito, setModalExito] = useState(false);

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formulario),
      });

      if (res.ok) {
        setModalExito(true);
        setTimeout(() => {
          setModalExito(false);
          window.location.href = "/Login";
        }, 3000);
      } else {
        alert("Error al registrar usuario");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="form">
      <div className="contem">
        {/* LEFT: Formulario */}
        <div className="left-section">
          <h2 className="title-registro">Registro</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" name="nombre" placeholder="Nombre" onChange={handleChange} required />
            <input type="text" name="apellido" placeholder="Apellido" onChange={handleChange} required />
            <input type="email" name="email" placeholder="Correo" onChange={handleChange} required />
            <input type="number" name="edad" placeholder="Edad" onChange={handleChange} required />
            <input type="password" name="contraseña" placeholder="Contraseña" onChange={handleChange} required />
            <div>
              <button type="button" onClick={() => window.location.href = "/"}>Cancelar</button>
              <button type="submit">Registrarse</button>
            </div>
          </form>
        </div>

        {/* RIGHT: Frase o branding */}
        <div className="right-section">
          <p className="taskflow-phrase">
            Organiza tu día, prioriza tus tareas y alcanza tus metas. TaskFlow te acompaña paso a paso.
          </p>
        </div>
      </div>

      {modalExito && (
        <div className="modal">
          <div className="modal-content">
            <h3>✅ Registro exitoso</h3>
            <p>Redirigiendo a la página principal...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registro;