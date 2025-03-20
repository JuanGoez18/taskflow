import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";

const obtenerUsuarioID = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("No hay token en localStorage");
    return null;
  }

  try {
    const decoded = jwtDecode(token);
    //console.log("🔑 Usuario ID:", decoded.id); //ID user
    localStorage.setItem("id.user", decoded.id);
  } catch (error) {
    console.error("Error al decodificar token:", error);
    return null;
  }
};

obtenerUsuarioID();

const usuario_id = localStorage.getItem("id.user");
const API_URL = `http://localhost:5000/tareas/${usuario_id}`;

const Home = () => {
  const navigate = useNavigate();
  const [tareas, setTareas] = useState([]);
  const [tareaEditando, setTareaEditando] = useState(null);
  const [formulario, setFormulario] = useState({ titulo: "", descripcion: "", fecha_limite: "", prioridad: "media" });
  const [mostrarModal, setMostrarModal] = useState(false);


  const [usuario, setUsuario] = useState(null);

useEffect(() => {
  const obtenerDatosUsuario = async () => {
    try {
      const res = await fetch(`http://localhost:5000/usuario/${usuario_id}`);
      if (!res.ok) throw new Error("Error al obtener datos del usuario");
      
      const data = await res.json();
      setUsuario(data);
    } catch (error) {
      console.error(error);
    }
  };

  obtenerDatosUsuario();
}, []);

  const handleLogout = () => {
    const confirmar = window.confirm("¿Estás seguro de que deseas cerrar sesión?");
    if (confirmar) {
      setMostrarModal(false);
      localStorage.clear();
      navigate("/");
    }
  };


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    } else {
      cargarTareas();
    }
  }, [navigate]);
  

  // 🔹 Cargar tareas desde la base de datos ✔
  const cargarTareas = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setTareas(data);
    } catch (error) {
      console.error("Error cargando tareas:", error);
    }
  };

  // 🔹 Agregar nueva tarea ✔
  const agregarTarea = async () => {
    try {
      const nuevaTarea = {
        titulo: "🖊Nueva tarea",
        descripcion: "🖊Descripción",
        fecha_limite: new Date().toISOString().split("T")[0],
        prioridad: "media",
        usuario_id: usuario_id,
      };

      const res = await fetch(`http://localhost:5000/tareas/${usuario_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaTarea),
      });

      if (res.ok) {
        cargarTareas(); 
      }
    } catch (error) {
      console.error("Error al agregar tarea:", error);
    }
  };

  // 🔹 Eliminar tarea ✔
  const eliminarTarea = async (id) => {
    try {
      await fetch(`http://localhost:5000/tareas/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id }),
      });
  
      cargarTareas();
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
    }
  };

  // 🔹 Editar tarea ✔
  const guardarCambios = async () => {
    try {
      await fetch(`http://localhost:5000/tareas/${tareaEditando}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formulario),
      });

      cerrarEditor();
      cargarTareas();
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
    }
  };

  const abrirEditor = (tarea) => {
    setTareaEditando(tarea.id);
    setFormulario(tarea);
  };

  const cerrarEditor = () => {
    setTareaEditando(null);
  };

  const manejarCambio = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  

  return (
    <div className="contenhome">
      <div className="conten2home">
        <div className="titulo-opciones">
          <div className="cjtitulo">
            <h1 className="titulohome"><span>Bienvenido</span> <span className="titulohome2">a TaskFlow</span></h1>
            <p className="text-gray-600 mt-2">Crea y gestiona tus tareas.</p>
          </div>
          <div className="cjopciones">
            <button className="btn-opciones" onClick={() => setMostrarModal(true)}>Perfil</button>
            <button className="btn-opciones">Configuración</button>

            {/* Modal-perfil */}
            {mostrarModal && usuario && (
              <div className="modal-perfil">
                <div className="modal-contenido-perfil">
                  <h2>Perfil</h2>
                  <p><strong>Nombre:</strong> {usuario.nombre}</p>
                  <p><strong>Email:</strong> {usuario.email}</p>
                  <p><strong>Edad:</strong> {usuario.edad}</p>

                  <div className="modal-botones-perfil">
                    <button onClick={() => setMostrarModal(false)} className="btn-cerrar">Cancelar</button>
                    <button onClick={handleLogout} className="btn-logout">Desconectar</button>
                  </div>
                </div>
              </div>
          )}

          </div>
        </div>

        <div className="opciones">
          <button className="btn-nuevatarea" onClick={agregarTarea}>
            Nueva tarea
          </button>
        </div>

        <div className="panel-cajas">
          <div className="contenedor-cajas">
            <AnimatePresence>
              {tareas.map((tarea, index) => (
                <motion.div
                  key={tarea.id}
                  className="caja"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => abrirEditor(tarea)}
                >
                  <p className="contercj">{index + 1}</p>
                  <h1>{tarea.titulo}</h1>
                  <h2>{tarea.descripcion}</h2>
                  <span>{formatearFecha(tarea.fecha_limite)}</span>
                  <p>Prioridad: {tarea.prioridad}</p><br></br>
                  <button onClick={(e) => {e.stopPropagation(); 
                    const confirmar = window.confirm("¿Estás seguro de finalizar esta tarea?");
                    if (confirmar) {
                      eliminarTarea(tarea.id);
                    }
                  }} 
                  className="btn-eliminar-tr"
                >
                  Finalizar
                </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modal-tareas */}
      {tareaEditando !== null && (
        <div className="modal">
          <div className="modal-content">
            <h2>Editar Tarea</h2>
            <input type="text" name="titulo" value={formulario.titulo} onChange={manejarCambio} />
            <input type="date" name="fecha_limite" value={formulario.fecha_limite} onChange={manejarCambio}/>
            <select className="seleprioridad" name="prioridad" value={formulario.prioridad} onChange={manejarCambio}>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
            <textarea name="descripcion" value={formulario.descripcion} onChange={manejarCambio}></textarea>
            <br></br>
            <button onClick={cerrarEditor} className="btn-cancelar-tarea">Cancelar</button>
            <button onClick={guardarCambios} className="btn-guardar-tarea">Guardar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

