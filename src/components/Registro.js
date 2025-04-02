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
          window.location.href = "/";
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
        <h2 className="title-registro">Registro</h2>
        <div className="inputs-register">
          <form onSubmit={handleSubmit}>
            <input type="text" name="nombre" placeholder="Nombre" onChange={handleChange} required />
            <input type="text" name="apellido" placeholder="Apellido" onChange={handleChange} required />
            <input type="email" name="email" placeholder="Correo" onChange={handleChange} required />
            <input type="number" name="edad" placeholder="Edad" onChange={handleChange} required />
            <input type="password" name="contraseña" placeholder="Contraseña" onChange={handleChange} required />
            <button type="button" onClick={() => window.location.href = "/"}>Cancelar</button>
            <button type="submit">Registrarse</button>
          </form>
        </div>
      </div>

      {/* MODAL DE ÉXITO */}
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