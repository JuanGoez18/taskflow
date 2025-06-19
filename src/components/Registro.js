import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Registro = ({ onClose }) => {
  const [formulario, setFormulario] = useState({
    nombre: "",
    apellido: "",
    email: "",
    edad: "",
    contraseña: "",
  });

  const [modalExito, setModalExito] = useState(false);
  const [erroresFormulario, setErroresFormulario] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  //🔹 submit a la base de datos
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errores = validarFormulario();
    if (errores.length > 0) {
      setErroresFormulario(errores);
      return;
    }

    try {
      const res = await fetch("https://taskflownodesvr.onrender.com/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formulario),
      });

      if (res.ok) {
        setModalExito(true);
        setTimeout(() => {
          setModalExito(false);
          navigate("/Login");
        }, 3000);
      } else {
        alert("Error al registrar usuario");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };


  //Funcion validar datos
  const validarFormulario = () => {
  const { nombre, apellido, email, edad, contraseña } = formulario;

  const errores = [];

  if (nombre.length > 10) {
    errores.push("El nombre no debe superar los 10 caracteres.");
  }

  if (apellido.length > 10) {
    errores.push("El apellido no debe superar los 10 caracteres.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errores.push("El correo electrónico no es válido.");
  }

  if (!/^\d{1,2}$/.test(edad)) {
    errores.push("La edad debe ser un número de máximo 3 dígitos.");
  }

  if (contraseña.length < 6) {
    errores.push("La contraseña debe tener al menos 6 caracteres.");
  }

  return errores;
};



  return (
    <div className="form">
      <div className="contem">
        {/* LEFT: Formulario */}
        <div className="left-section">
          <h2 className="title-registro">Registro</h2>
          <form onSubmit={handleSubmit}>
            <label><input type="text" name="nombre" placeholder="Nombre" onChange={handleChange} required /><span className="required">*</span></label>
            <label><input type="text" name="apellido" placeholder="Apellido" onChange={handleChange} required /><span className="required">*</span></label>
            <label><input type="email" name="email" placeholder="Correo" onChange={handleChange} required /><span className="required">*</span></label>
            <label><input type="number" name="edad" placeholder="Edad" onChange={handleChange} required /><span className="required">*</span></label>
            <label><input type="password" name="contraseña" placeholder="Contraseña" onChange={handleChange} required /><span className="required">*</span></label>
            <div>
              <button type="button" onClick={() => navigate(-1)}>Cancelar</button>
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

      {erroresFormulario.length > 0 && (
        <div className="modal">
          <div className="modal-content">
            <h3>⚠️ Errores en el formulario</h3>
            <ul>
              {erroresFormulario.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
            <button onClick={() => setErroresFormulario([])}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registro;