import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import Home from "./components/Home";
import Registro from "./components/Registro";
import Dashboard from "./components/Dashboard";
import Mas from "./components/MasSobreTaskFlow";
import Inicio from "./components/Inicio";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/Login" element={<LoginForm />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Registro" element={<Registro />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Mas" element={<Mas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
