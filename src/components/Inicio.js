import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Inicio = () => {
  const [hayToken, setHayToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setHayToken(true);
    localStorage.setItem("primera_vez", "true");
  }, []);

  return (
    <div className="conten0home">
            {/* HEADER */}
        <header>
            <h1 className="titulo-inicio">TaskFlow</h1>
            <div className="seccionlinksinicio">
              {!hayToken ? (
                <>
                  <Link to="/Registro">Registrarse</Link>
                  <Link to="/Login" style={{ marginLeft: "10px" }}>Iniciar sesión</Link>
                </>
              ) : (
                <Link to="/Home" className="link-registro">Ir al Home</Link>
              )}
            </div>
        </header>

        {/* HERO */}
        <section className="seccioninicio1">
            <div className="cajaseccion1">
            <p>Una herramienta simple y potente para gestionar tus tareas diarias con prioridad, fechas y recordatorios.</p>
            <a href="#porqueTask">Por qué TaskFlow /</a>
            <a href="#redesTask">Redes</a>
            </div>
            <img src={`${process.env.PUBLIC_URL}/img/1.png`} alt="TaskFlow ilustración" className="imgIlustracion" />
        </section>

        {/* FEATURES */}
        <section className="seccioninicio2">
            <h3 id="porqueTask">¿Por qué usar TaskFlow?</h3>
            <div className="cajaseccion2">
                <div>
                    <img src={`${process.env.PUBLIC_URL}/img/2.png`} className="img2" alt="Métricas de organización" />
                    <h4 className="font-bold mb-2">Metricas de orgnizción</h4>
                    <p>Usa graficas y datos en tiempo real.</p>
                </div>
                <div>
                    <img src={`${process.env.PUBLIC_URL}/img/3.PNG`} className="img3" alt="Fácil organización" />
                    <h4 className="font-bold mb-2">Fácil organización</h4>
                    <p>Organiza por fecha o por prioridad.</p>
                </div>
                <div>
                    <img src={`${process.env.PUBLIC_URL}/img/4.png`} className="img4" alt="Interfaz intuitiva" />
                    <h4 className="font-bold mb-2">Una interfaz simple e intuitiva</h4>
                    <p>Crea tus tareas y deja que todo fluya.</p>
                </div>
            </div>
            <p className="mensajeinvitacion">Accede desde donde quieras. Solo necesitas tu cuenta.</p>
        </section>
        {/* Contacto y redes */}
        <section className="seccion-feedbackinicio">
          <h2 id="redesTask" className="titulosredesinicio">Contacto y redes sociales</h2>
          <p>Correo: <a href="#" className="infosoporte">soporte@taskflow.com</a></p>
          <p>Teléfono: <span className="infotelefono">+57 01800 3423.</span></p>
          <div className="seccion-redessociles">
            <a href="#">Facebook.</a>
            <a href="#">Instagram.</a>
            <a href="#">LinkedIn.</a>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="copyright">
        Copyright © 2025 RHcorp®. All rights reserved.
        </footer>
    </div>
  );
};

export default Inicio;