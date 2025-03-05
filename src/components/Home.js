import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);



  const [tareas, setTareas] = useState([
    { id: 1, titulo: "Nueva tarea", descripcion: "Descripcion corta", fecha: "****-***-**" }
  ]);

  const [tareaEditando, setTareaEditando] = useState(null);
  const [formulario, setFormulario] = useState({ titulo: "", descripcion: "", fecha: "" });

  const agregarTarea = () => {
    const nuevaTarea = {
      id: Date.now(),
      titulo: "Nueva tarea",
      descripcion: "Descripcion corta",
      fecha: "****-***-**",
    };
    setTareas([...tareas, nuevaTarea]);
  };

  const eliminarTarea = (id) => {
    setTareas(tareas.filter((tarea) => tarea.id !== id));
  };

  const abrirEditor = (tarea) => {
    setTareaEditando(tarea.id);
    setFormulario(tarea);
  };

  const manejarCambio = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const guardarCambios = () => {
    setTareas(tareas.map((t) => (t.id === tareaEditando ? formulario : t)));
    cerrarEditor();
  };

  const cerrarEditor = () => {
    setTareaEditando(null);
  };

  

  return (
    <div className="contenhome">
      <div className="conten2home">
        <div className="titulo-opciones">
          <div className="cjtitulo">
            <h1 className="titulohome">Bienvenido a TaskFlow</h1>
            <p className="text-gray-600 mt-2">Crea y gestiona tus tareas.</p>
          </div>
          <div className="cjopciones">
            <button className="btn-opciones">Perfil</button>
            <button className="btn-opciones">Configuración</button>
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
              {tareas.map((tarea) => (
                <motion.div
                  key={tarea.id}
                  className="caja"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => abrirEditor(tarea)}
                >
                  <h1>{tarea.titulo}</h1>
                  <h2>{tarea.descripcion}</h2>
                  <span>{tarea.fecha}</span><br></br>
                  <button onClick={(e) => { e.stopPropagation(); eliminarTarea(tarea.id); }} className="btn-eliminar-tr">
                    Finalizar
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {tareaEditando !== null && (
        <div className="modal">
          <div className="modal-content">
            <h2>Editar Tarea</h2>
            <input type="text" name="titulo" value={formulario.titulo} onChange={manejarCambio} />
            <input type="date" name="fecha" value={formulario.fecha} onChange={manejarCambio} />
            <textarea name="descripcion" value={formulario.descripcion} onChange={manejarCambio}></textarea>
            <button onClick={guardarCambios} className="btn-guardar-tarea">Guardar</button>
            <button onClick={cerrarEditor} className="btn-cancelar-tarea">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

