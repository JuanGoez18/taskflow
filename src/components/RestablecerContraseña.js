import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";



//estados
const RestablecerContraseña = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [erroresFormulario, setErroresFormulario] = useState([]);
  const [modalExito, setModalExito] = useState(false);

  //Funcion validar datos
  const validarFormulario = () => {
  const errores = [];

  if (nueva.length < 6) {
    errores.push("La nueva contraseña debe tener al menos 6 caracteres.");
  }

  if (nueva !== confirmar) {
    errores.push("Las contraseñas no coinciden.");
  }

  return errores;
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
    const res = await fetch("https://taskflownodesvr.onrender.com/restablecer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, nuevaContraseña: nueva }),
    });

    const data = await res.json();

    if (res.ok) {
        setModalExito(true);
        setTimeout(() => {
            setModalExito(false);
            navigate("/login");
        }, 3000);
    } else {
    setErroresFormulario([data.error || "Error al restablecer la contraseña."]);
    }
} catch (err) {
    console.error(err);
    setErroresFormulario(["Ocurrió un error en la solicitud."]);
}
};

  return (
    <div className="form">
        <div className="contem">
            <div className="left-section">
                <h2 className="title-sesion">Restablecer Contraseña</h2>
                {mensaje && <p className="">{mensaje}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                    type="password"
                    placeholder="Nueva contraseña"
                    value={nueva}
                    onChange={(e) => setNueva(e.target.value)}
                    />
                    <input
                    type="password"
                    placeholder="Confirmar contraseña"
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    />
                    <div><button className="" type="submit">Guardar</button></div>
                </form>
            </div>
            <div className="right-section">
                <p className="taskflow-phrase">
                    "La privacidad es lo mas importante y lo encuantra aqui— con TaskFlow."
                </p>
            </div>
            
            {/* Modal de errores */}
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
            {/* Modal de éxito */}
            {modalExito && (
            <div className="modal">
                <div className="modal-content">
                <h3>✅ Contraseña actualizada correctamente</h3>
                <p>Serás redirigido al login en unos segundos...</p>
                </div>
            </div>
            )}
        </div>
    </div>
  );
};

export default RestablecerContraseña;