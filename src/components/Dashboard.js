import { useState } from "react";

const Dashboard = () => {

  return (
    <div className="all-dashboard">
      
      <header className="header">
        <div className="seccion-opciones">
            <button>Perfil</button>
        </div>
        <h1 className="dashboard-title">Bienvenido al Dashboard</h1>
        <p>Resumen general de la actividad en TaskFlow.</p>
      </header>

      <div className="seccion-links"><a>Home</a> <a>Graficos</a> <a>Analitica</a> <a>Comentarios</a> <a>Datos</a></div>

      {/* CONTENIDO */}
      <p className="seleccion-titulo">Datos de Usuario</p>
      <div className="conteneor-dashboard1">
        <div className="dashcaja1">
          {/* HOME */}
          <div className="user-contem">
            <h2>Total Usuarios</h2>
            <p>🔵<span>5</span></p>
          </div>
        </div>

        <div className="dashcaja2">
          <div className="user-contem">
            <h2>Usuarios Activos</h2>
            <p>🔵<span>12</span></p>
          </div>
        </div>

        <div className="dashcaja3">
          <div className="user-contem">
            <h2>Usuarios Nuevos</h2>
            <p>🔵<span>3</span></p>
          </div>
        </div>

        <div className="dashcaja4">
          <div className="user-contem">
            <h2>Feedback</h2>
            <p>🔵<span>3</span></p>
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
            <p>1</p>
          </div>
        </div>

        <div className="dashcaja6">
          <div className="grafic-contem">
            <h2>Usuarios activos</h2>
            <p>2</p>
          </div>
        </div>

        <div className="dashcaja7">
          <div className="grafic-contem">
            <h2>Usuario nuevos</h2>
            <p>3</p>
          </div>
        </div>

        <div className="dashcaja8">
          <div className="grafic-contem">
            <h2>Feedback</h2>
            <p>4</p>
          </div>
        </div>

      </div>

      <br></br>
      <p className="seleccion-titulo">Analitica</p>
      <div className="conteneor-dashboard3">
         {/* ANALITICA */}
         <div className="dashcaja9">
          <div className="any-contem">
            <h2>Sesiones en las últimas 24 horas/semana</h2>
            <p>1</p>
          </div>
        </div>

        <div className="dashcaja10">
          <div className="any-contem">
            <h2>Usuarios nuevos por día/semana/mes</h2>
            <p>2</p>
          </div>
        </div>

        <div className="dashcaja11">
          <div className="any-contem">
            <h2>Tareas creadas por los usuarios.</h2>
            <p>3</p>
          </div>
        </div>

        <div className="dashcaja12">
          <div className="any-contem">
            <h2>Promedio de tareas por usuario</h2>
            <p>4</p>
          </div>
        </div>

        <div className="dashcaja12">
          <div className="any-contem">
            <h2>Horas más activas de uso del sistema</h2>
            <p>4</p>
          </div>
        </div>

      </div>
      

      <p className="copyright">Copyright © 2025 RHcorp®. All rights reserved.</p>
    </div>
  );
};

export default Dashboard;
