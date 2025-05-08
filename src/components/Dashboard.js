import { useEffect, useState } from "react";

const Dashboard = () => {

  const [stats, setStats] = useState({
    totalUsuarios: 0,
    usuariosActivos: 0,
    usuariosNuevos: 0,
    feedback: 0
  });

  //funciones de Databases ######################
  // 🔹 Cargar datos de estadistica de usuarios ✔
  useEffect(() => {
    const fetchEstadisticas = () => {
      fetch("http://localhost:5000/dashboard/estadisticas")
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



  

  return (
    <div className="dashboard-wrapper">
      <div className="all-dashboard">
        
        <header className="header">
          <div className="seccion-opciones">
              <button>Perfil</button>
          </div>
          <h1 className="dashboard-title">Bienvenido al Dashboard</h1>
          <p>Resumen general de la actividad en TaskFlow.</p>
        </header>

        <div className="seccion-links"><a>Home</a> <a>Graficos</a> <a>Analitica</a> <a>Comentarios</a> <a>Funciones</a></div>

        {/* CONTENIDO */}
        <p className="seleccion-titulo">Datos de Usuario</p>
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

        <br></br>
        <p className="seleccion-titulo">Graficos</p>
        <div className="conteneor-dashboard2">
          {/* GRAFICOS */}
          <div className="dashcaja5">
            <div className="grafic-contem">
              <h2>Total de usuarios</h2>
              <p>--</p>
            </div>
          </div>

          <div className="dashcaja6">
            <div className="grafic-contem">
              <h2>Usuarios activos</h2>
              <p>--</p>
            </div>
          </div>

          <div className="dashcaja7">
            <div className="grafic-contem">
              <h2>Usuario nuevos</h2>
              <p>--</p>
            </div>
          </div>

          <div className="dashcaja8">
            <div className="grafic-contem">
              <h2>Feedback</h2>
              <p>--</p>
            </div>
          </div>

        </div>

        <br></br>
        <p className="seleccion-titulo">Analitica</p>
        <div className="conteneor-dashboard3">
          {/* ANALITICA */}
          <div className="dashcaja9">
            <div className="any-contem">
              <h2>Usuarios nuevos por día/semana/mes.</h2>
              <div className="contUsuarios">
                <p>Dia: <strong>1</strong></p>
                <p>Mes: <strong>1</strong></p>
                <p>año: <strong>1</strong></p>
              </div>
            </div>
          </div>

          <div className="dashcaja10">
            <div className="any-contem">
              <h2>Tareas creadas por los usuarios.</h2>
              <p>El total de tareas es: <strong>200</strong></p>
            </div>
          </div>

          <div className="dashcaja11">
            <div className="any-contem">
              <h2>Promedio de tareas por usuario.</h2>
              <p>El promedio de notas es de: <strong>1356</strong></p>
            </div>
          </div>
        </div>
        

        <p className="copyright">Copyright © 2025 RHcorp®. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Dashboard;
