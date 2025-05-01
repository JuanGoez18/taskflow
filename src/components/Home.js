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
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tareasVencidas, setTareasVencidas] = useState([]);
  const [mostrarBienvenida, setMostrarBienvenida] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [modalConfirmareliperfil, setModalConfirmarEliPerfil] = useState(false);
  const [tareaAEliminar, setTareaAEliminar] = useState(null);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [mostrarModalOpciones, setMostrarModalOpciones] = useState(false);
  const [mostrarModalOpcionesMenu, setMostrarModalOpcionesMenu] = useState(false);
  const [formulario, setFormulario] = useState({
    titulo: "",
    descripcion: "",
    fecha_limite: "",
    prioridad: "media",
    estado: 0,
    hora_notificacion: "",
    anticipacion: "",
  });


  //#####################################

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
  

  //funciones de Databases ################
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
        estado: 0,
        hora_notificacion: "08:00:00",
        anticipacion: "1 hour"
      };

      const res = await fetch(`http://localhost:5000/tareas/${usuario_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaTarea),
      });

      if (res.ok) {
        const tareaCreada = await res.json(); // Obtener la tarea creada con ID
        setTareas([...tareas, tareaCreada]);
        abrirEditor(tareaCreada); 
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

  //formato fecha input
  const formatearFechaInput = (fecha) => {
    if (!fecha) return "";
    const d = new Date(fecha);
    const offset = d.getTimezoneOffset();
    d.setMinutes(d.getMinutes() - offset);
    return d.toISOString().split("T")[0];
  };

  //funcion notificacion de tareas ya vencidas
  useEffect(() => {
    const ahora = new Date();
    const notificados = JSON.parse(localStorage.getItem("tareasNotificadas")) || [];
  
    const nuevasTareasVencidas = tareas.filter((tarea) => {
      if (!tarea.fecha_limite || !tarea.hora_notificacion) return false;
      if (tarea.estado === 1) return false;
  
      const fechaLimite = new Date(tarea.fecha_limite);
      const fechaHoy = new Date();
      fechaHoy.setHours(0, 0, 0, 0);
      const fechaSolo = new Date(fechaLimite);
      fechaSolo.setHours(0, 0, 0, 0);
  
      // CASO 1: Fecha pasada
      if (fechaSolo < fechaHoy && !notificados.includes(tarea.id)) {
        return true;
      }
  
      // CASO 2: Fecha hoy y hora vencida
      if (fechaSolo.getTime() === fechaHoy.getTime()) {
        const [h, m, s] = tarea.hora_notificacion.split(":");
        const fechaConHora = new Date(tarea.fecha_limite);
        fechaConHora.setHours(Number(h), Number(m), Number(s || 0), 0);
  
        if (ahora >= fechaConHora && !notificados.includes(tarea.id)) {
          return true;
        }
      }
  
      return false;
    });
  
    if (nuevasTareasVencidas.length > 0) {
      nuevasTareasVencidas.forEach((tarea) => {
        toast.warn(`⚠️ La tarea "${tarea.titulo}" ha vencido.`, {
          className: "toast-custom",
          position: "top-left",
          autoClose: 15000,
        });
      });
  
      const idsNotificados = nuevasTareasVencidas.map(t => t.id);
      localStorage.setItem("tareasNotificadas", JSON.stringify([...notificados, ...idsNotificados]));
    }
  
  }, [tareas]);

  //funcion notificacion de tareas que van pronto a vencer
  useEffect(() => {
    const intervalo = setInterval(() => {
      const ahora = new Date();
      const notificados = JSON.parse(localStorage.getItem("tareasNotificadas2")) || [];
  
      const anticipacionAMinutos = (valor) => {
        switch (valor) {
          case "1 hour": return 60;
          case "6 hour": return 360;
          case "12 hour": return 720;
          case "1 day": return 1440;
          default: return 0;
        }
      };
  
      tareas.forEach((tarea) => {
        if (!tarea.hora_notificacion || !tarea.anticipacion || tarea.estado === 1) return;
  
        const fechaSinHora = tarea.fecha_limite.split("T")[0];
        const fechaCompleta = new Date(`${fechaSinHora}T${tarea.hora_notificacion}`);
        const minutosAntes = anticipacionAMinutos(tarea.anticipacion);
        const momentoNotificar = new Date(fechaCompleta.getTime() - minutosAntes * 60 * 1000);
        console.log();
  
        if (ahora >= momentoNotificar && ahora < fechaCompleta && !notificados.includes(tarea.id)) {
          toast.info(`🔔 Tarea: "${tarea.titulo}" próximamente vence`, {
            className: "toast-custom2",
            position: "top-left",
            autoClose: 15000,
          });
  
          notificados.push(tarea.id);
          localStorage.setItem("tareasNotificadas2", JSON.stringify(notificados));
        }
      });
    }, 10000);
    return () => clearInterval(intervalo);
  }, [tareas]);

  //funcion color caja tareas vencidas
  const esTareaVencida = (tarea) => {
    if (!tarea.fecha_limite || !tarea.hora_notificacion) return false;
  
    const ahora = new Date();
  
    const fechaLimite = new Date(tarea.fecha_limite);
    const fechaHoy = new Date();
    fechaHoy.setHours(0, 0, 0, 0);
    const fechaSolo = new Date(fechaLimite);
    fechaSolo.setHours(0, 0, 0, 0);
  
    // Si es fecha pasada
    if (fechaSolo < fechaHoy) return true;
  
    // Si es hoy y hora ya pasó
    if (fechaSolo.getTime() === fechaHoy.getTime()) {
      const [h, m, s] = tarea.hora_notificacion.split(":");
      fechaLimite.setHours(Number(h), Number(m), Number(s || 0), 0);
      return ahora >= fechaLimite;
    }
  
    return false;
  };

  //funcion finalizar tareas
  const marcarComoFinalizada = async (id) => {
    try {
      const respuesta = await fetch(`http://localhost:5000/tareas/${id}/finalizar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ estado: 1 })
      });
  
      if (!respuesta.ok) throw new Error("Error al finalizar tarea");
  
      // Actualiza las tareas localmente
      const tareasActualizadas = tareas.map((tarea) =>
        tarea.id === id ? { ...tarea, estado: 1 } : tarea
      );
      setTareas(tareasActualizadas);
    } catch (error) {
      console.error("Error:", error);
    }
  };


  //funcion responsive boton opciones
  const [esMovil, setEsMovil] = useState(window.innerWidth < 768);

  useEffect(() => {
    const manejarResize = () => {
      setEsMovil(window.innerWidth < 701);
    };

    window.addEventListener("resize", manejarResize);
    return () => window.removeEventListener("resize", manejarResize);
  }, []);

  //#######################################################################
  //variables seccion graficos
  
  const [mostrarModalGraficos, setMostrarModalGraficos] = useState(false);

    //⭕ Contar tareas
    const totalTareas = tareas.length;
    const tareasPendientes = tareas.filter(t => new Date(t.fecha_limite) >= new Date()).length;
    const tareasVencidas2 = tareas.filter(t => new Date(t.fecha_limite) < new Date()).length;

    //⭕ colores grafica de pastel
    const data = [
      { name: "Pendientes", value: tareasPendientes, color: "#00c2f8" },
      { name: "Vencidas", value: tareasVencidas2, color: "#f80057" },
    ];

    //⭕ estado segun la cantidad de tareas pendientes
    const obtenerEstadoTareas = () => {
      const totalTareas = tareas.length;
      const tareasPendientes2 = tareas.filter(t => new Date(t.fecha_limite) >= new Date()).length;

      if (totalTareas === 0) return "Sin tareas";
      if (tareasPendientes2 <= 4) return "Relax";
      if (tareasPendientes2 <= 6) return "Bueno";
      if (tareasPendientes2 <= 9) return "Regular";
      if (tareasPendientes2 <= 14) return "Ajetreado";
      return "Crítico";
    };

    //⭕ promedio de dias segun cntidad de tareas pendientes
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


    //⭕ que tarea sigue segun su fecha limite
    const ahora = new Date();
    const proximasTareas = [...tareas]
      .filter(t => {
        if (!t.fecha_limite || !t.hora_notificacion || t.estado === 1) return false;

        const fechaSinHora = t.fecha_limite.split("T")[0];
        const fechaCompleta = new Date(`${fechaSinHora}T${t.hora_notificacion}`);

        return fechaCompleta >= ahora;
      })
      .sort((a, b) => {
        const fechaA = new Date(`${a.fecha_limite.split("T")[0]}T${a.hora_notificacion}`);
        const fechaB = new Date(`${b.fecha_limite.split("T")[0]}T${b.hora_notificacion}`);
        return fechaA - fechaB;
      })
      .slice(0, 3);


    //###############################################################################
    //OTRAS FUNCIONES
    //🛑funcion eliminar cuenta
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

    //guardar estado de modo oscuro
    const [modoOscuro, setModoOscuro] = useState(() => {
      return localStorage.getItem("modoOscuro") === "true";
    });

    //funcion para activar o desactivar el modo oscuro
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
    
    //bloquear scroll dentro de los modals
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
                        <p><strong>Nombre:</strong> {usuario.nombre+" "+usuario.apellido}</p>
                        <p><strong>Email:</strong> {usuario.email}</p>
                        <p><strong>Edad:</strong> {usuario.edad}</p>

                        <div className="modal-botones-perfil">
                          <button onClick={() => setModalConfirmarEliPerfil(true)} className="btn-danger">Borrar cuenta</button>
                          <button onClick={handleLogout} className="btn-logout">Desconectar</button>
                          <button onClick={() => setMostrarModal(false)} className="btn-cerrar">Cerrar</button>

                          {/* Modal eleminar cuaneta */}
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
                        className={`caja 
                          ${esTareaVencida(tarea) ? "tarea-vencida" : ""} 
                          ${tarea.estado === 1 ? "finalizada" : ""}`}
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
                        <p>Nivel de Prioridad {tarea.prioridad}</p><br></br>
                        {tarea.estado === 0 && new Date(`${tarea.fecha_limite.split("T")[0]}T${tarea.hora_notificacion}`) > new Date() && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            marcarComoFinalizada(tarea.id);
                          }}
                          className="btn-finalizar-tr"
                        >
                          Finalizar
                        </button>
                      )}
                        {tarea.estado === 1 && <span className="messagefinalizada">✔ Finalizada</span>}
                        
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation();
                            setTareaAEliminar(tarea);
                            setMostrarModalEliminar(true);
                          }} 
                          className="btn-eliminar-tr"
                        >
                          Borrar
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
                  <input type="date" name="fecha_limite" value={formatearFechaInput(formulario.fecha_limite)} onChange={manejarCambio} />
                  <input type="time" name="hora_notificacion"value={formulario.hora_notificacion || ""} onChange={manejarCambio}/>
                  <select className="seleanticipacion" name="anticipacion" value={formulario.anticipacion || ""} onChange={manejarCambio}>
                    <option value="">No anticipar</option>
                    <option value="1 hour">1 hora antes</option>
                    <option value="6 hour">6 horas antes</option>
                    <option value="12 hour">12 horas antes</option>
                    <option value="1 day">1 día antes</option>
                  </select>
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

