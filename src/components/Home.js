import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, FlatTree } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [tareasVencidas, setTareasVencidas] = useState([]);


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
      const mañana = new Date();
      mañana.setDate(mañana.getDate() + 1);
      const fechaMañana = mañana.toISOString().split("T")[0]; 


      const nuevaTarea = {
        titulo: "🖊Nueva tarea",
        descripcion: "🖊Descripción",
        fecha_limite: fechaMañana,
        prioridad: "media",
        usuario_id: usuario_id,
      };

      const res = await fetch(`http://localhost:5000/tareas/${usuario_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaTarea),
      });

      if (res.ok) {
        const tareaCreada = await res.json(); // Obtener la tarea creada con ID
        setTareas([...tareas, tareaCreada]); // Agregar al estado
        abrirEditor(tareaCreada);
        //cargarTareas(); 
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


  useEffect(() => {
    const hoy = new Date();
    const tareasNotificadas = JSON.parse(localStorage.getItem("tareasNotificadas")) || [];
  
    const nuevasTareasVencidas = tareas.filter((tarea) => {
      const fechaTarea = new Date(tarea.fecha_limite);
      const diferenciaDias = Math.ceil((fechaTarea - hoy) / (1000 * 60 * 60 * 24));
  
      if (diferenciaDias <= 0 && !tareasNotificadas.includes(tarea.id)) {
        return true;
      }
      return false;
    });
  
    if (nuevasTareasVencidas.length > 0) {
      nuevasTareasVencidas.forEach((tarea) => {
        toast.warn(`La tarea "${tarea.titulo}" ha vencido.`, {
          className: "toast-custom",
          position: "top-left",
          autoClose: 15000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      });
  
      const idsNotificados = nuevasTareasVencidas.map((tarea) => tarea.id);
      localStorage.setItem("tareasNotificadas", JSON.stringify([...tareasNotificadas, ...idsNotificados]));
    }
  
    setTareasVencidas(tareas.filter(t => new Date(t.fecha_limite) < hoy));
  }, [tareas]);


  const [tareaAEliminar, setTareaAEliminar] = useState(null);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);


  const [mostrarModalOpciones, setMostrarModalOpciones] = useState(false);
  const [esMovil, setEsMovil] = useState(window.innerWidth < 768);

  useEffect(() => {
    const manejarResize = () => {
      setEsMovil(window.innerWidth < 964);
    };

    window.addEventListener("resize", manejarResize);
    return () => window.removeEventListener("resize", manejarResize);
  }, []);




  

  return  (
    <div className="contenhome">
      <div className="conten2home">
        <ToastContainer />
        <div className="titulo-opciones">
          <div className="cjtitulo">
            <h1 className="titulohome"><span>Bienvenido</span> <span className="titulohome2">a TaskFlow</span></h1>
            <p className="text-gray-600 mt-2">Crea y gestiona tus tareas.</p>
          </div>
          <div className="cjopciones">
            {/* 📌 Botones en PC */}
            {!esMovil ? (
              <>
                <button className="btn-opciones" onClick={() => setMostrarModal(true)}>Perfil</button>
                <button className="btn-opciones">Gráficos</button>
                <button className="btn-opciones">Opciones</button>
              </>
            ) : (
              // 📌 Botón de menú en móviles
              <button 
                className="btn-menu-movil" 
                onClick={() => setMostrarModalOpciones(true)}
              >
                ☰ Menú
              </button>
            )}

            {/* 📌 Modal de opciones en móviles */}
            {mostrarModalOpciones && (
              <div className="modal">
                <div className="modal-content">
                  <h2>Menú</h2>
                  <button className="btn-opciones" onClick={() => setMostrarModal(true)}>Perfil</button>
                  <button className="btn-opciones" onClick={() => setMostrarModalOpciones(false)}>Gráficos</button>
                  <button className="btn-opciones" onClick={() => setMostrarModalOpciones(false)}>Opciones</button>
                  <button className="btn-cancelar-tarea" onClick={() => setMostrarModalOpciones(false)}>Cerrar</button>
                </div>
              </div>
            )}

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

        
        {/*modal-eliminar-opcion*/}
        {mostrarModalEliminar && tareaAEliminar && (
          <div className="modal">
            <div className="modal-content">
              <h2 className="modal-eliminar-titulo">⚠Confirmar eliminación</h2>
              <p>¿Estás seguro de que deseas finalizar la tarea <strong>{tareaAEliminar.titulo}</strong>?</p>
              
              <button onClick={() => {
                setMostrarModalEliminar(false);
                setTareaAEliminar(null);
              }} className="btn-cancelar-tarea">
                Cancelar
              </button>

              <button 
                onClick={() => {
                  eliminarTarea(tareaAEliminar.id);
                  setMostrarModalEliminar(false);
                  setTareaAEliminar(null);
                }} 
                className="btn-guardar-tarea"
              >
                Confirmar
              </button>
            </div>
          </div>
        )}


        <div className="panel-cajas">
          <div className="contenedor-cajas">
            <AnimatePresence>
              {tareas.map((tarea, index) => (
                <motion.div
                  key={tarea.id}
                  className={`caja ${new Date(tarea.fecha_limite) < new Date() ? "tarea-vencida" : ""}`}
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
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation();
                      setTareaAEliminar(tarea);
                      setMostrarModalEliminar(true);
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

