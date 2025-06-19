import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RecuperarContraseña = () => {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://taskflownodesvr.onrender.com/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMensaje(data.mensaje);
    } catch (err) {
      console.error(err);
      setMensaje("Ocurrió un error.");
    }
  };

  return (
    <div className="form">
        <div className="contem">
            <div className="left-section">
                <h2 className="title-sesion">Recuperar contraseña</h2>
                <p>!Digita tu correo para continuar</p>
                <form onSubmit={handleSubmit}>
                    <input
                    type="email"
                    placeholder="Introduce tu correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    />
                    <div>
                        <br></br>
                        <button type="button" onClick={() => navigate(-1)}>Cancelar</button>
                        <button type="submit">Enviar enlace</button>
                    </div>
                </form>
                {mensaje && <p>{mensaje}</p>}
            </div>
            <div className="right-section">
                <p className="taskflow-phrase">
                    "La privacidad es lo mas importante y lo encuantra aqui— con TaskFlow."
                </p>
            </div>
        </div>
    </div>
  );
};

export default RecuperarContraseña;
