import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const EditarPerfil = ({ usuarioId, onCerrar }) => {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    edad: "",
  });

  const [loading, setLoading] = useState(true);
  const [mostrarModalExito, setMostrarModalExito] = useState(false);
  const navigate = useNavigate();

  //token usuario id
  const obtenerUsuarioID = () => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      console.error("No hay token en localStorage");
      return null;
    }
  
    try {
      const decoded = jwtDecode(token);
      localStorage.setItem("id.user", decoded.id);
    } catch (error) {
      console.error("Error al decodificar token:", error);
      return null;
    }
  };
  
  obtenerUsuarioID();

  usuarioId = localStorage.getItem("id.user");


  //🔹 Obtener datos desde la base de datos
  useEffect(() => {
    const obtenerDatosUsuario = async () => {
      try {
        const res = await fetch(`https://taskflownodesvr.onrender.com/usuario/${usuarioId}`);
        const data = await res.json();
        setForm({
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          edad: data.edad || "",
        });
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener usuario:", error);
        alert("No se pudo cargar la información del usuario.");
      }
    };

    if (usuarioId) {
      obtenerDatosUsuario();
    }else{
      console.log("no hay token");
    }
  }, [usuarioId]);

  //actualizar cambios del formulario a base de datos
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`https://taskflownodesvr.onrender.com/usuario/update/${usuarioId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMostrarModalExito(true);
        setTimeout(() => {
          setMostrarModalExito(false);
          navigate("/Home");
        }, 3000);
      } else {
        alert("Error al actualizar el perfil.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="form">
      <div className="contem">
        <div className="left-section">
          <h2 className="title-sesion">Editar Perfil</h2>
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div>
                <input type="text" placeholder="Nombre" name="nombre" value={form.nombre} onChange={handleChange} required />
              </div>
              <div>
                <input type="text" placeholder="Apellido" name="apellido" value={form.apellido} onChange={handleChange} required />
              </div>
              <div>
                <input type="number" placeholder="Edad" name="edad" value={form.edad} onChange={handleChange} required />
              </div>
              <div>
                <button type="button" onClick={() => navigate(-1)}>Cancelar</button>
                <button type="submit">Guardar</button>
              </div>
            </form>
          )}
        </div>
        <div className="right-section">
          <p className="taskflow-phrase">
            "Mantén tus datos actualizados y tus tareas organizadas — con TaskFlow."
          </p>
        </div>
      </div>
      {mostrarModalExito && (
        <div className="modal">
          <div className="modal-content">
            <h3>✅ Perfil actualizado</h3>
            <p>Tu perfil se actualizó correctamente.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditarPerfil;