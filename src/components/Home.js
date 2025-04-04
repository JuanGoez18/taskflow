import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, FlatTree } from "framer-motion";
import { jwtDecode } from "jwt-decode";
import { toast, ToastContainer } from "react-toastify";
import { FaPencilAlt } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";


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
  const [mostrarBienvenida, setMostrarBienvenida] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState(null);

useEffect(() => {
  //funcion optener datos del usuario
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

  //funcion cerrar sesion
  const handleLogout = () => {
    const confirmar = window.confirm("¿Estás seguro de que deseas cerrar sesión?");
    if (confirmar) {
      setMostrarModal(false);
      localStorage.clear();
      navigate("/");
    }
  };

  //funcion validacion de sesion activa
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    } else {
      cargarTareas();
    }
  }, [navigate]);


  //funcion pantallas de carga
  useEffect(() => {
    if (!localStorage.getItem("primera_vez")) {
      setMostrarBienvenida(true);
      localStorage.setItem("primera_vez", "false"); 
  
      setTimeout(() => {
        setMostrarBienvenida(false);
        setCargando(false);
      }, 4000); 
    } else {
      setTimeout(() => {
        setCargando(false);
      }, 2000); 
    }
  }, []);
  

  //funciones de base de datos ################
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

  //#####################################

  //estados tareas
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

  //formato fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  //funcion notificacion de tareas vencidas
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

  //estados modal eliminar tareas
  const [tareaAEliminar, setTareaAEliminar] = useState(null);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);

  //estados modal opciones
  const [mostrarModalOpciones, setMostrarModalOpciones] = useState(false);

  //funcion responsive boton opciones
  const [esMovil, setEsMovil] = useState(window.innerWidth < 768);

  useEffect(() => {
    const manejarResize = () => {
      setEsMovil(window.innerWidth < 701);
    };

    window.addEventListener("resize", manejarResize);
    return () => window.removeEventListener("resize", manejarResize);
  }, []);


  const [mostrarModalGraficos, setMostrarModalGraficos] = useState(false);

    // 📌 Contar tareas
    const totalTareas = tareas.length;
    const tareasPendientes = tareas.filter(t => new Date(t.fecha_limite) >= new Date()).length;
    const tareasVencidas2 = tareas.filter(t => new Date(t.fecha_limite) < new Date()).length;

    const data = [
      { name: "Pendientes", value: tareasPendientes, color: "#00c2f8" },
      { name: "Vencidas", value: tareasVencidas2, color: "#f80057" },
    ];

    const obtenerEstadoTareas = () => {
      const totalTareas = tareas.length;
      const tareasPendientes = tareas.filter(t => new Date(t.fecha_limite) >= new Date()).length;

      if (totalTareas === 0) return "Sin tareas";  
      if (tareasPendientes === 2) return "Relax";  
      if (tareasPendientes <= 4) return "Bueno";  
      if (tareasPendientes <= 6) return "Regular";  
      if (tareasPendientes <= 9) return "Ajetreado";  
      return "Crítico";
    };


    const calcularPromedioDiasRestantes = (tareas) => {
      if (tareas.length === 0) return "Sin tareas activas";
    
      const hoy = new Date();
    
      const totalDias = tareas.reduce((acumulado, tarea) => {
        const fechaLimite = new Date(tarea.fecha_limite);
        const diasRestantes = Math.ceil((fechaLimite - hoy) / (1000 * 60 * 60 * 24));
        return acumulado + (diasRestantes > 0 ? diasRestantes : 0);
      }, 0);
    
      const promedioDias = Math.round(totalDias / tareas.length);
      return promedioDias > 0 ? `${promedioDias} días en promedio` : "Tareas vencidas";
    };



    const proximasTareas = [...tareas]
    .filter(t => new Date(t.fecha_limite) >= new Date())
    .sort((a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite))
    .slice(0, 3);


    const [modalConfirmareliperfil, setModalConfirmarEliPerfil] = useState(false);

    const handleEliminarCuenta = async () => {
      try {
        const res = await fetch(`http://localhost:5000/usuario/${usuario.id}`, {
          method: "DELETE",
        });
  
        if (res.ok) {
          alert("Cuenta eliminada correctamente");
          window.location.href = "/";
        } else {
          alert("Error al eliminar la cuenta");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    const [mostrarModalOpcionesMenu, setMostrarModalOpcionesMenu] = useState(false);
    const [modoOscuro, setModoOscuro] = useState(() => {
      return localStorage.getItem("modoOscuro") === "true";
    });

    useEffect(() => {
      if (modoOscuro) {
        document.body.classList.add("modo-oscuro");
      } else {
        document.body.classList.remove("modo-oscuro");
      }
    }, [modoOscuro]);
    
    const cambiarModo = () => {
      const nuevoModo = !modoOscuro;
      setModoOscuro(nuevoModo);
      localStorage.setItem("modoOscuro", nuevoModo);
    };

    useEffect(() => {
      if (mostrarModalGraficos || mostrarModal || tareaEditando || mostrarModalOpciones || mostrarModalOpcionesMenu) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    
      return () => {
        document.body.style.overflow = "";
      };
    }, [mostrarModalGraficos, mostrarModal, tareaEditando, mostrarModalOpciones, mostrarModalOpcionesMenu]);





 

  return  (
    <div>
      {mostrarBienvenida && (
        <div className="modal-bienvenida">
        <motion.h2 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 1.1, 1], opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut"}}
        >
          ¡Bienvenido a TaskFlow!
        </motion.h2>
        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Esperamos que disfrutes la experiencia.
        </motion.p>
      </div>  
      )}

      {cargando && !mostrarBienvenida && (
        <div className="pantalla-carga">
          <motion.div
            initial={{ x: 20 }}
            animate={{ x: 210 }}
            transition={{ duration: 1.5, ease: "linear" }}
            className="lapiz"
          >
            <FaPencilAlt size={30} color="#fff" />
          </motion.div>
          <motion.div
            initial={{ width: "30%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.1, ease: "linear" }}
            className="barra-carga"
          />
        </div>
      )}

      {!cargando && !mostrarBienvenida && (
        <div>
          {/* Aquí va el contenido normal de la app */}
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
                      <button className="btn-opciones" onClick={() => setMostrarModalGraficos(true)}>Gráficos</button>
                      <button className="btn-opciones" onClick={() => setMostrarModalOpcionesMenu(true)}>Opciones</button>
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
                        <button className="btn-opciones" onClick={() => {setMostrarModal(true);setMostrarModalOpciones(false);}}>Perfil</button>
                        <button className="btn-opciones" onClick={() => {setMostrarModalGraficos(true);setMostrarModalOpciones(false);}}>Gráficos</button>
                        <button className="btn-opciones" onClick={() => {setMostrarModalOpcionesMenu(true);setMostrarModalOpciones(false)}}>Opciones</button>
                        <button className="btn-cancelar-tarea" onClick={() => setMostrarModalOpciones(false)}>Cerrar</button>
                      </div>
                    </div>
                  )}

                  {/* modal opciones */}
                  {mostrarModalOpcionesMenu && (
                    <div className="modal-opciones">
                      <div className="modal-contenidoopciones">
                        <h2>Opciones</h2>
                        <div className="ContemOpciones">
                        <label className="switch">
                          <input type="checkbox" checked={modoOscuro} onChange={cambiarModo} />
                          <span className="slider"></span>
                        </label><p>Modo oscuro</p><br/>
                        <a href="#">mas sobre TaskFlow</a>
                        </div>
                        
                        <button onClick={() => setMostrarModalOpcionesMenu(false)}>Cerrar</button>
                      </div>
                    </div>
                  )}


                  {/* 📌 Modal de gráficos */}
                  {mostrarModalGraficos && (
                    <div className="modal">
                      <div className="modal-content-graficos">
                        <div className="modal-body">
                          <div className="cjgf-caja1">
                            <div className="cjgf-datos1">
                              <h2>Datos De Tareas.</h2>
                              <p><strong>Total de tareas:</strong> {totalTareas}</p>
                              <p><strong>Tareas pendientes:</strong> {tareasPendientes}</p>
                              <p><strong>Tareas vencidas:</strong> {tareasVencidas2}</p>

                              <div className="proximas-tareas">
                                <h2>Próximas tareas:</h2>
                                {proximasTareas.length > 0 ? (
                                  proximasTareas.map((tarea, index) => (
                                    <div key={index} className="tarea-proxima">
                                      <h3>{tarea.titulo}</h3>
                                      <p>{formatearFecha(tarea.fecha_limite)}</p>
                                    </div>
                                  ))
                                ) : (
                                  <p className="pnohay">No hay tareas próximas.</p>
                                )}
                              </div>
                            </div>
                            <div className="cjgf-dato1g">
                              {/* 📊 Gráfico de pastel */}
                              <PieChart width={250} height={250}>
                                <Pie 
                                  data={data} 
                                  cx="50%" 
                                  cy="50%" 
                                  outerRadius={80} 
                                  fill="#8884d8" 
                                  dataKey="value"
                                  label
                                  >
                                  {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                              </PieChart>
                            </div>
                            <div className="cjgf-dato2">
                              <h3>Estado de Tareas.</h3>
                              <p className={`estado ${obtenerEstadoTareas().toLowerCase()}`}>
                                {obtenerEstadoTareas()}
                              </p>
                            </div>
                            <div className="cjgf-dato3">
                                <h3>Tiempo Promedio.</h3>
                                <p>{calcularPromedioDiasRestantes(tareas)}</p>
                            </div>
                          </div>
                        </div>
                        <button className="btn-cerrar-graficos" onClick={() => setMostrarModalGraficos(false)}>Cerrar</button>
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
                          <button onClick={() => setModalConfirmarEliPerfil(true)} className="btn-danger">Borrar cuenta</button>
                          <button onClick={handleLogout} className="btn-logout">Desconectar</button>
                          <button onClick={() => setMostrarModal(false)} className="btn-cerrar">Cerrar</button>

                          {/* modal eleminar cuaneta */}
                          {modalConfirmareliperfil && (
                            <div className="modal">
                              <div className="modal-content">
                                <h3>❌ ¿Estás seguro de eliminar tu cuenta?</h3>
                                <p>Esta acción es irreversible.</p>
                                <button onClick={() => setModalConfirmarEliPerfil(false)}>Cancelar</button>
                                <button onClick={handleEliminarCuenta} className="btn-danger">Sí, eliminar</button>
                              </div>
                            </div>
                          )}
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
              {tareas.length === 0 && (
              <div className="tutorial">
                <h3>📌 ¡No tienes tareas aún!</h3>
                <p>Haz clic en "Nueva Tarea" para empezar a organizarte.</p>
              </div>
            )}
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
              <p className="copyright">Copyright © 2025 RHcorp®. All rights reserved.</p>
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
        </div>
      )}
    </div>
  );
};

export default Home;

