import { useState, useEffect } from "react";

const MasSobreTaskFlow = () => {
  const [comentario, setComentario] = useState("");
  const [estrellas, setEstrellas] = useState(0);
  const [enviado, setEnviado] = useState(false);

  const usuario_id = localStorage.getItem("id.user");

  //🔹Enviar feedback
useEffect(() => {
    const verificarFeedback = async () => {
        try {
            const res = await fetch(`http://localhost:5000/feedback/${usuario_id}`);
            const data = await res.json();
        if (data.yaComento) {
            setEnviado(true);
            }
        } catch (error) {
        console.error("Error al verificar feedback:", error);
        }
    };

    if (usuario_id) {
        verificarFeedback();
        }
    }, [usuario_id]);

    // Enviar feedback
    const enviarFeedback = async () => {
    if (!estrellas || !comentario.trim()) {
        alert("Por favor, completa ambos campos antes de enviar.");
        return;
    }

    if (enviado) {
        alert("Ya enviaste un feedback anteriormente.");
        return;
    }

    try {
        const res = await fetch("http://localhost:5000/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estrellas, comentario, usuario_id }),
        });

        if (res.status === 409) {
        alert("Ya enviaste un feedback anteriormente.");
        setEnviado(true);
        return;
        }

        if (res.ok) {
        setEnviado(true);
        setComentario("");
        setEstrellas(0);
        } else {
        throw new Error("Error al enviar feedback");
        }
    } catch (error) {
        console.error("❌ Error al enviar feedback:", error);
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
 

  return (
    <div className="contenhome">
      <div className="conten2home">
        <div className="cjtitulo">
          <h1 className="titulohome">
            <a className="volverahome" href="/Home">↩</a>
            <span>Más de </span><span className="titulohome2">TaskFlow</span>
          </h1>
        </div>
        <p className="texto-bajotitulo">Organiza tu tiempo, mejora tu productividad.</p>

        {/* ¿Qué es TaskFlow? */}
        <section className="intro-infotask">
            <br></br>
            <h2 className="titulos">¿Qué es TaskFlow?</h2>
            <p className="texts">
            <strong>TaskFlow</strong> es una plataforma digital que te permite crear, editar y gestionar tus tareas diarias con facilidad. 
            Diseñada para ayudarte a priorizar lo más importante y mantenerte enfocado, TaskFlow es ideal para estudiantes y profesionales.
          </p>
        </section>
        <br></br>
        {/* Ventajas */}
        <section>
          <h2 className="titulos">Ventajas de usar TaskFlow</h2>
          <ul className="texts">
            <li>Acceso seguro.</li>
            <li>Gestión simple e intuitiva de tareas.</li>
            <li>Organización por prioridad y fecha límite.</li>
            <li>Recordatorios configurables por hora y anticipación.</li>
            <li>Panel de estadísticas para monitorear tu actividad.</li>
          </ul>
        </section>
        <br></br>
        {/* Guía rápida */}
        <section>
          <h2 className="titulos">Guía rápida para comenzar</h2>
          <ol className="texts">
            <li>Regístrate creando una cuenta con tu correo electrónico.</li>
            <li>Inicia sesión para acceder a tu panel personal.</li>
            <li>Crea tareas usando el botón <strong>"Agregar Tarea"</strong>.</li>
            <li>Asigna fecha límite, prioridad y recordatorios.</li>
            <li>Marca tareas como completadas y haz seguimiento de tu progreso.</li>
          </ol>
        </section>
        <br></br>
        {/* Formulario de feedback */}
        <section>
          <h2 className="titulos">¿Qué opinas de TaskFlow?</h2>
          {enviado ? (
            <p className="feedbacksusse">¡Gracias por tu feedback!</p>
          ) : (
            <div className="all-feedback">
               <div className="feedback-estrellascontem">
                {[1, 2, 3, 4, 5].map((n) => (
                    <button
                    key={n}
                    onClick={() => setEstrellas(n)}
                    className={`estrella ${n <= estrellas ? "activa" : ""}`}
                    >
                    ★
                    </button>
                ))}
                </div>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Escribe tu comentario..."
                className="textarea-comentario"
                rows={3}
              />
              <br></br>
              <button
                onClick={enviarFeedback}
                className="boton-feedback"
              >
                Enviar Feedback
              </button>
            </div>
          )}
        </section>
        <br></br>
        {/* Contacto y redes */}
        <section className="seccion-feedback">
          <h2 className="titulos">Contacto y redes sociales</h2>
          <p>Correo: <a href="#" className="infosoporte">soporte@taskflow.com</a></p>
          <p>Teléfono: <span className="infotelefono">+57 01800 3423</span></p>
          <div className="seccion-redessociles">
            <a href="#">Facebook</a>
            <a href="#">Twitter</a>
            <a href="#">Instagram</a>
            <a href="#">LinkedIn</a>
          </div>
        </section>
        <p className="copyright">Copyright © 2025 RHcorp®. All rights reserved.</p>
      </div>
    </div>
  );
};

export default MasSobreTaskFlow;