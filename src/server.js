require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

//conexion
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});


/*
incriptar contraseña

bcrypt.hash("contraseña", 10, (err, hash) => {
  if (err) console.error(err);
  console.log("🔑 Hash generado:", hash);
}); */




//función info conexion
const testDBConnection = async () => {
  try {
    console.log("🟡 Intentando conectar a PostgreSQL...");
    console.log("🔍 Configuración usada:", {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    });

    const client = await pool.connect();
    console.log("✅ Conexión exitosa a PostgreSQL");
    
    const result = await client.query("SELECT NOW();");
    console.log("🕒 Hora actual en la BD:", result.rows[0].now);

    client.release();
  } catch (error) {
    console.error("❌ Error al conectar con PostgreSQL:");
    console.error("🔴 Código de error:", error.code);
    console.error("📜 Mensaje de error:", error.message);
    console.error("📌 Stack Trace:", error.stack);
  }
};

testDBConnection();



/*
const obtenerUsuarios = async () => {
  try {
    const result = await pool.query("SELECT * FROM usuarios;");
    console.log("✅ Lista de usuarios:", result.rows);
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error);
  }
};

obtenerUsuarios(); */






//SERVICIOS########################################################################


//Registrar un nuevo usuario*********************************************
app.post("/registro", async (req, res) => {
  const { nombre, apellido, email, edad, contraseña } = req.body;

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contraseña, saltRounds);

    const result = await pool.query(
      "INSERT INTO usuarios (nombre, apellido, email, edad, contraseña, tipo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [nombre, apellido, email, edad, hashedPassword, "user"]
    );

    res.status(201).json({ message: "Usuario registrado con éxito", usuario: result.rows[0] });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ error: "Error en el registro" });
  }
});


//Inicio de sesión *********************************************
app.post("/login", async (req, res) => {
  const { email, contraseña } = req.body;

  if (!email || !contraseña) {
    return res.status(400).json({ message: "email y contraseña son obligatorios" });
  }

  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(contraseña, user.contraseña);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, tipo: user.tipo },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login exitoso", token, user });
  } catch (error) {
    console.error("❌ Error en el login:", error);
    res.status(500).json({ message: "Error en el login", error });
  }
});


app.get("/usuario/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);
    
    if (usuario.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(usuario.rows[0]); // Enviar el usuario encontrado
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});


app.delete("/usuario/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    const resultado = await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);

    if (resultado.rowCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ mensaje: "Usuario eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


/*
// **3. Ruta protegida de prueba**
app.get("/perfil", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];         POSIBLE ELIMINAR

  if (!token) {
    return res.status(403).json({ message: "Acceso denegado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ message: "Acceso permitido", user: decoded });
  } catch (error) {
    res.status(401).json({ message: "Token inválido" });
  }
}); */



// Obtener tareas ###################################
app.get("/tareas/:usuario_id", async (req, res) => {
  const { usuario_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM tareas 
       WHERE usuario_id = $1 
       ORDER BY 
         CASE 
           WHEN prioridad = 'alta' THEN 1 
           WHEN prioridad = 'media' THEN 2 
           WHEN prioridad = 'baja' THEN 3 
           ELSE 0 
         END ASC, 
         fecha_limite ASC`,
      [usuario_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.json([]);
  }
});

// Crear tarea ######################################
app.post("/tareas/:usuario_id", async (req, res) => {
  const { titulo, descripcion, fecha_limite, prioridad, usuario_id } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO tareas (titulo, descripcion, fecha_limite, prioridad, usuario_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [titulo, descripcion, fecha_limite, prioridad, usuario_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Editar tarea ########################################
app.put("/tareas/:id", async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, fecha_limite, prioridad } = req.body;
  try {
    const result = await pool.query(
      "UPDATE tareas SET titulo=$1, descripcion=$2, fecha_limite=$3, prioridad=$4 WHERE id=$5 RETURNING *",
      [titulo, descripcion, fecha_limite, prioridad, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar tarea #########################################
app.delete("/tareas/:id", async (req, res) => {
  const { id } = req.params;
  const { usuario_id } = req.body;
  try {
    await pool.query("DELETE FROM tareas WHERE id = $1 AND usuario_id = $2 RETURNING *", [id, usuario_id]);
    res.json({ message: "Tarea eliminada" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});