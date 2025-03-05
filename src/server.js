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



/*
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
*/


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
app.post("/register", async (req, res) => {
  const { nombre, apellido, edad, tipo, contraseña } = req.body;

  if (!nombre || !apellido || !edad || !tipo || !contraseña) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  const hashedPassword = await bcrypt.hash(contraseña, 10);

  try {
    const result = await pool.query(
      "INSERT INTO usuarios (nombre, apellido, edad, tipo, contraseña) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nombre, apellido, edad, tipo, hashedPassword]
    );
    res.json({ message: "Usuario registrado con éxito", user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar usuario", error });
  }
});


//Inicio de sesión *********************************************
app.post("/login", async (req, res) => {
  const { email, contraseña } = req.body;

  console.log("📩 Email recibido:", email); //temp
  console.log("🔑 Contraseña recibida:", contraseña); //temp

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

    console.log("🔍 Comparación de contraseñas:", passwordMatch); //temp

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



// **3. Ruta protegida de prueba**
app.get("/perfil", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Acceso denegado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ message: "Acceso permitido", user: decoded });
  } catch (error) {
    res.status(401).json({ message: "Token inválido" });
  }
});


app.get('/tareas', async (req, res) => {
  try {
      const tareas = await pool.query(`
          SELECT * FROM tareas 
          ORDER BY 
              CASE prioridad 
                  WHEN 'Alta' THEN 1
                  WHEN 'Media' THEN 2
                  WHEN 'Baja' THEN 3
              END,
              fecha_limite ASC
      `);
      res.json(tareas.rows);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});