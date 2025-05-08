require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ⬇️ Middleware de actividad: ACTUALIZA LA ACTIVIDAD DEL USUARIO
app.use(async (req, res, next) => {
  const userId =
    req.body.id_usuario || req.query.id_usuario || req.body.usuario_id;

  if (userId) {
    try {
      await pool.query(
        "UPDATE usuarios SET ultima_actividad = NOW() WHERE id = $1",
        [userId]
      );
    } catch (err) {
      console.error("Error actualizando actividad:", err);
    }
  }

  next();
});

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
// #USUARIO------------------------------------------------------------------------

//Registrar un nuevo usuario*******************************************************
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

    res.json(usuario.rows[0]);
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




// #FUNCIONES TAREAS---------------------------------------------------------------
// Obtener tareas #################################################################
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
  const { titulo, descripcion, fecha_limite, prioridad, usuario_id, estado, hora_notificacion, anticipacion } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO tareas (titulo, descripcion, fecha_limite, prioridad, usuario_id, estado, hora_notificacion, anticipacion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [titulo, descripcion, fecha_limite, prioridad, usuario_id, estado ?? 0, hora_notificacion ?? null, anticipacion ?? null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Editar tarea ########################################
app.put("/tareas/:id", async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, fecha_limite, prioridad, estado, hora_notificacion, anticipacion } = req.body;
  try {
    const result = await pool.query(
      "UPDATE tareas SET titulo=$1, descripcion=$2, fecha_limite=$3, prioridad=$4, estado=$5, hora_notificacion=$6, anticipacion=$7 WHERE id=$8 RETURNING *",
      [titulo, descripcion, fecha_limite, prioridad, estado, hora_notificacion, anticipacion, id]
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



// Finalizar tarea tarea #########################################
app.put("/tareas/:id/finalizar", async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    await pool.query("UPDATE tareas SET estado = $1 WHERE id = $2", [estado, id]);
    res.json({ mensaje: "Tarea finalizada correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar el estado de la tarea" });
  }
});



// #FUNCIONES DASHBOARD-------------------------------------------------------------
// Contar datos ####################################################################
app.get("/dashboard/estadisticas", async (req, res) => {
  try {
    const totalUsuarios = await pool.query(`SELECT COUNT(*) FROM usuarios`);
    const usuariosActivos = await pool.query(`SELECT COUNT(*) FROM usuarios WHERE ultima_actividad >= NOW() - INTERVAL '5 minutes'`);
    const usuariosNuevos = await pool.query(`SELECT COUNT(*) FROM usuarios WHERE fecha_registro >= NOW() - INTERVAL '7 days'`);
    const totalFeedback = await pool.query(`SELECT COUNT(*) FROM feedback`);

    res.json({
      totalUsuarios: parseInt(totalUsuarios.rows[0].count),
      usuariosActivos: parseInt(usuariosActivos.rows[0].count),
      usuariosNuevos: parseInt(usuariosNuevos.rows[0].count),
      feedback: parseInt(totalFeedback.rows[0].count),
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//Guardar comentarios
app.post("/feedback", async (req, res) => {
  const { estrellas, comentario, usuario_id } = req.body;

  if (!estrellas || !comentario || !usuario_id) {
    return res.status(400).json({ error: "Campos incompletos" });
  }

  try {
    const existe = await pool.query(
      "SELECT 1 FROM feedback WHERE id_usuario = $1",
      [usuario_id]
    );

    if (existe.rowCount > 0) {
      return res.status(409).json({ error: "Ya has enviado un feedback" });
    }

    const nuevoFeedback = await pool.query(
      "INSERT INTO feedback (id_usuario, calificacion, comentario) VALUES ($1, $2, $3) RETURNING *",
      [usuario_id, estrellas, comentario]
    );
    res.status(201).json(nuevoFeedback.rows[0]);
  } catch (err) {
    console.error("Error al guardar feedback:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
});

//Verificar si el usuario ya envió feedback
app.get("/feedback/:id_usuario", async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const resultado = await pool.query(
      "SELECT 1 FROM feedback WHERE id_usuario = $1",
      [id_usuario]
    );

    if (resultado.rowCount > 0) {
      return res.json({ yaComento: true });
    } else {
      return res.json({ yaComento: false });
    }
  } catch (err) {
    console.error("Error al verificar feedback:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
});




app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});