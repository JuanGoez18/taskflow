import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import Home from "./components/Home";
import Registro from "./components/Registro";
import Dashboard from "./components/Dashboard";
import Mas from "./components/MasSobreTaskFlow";
import Inicio from "./components/Inicio";
import RecuperarContraseña from "./components/RecuperarContraseña";
import RestablecerContraseña from "./components/RestablecerContraseña";
import EditarPerfil from "./components/EditarPerfil";

function App() {
  return (
    <BrowserRouter basename="/taskflow">
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/Login" element={<LoginForm />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Registro" element={<Registro />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Mas" element={<Mas />} />
        <Route path="/Recuperacion" element={<RecuperarContraseña />} />
        <Route path="/restablecer/:token" element={<RestablecerContraseña />} />
        <Route path="/MyPerfil" element={<EditarPerfil />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
