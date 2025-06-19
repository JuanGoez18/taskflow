import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";

const Dashboard = () => {

  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");


    if (!userData) {
      navigate("/Login");
      return;
    }

    const user = JSON.parse(userData);

    if (user.tipo !== "admin") {
      alert("Acceso denegado. Esta sección es solo para administradores.");
      navigate("/Home"); // o donde quieras redirigir al usuario normal
    }
  }, []);

  //datos usuarios
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalUsuariosSemanaAnterior: 0,
    usuariosActivos: 0,
    usuariosActivosSemana: 0,
    usuariosActivosSemanaAnterior: 0,
    usuariosNuevos: 0,
    usuariosNuevosSemanaAnterior: 0,
    feedback: 0,
    feedbackSemanaAnterior: 0,
    usuariosHoy: 0, usuariosMes: 0, usuariosAño: 0,
    tareasTotales: 0, promedioTareasPorUsuario: 0,
    promedioCalificacion: 0
  });

  //modals
  const [mostrarModalPerfil, setMostrarModalPerfil] = useState(false);
  const [mostrarModalFunciones, setMostrarModalFunciones] = useState(false);

  const [usuarios, setUsuarios] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [usuarioDestino, setUsuarioDestino] = useState("");
  const [seccion, setSeccion] = useState("eliminar");



  //funciones de Databases ######################
  // 🔹 Cargar datos de estadistica de usuarios ✔
  useEffect(() => {
    const fetchEstadisticas = () => {
      fetch("https://taskflownodesvr.onrender.com/dashboard/estadisticas")
        .then(response => {
          if (!response.ok) throw new Error("Error en la respuesta del servidor");
          return response.json();
        })
        .then(data => setStats(data))
        .catch(error => console.error("Error al cargar estadísticas:", error));
    };
    fetchEstadisticas();
    const intervalo = setInterval(fetchEstadisticas, 30000);
    return () => clearInterval(intervalo);
  }, []);


  // 🔹 Datos de grafica comparativa ✔
  const GRTotal = [
    {
      name: "Total usuarios",
      Actual: stats.totalUsuarios,
      Anterior: stats.totalUsuariosSemanaAnterior
    }
    
  ]
  const GRActivos = [
    {
      name: "Total activos",
      Actual: stats.usuariosActivosSemana,
      Anterior: stats.usuariosActivosSemanaAnterior
    }
    
  ]
  const GRNuevos = [
    {
      name: "Usuarios Nuevos",
      Actual: stats.usuariosNuevos,
      Anterior: stats.usuariosNuevosSemanaAnterior
    }
    
  ]
  const GRFeedback = [
    {
      name: "Feedback",
      Actual: stats.feedback,
      Anterior: stats.feedbackSemanaAnterior
    }
    
  ]

  // 🔹 Funciones Admin ✔
  //Funcion cargar usuarios
  useEffect(() => {
  const fetchUsuarios = () => {
    fetch("https://taskflownodesvr.onrender.com/dashboard/usuarios")
      .then(res => {
        if (!res.ok) throw new Error("Error al obtener usuarios");
        return res.json();
      })
      .then(data => setUsuarios(data))
      .catch(err => console.error("Error:", err));
  };

  fetchUsuarios();
}, []);

//Funcion eliminar usuarios
const eliminarUsuario = async (id) => {
  const confirmacion = window.confirm("¿Estás seguro de eliminar este usuario?");
  if (!confirmacion) return;

  try {
    const res = await fetch(`https://taskflownodesvr.onrender.com/dashboard/usuarios/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Error al eliminar");

    // Actualiza el estado eliminando el usuario del array
    setUsuarios(usuarios.filter((u) => u.id !== id));
  } catch (error) {
    console.error("Error eliminando usuario:", error);
  }
};

//Funcion cargar Comentarios
const [feedback, setFeedback] = useState([]);

useEffect(() => {
  fetch("https://taskflownodesvr.onrender.com/dashboard/feedback")
    .then((res) => res.json())
    .then((data) => setFeedback(data))
    .catch((err) => console.error("Error al cargar feedback:", err));
}, []);

//bloquear scroll dentro de los modals
    useEffect(() => {
      if (mostrarModalFunciones || mostrarModalPerfil) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    
      return () => {
        document.body.style.overflow = "";
      };
    }, [mostrarModalFunciones, mostrarModalPerfil]);




  

  return (
    <div className="dashboard-wrapper">
      <div className="all-dashboard">
        {/* Modal perfil */}
          {mostrarModalPerfil && (
            <div className="modal-perfil-admin">
              <div className="modal-contenido-perfil">
                <h2>Perfil</h2>
                <p><strong>Nombre:</strong> Juan Pérez</p>
                <p><strong>Correo:</strong> juan@example.com</p>
                <p><strong>Rol:</strong> Administrador</p>
                <button onClick={() => setMostrarModalPerfil(false)}>Cerrar</button>
              </div>
            </div>
          )}

          {/* Modal Funciones */}
          {mostrarModalFunciones && (
            <div className="modal-perfil-admin">
              <div className="conteneor-dashboard1">
                <div className="contenFunciones">
                  <p className="cerrar" onClick={() => setMostrarModalFunciones(false)}>↩</p>
                  <h1>Funciones Admin</h1>

                  <div className="modal-menu">
                    <button onClick={() => setSeccion("Usuarios")}>Usuarios</button>
                    <button onClick={() => setSeccion("mensajes")}>Comunidad</button>
                    <button onClick={() => setSeccion("comentarios")}>Feedbacks</button>
                  </div>

                  <div className="modal-seccion">
                    {seccion === "Usuarios" && (
                      <div>
                        <h3>Usuarios registrados</h3>
                        <div className="lista-usuarios">
                          {usuarios.map(u => (
                            <div key={u.id} className="usuario-item">
                              <span>{u.nombre}</span>
                              <button onClick={() => eliminarUsuario(u.id)}>Eliminar</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {seccion === "mensajes" && <p>✉️ Aquí podrás enviar mensajes</p>}
                    {seccion === "comentarios" && (
                      <div>
                        <h3>Comentarios de los usuarios</h3>
                        <div className="lista-feedback">
                          {feedback.map((comentario, index) => (
                            <div key={index} className="feedback-item">
                              <p className="comentario-autor"><strong>{comentario.usuario}</strong> dice:</p>
                              <p className="comentario-texto">{comentario.comentario}</p>
                              <p className="comentario-puntuacion">⭐ {comentario.calificacion}/5</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        
        <header className="header">
          <div className="seccion-opciones">
              <button onClick={() => setMostrarModalPerfil(true)}>Perfil</button>
          </div>
          <h1 className="dashboard-title">Bienvenido al Dashboard</h1>
          <p>Resumen general de la actividad en TaskFlow.</p>
        </header>

        <div className="seccion-links">
          <Link to="/">Inicio</Link>
          <Link to="/Home">Home</Link>
          <a href="#graficos">Gráficos</a>
          <a href="#analitica">Analítica</a>
          <a href="#feedback">Comentarios</a>
          <a onClick={() => setMostrarModalFunciones(true)}>Funciones</a>
        </div>

        {/* CONTENIDO */}
        <p className="seleccion-titulo">Datos de Usuarios</p>
        <div className="conteneor-dashboard1">
          <div className="dashcaja1">
            {/* HOME */}
            <div className="user-contem">
              <h2>Total Usuarios</h2>
              <p>🔵<span>{stats.totalUsuarios}</span></p>
            </div>
          </div>

          <div className="dashcaja2">
            <div className="user-contem">
              <h2>Usuarios Activos</h2>
              <p>🔵<span>{stats.usuariosActivos}</span></p>
            </div>
          </div>

          <div className="dashcaja3">
            <div className="user-contem">
              <h2>Usuarios Nuevos</h2>
              <p>🔵<span>{stats.usuariosNuevos}</span></p>
            </div>
          </div>

          <div className="dashcaja4">
            <div className="user-contem">
              <h2>Feedback</h2>
              <p>🔵<span>{stats.feedback}</span></p>
            </div>
          </div>
        </div>
        <p className="seleccion-titulo" id="graficos">Graficos</p>
        <div className="conteneor-dashboard2">
          {/* GRAFICOS */}
          <div className="grafico-container">
            <h2>Total Usuarios</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={GRTotal} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Anterior" fill="#f80057" />
                <Bar dataKey="Actual" fill="#386ee0" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grafico-container">
            <h2>Total activos</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={GRActivos} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Anterior" fill="#f80057" />
                <Bar dataKey="Actual" fill="#19aedb" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grafico-container">
            <h2>Nuevos Usuarios</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={GRNuevos} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Anterior" fill="#f80057" />
                <Bar dataKey="Actual" fill="#bb19db" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grafico-container">
            <h2>Nuevo Feedback</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={GRFeedback} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Anterior" fill="#f80057" />
                <Bar dataKey="Actual" fill="#19dba1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

        
        <p className="seleccion-titulo" id="analitica">Analitica</p>
        <div className="conteneor-dashboard3">
          {/* ANALITICA */}
          <div className="dashcaja9">
            <div className="any-contem">
              <h2>Usuarios nuevos por día/mes/año.</h2>
              <div className="contUsuarios">
                <p>Hoy: <strong>{stats.usuariosHoy}</strong></p>
                <p>Mes: <strong>{stats.usuariosMes}</strong></p>
                <p>Año: <strong>{stats.usuariosAño}</strong></p>
              </div>
            </div>
          </div>

          <div className="dashcaja10">
            <div className="any-contem">
              <h2>Tareas creadas por los usuarios.</h2>
              <p>El total de tareas es: <strong>{stats.tareasTotales}</strong></p>
            </div>
          </div>

          <div className="dashcaja11">
            <div className="any-contem">
              <h2>Promedio de tareas por usuario.</h2>
              <p>El promedio de notas es de: <strong>{stats.promedioTareasPorUsuario.toFixed(2)}</strong></p>
            </div>
          </div>
        </div>

        <p className="seleccion-titulo" id="feedback">Feedback</p>
        <div className="conteneor-dashboard3">
          {/* Feedback */}
          <div className="dashcaja12">
            <div className="any-contem">
              <h2>Promedio del feedback de los usuario.</h2>
              <div className="contUsuarios">
                <p>El promedio del feedback es de: <strong>{stats.promedioCalificacion}</strong></p>
              </div>
            </div>
          </div>
        </div>
        

        <p className="copyright">Copyright © 2025 RHcorp®. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Dashboard;
