const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config();

// Crear servidor
const server = express();

// Middlewares
server.use(cors());
server.use(express.json({ limit: "25mb" }));

// Puerto y arranque del servidor
const port = 4000;
server.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});

// Función para conectar a la base de datos
async function getConnection() {
  const config = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  };

  const connection = await mysql.createConnection(config);
  await connection.connect();
  return connection;
}

// --- ENDPOINTS CRUD DE FRASES ---

// POST /frases - Crear una nueva frase
server.post("/frases", async (req, res) => {
  const { texto, marca_tiempo, descripcion, personajes_id } = req.body;

  if (!texto) {
    return res.status(400).json({
      success: false,
      error: "El campo 'texto' es obligatorio",
    });
  }

  try {
    const conn = await getConnection();

    const sql = `
      INSERT INTO frases (texto, marca_tiempo, descripcion, personajes_id)
      VALUES (?, ?, ?, ?);
    `;

    const [result] = await conn.execute(sql, [
      texto,
      marca_tiempo || null,
      descripcion || null,
      personajes_id || null,
    ]);

    await conn.end();

    res.status(201).json({
      success: true,
      frase: {
        id: result.insertId,
        texto,
        marca_tiempo,
        descripcion,
        personajes_id,
      },
    });
  } catch (error) {
    console.error("Error en POST /frases:", error);
    res.status(500).json({ success: false, error: "Error al crear la frase" });
  }
});

// GET /frases - Listar todas las frases con info de personaje
server.get("/frases", async (req, res) => {
  try {
    const conn = await getConnection();

    const sql = `
      SELECT f.id, f.texto, f.marca_tiempo, f.descripcion,
             p.nombre AS personaje_nombre
      FROM frases f
      LEFT JOIN personajes p ON f.personajes_id = p.id
    `;

    const [results] = await conn.query(sql);

    await conn.end();

    res.json(results);
  } catch (error) {
    console.error("Error en GET /frases:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al obtener las frases" });
  }
});

// GET /frases/:id - Obtener frase por ID
server.get("/frases/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const conn = await getConnection();

    const sql = `
      SELECT f.id, f.texto, f.marca_tiempo, f.descripcion,
             p.nombre AS personaje_nombre
      FROM frases f
      LEFT JOIN personajes p ON f.personajes_id = p.id
      WHERE f.id = ?;
    `;

    const [rows] = await conn.execute(sql, [id]);

    await conn.end();

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Frase no encontrada" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error en GET /frases/:id:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al obtener la frase" });
  }
});

// PUT /frases/:id - Actualizar frase por ID
server.put("/frases/:id", async (req, res) => {
  const { id } = req.params;
  const { texto, marca_tiempo, descripcion, personajes_id } = req.body;

  if (!texto) {
    return res
      .status(400)
      .json({ success: false, error: "El campo 'texto' es obligatorio" });
  }

  try {
    const conn = await getConnection();

    // Verificar que la frase existe
    const [exist] = await conn.execute("SELECT id FROM frases WHERE id = ?", [
      id,
    ]);
    if (exist.length === 0) {
      await conn.end();
      return res
        .status(404)
        .json({ success: false, error: "Frase no encontrada" });
    }

    const sql = `
      UPDATE frases
      SET texto = ?, marca_tiempo = ?, descripcion = ?, personajes_id = ?
      WHERE id = ?;
    `;

    await conn.execute(sql, [
      texto,
      marca_tiempo || null,
      descripcion || null,
      personajes_id || null,
      id,
    ]);

    await conn.end();

    res.json({
      success: true,
      frase: {
        id,
        texto,
        marca_tiempo,
        descripcion,
        personajes_id,
      },
    });
  } catch (error) {
    console.error("Error en PUT /frases/:id:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al actualizar la frase" });
  }
});

// DELETE /frases/:id - Eliminar frase por ID
server.delete("/frases/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const conn = await getConnection();

    // Verificar que existe la frase
    const [exist] = await conn.execute("SELECT id FROM frases WHERE id = ?", [
      id,
    ]);
    if (exist.length === 0) {
      await conn.end();
      return res
        .status(404)
        .json({ success: false, error: "Frase no encontrada" });
    }

    await conn.execute("DELETE FROM frases WHERE id = ?", [id]);

    await conn.end();

    res.json({ success: true, mensaje: "Frase eliminada correctamente" });
  } catch (error) {
    console.error("Error en DELETE /frases/:id:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al eliminar la frase" });
  }
});
// GET /frases/personaje/:personaje_id - Obtener frases de un personaje específico
server.get("/frases/personaje/:personaje_id", async (req, res) => {
  const { personaje_id } = req.params;
  try {
    const conn = await getConnection();

    const sql = `
      SELECT f.id, f.texto, f.marca_tiempo, f.descripcion
      FROM frases f
      WHERE f.personajes_id = ?;
    `;

    const [results] = await conn.execute(sql, [personaje_id]);
    await conn.end();

    res.json({ success: true, frases: results });
  } catch (error) {
    console.error("Error en GET /frases/personaje/:personaje_id:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al obtener las frases" });
  }
});

// GET /frases/capitulo/:capitulo_id - Obtener frases de un capítulo específico
server.get("/frases/capitulo/:capitulo_id", async (req, res) => {
  const { capitulo_id } = req.params;
  try {
    const conn = await getConnection();

    const sql = `
      SELECT f.id, f.texto, f.marca_tiempo, f.descripcion
      FROM frases f
      WHERE f.capitulos_id = ?;
    `;

    const [results] = await conn.execute(sql, [capitulo_id]);
    await conn.end();

    res.json({ success: true, frases: results });
  } catch (error) {
    console.error("Error en GET /frases/capitulo/:capitulo_id:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al obtener las frases" });
  }
});

// GET /personajes - Listar todos los personajes
server.get("/personajes", async (req, res) => {
  try {
    const conn = await getConnection();

    const sql = `SELECT * FROM personajes;`;
    const [results] = await conn.query(sql);

    await conn.end();

    res.json({ success: true, personajes: results });
  } catch (error) {
    console.error("Error en GET /personajes:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al obtener los personajes" });
  }
});

// GET /capitulos - Listar todos los capítulos
server.get("/capitulos", async (req, res) => {
  try {
    const conn = await getConnection();

    const sql = `SELECT * FROM capitulos;`;
    const [results] = await conn.query(sql);

    await conn.end();

    res.json({ success: true, capitulos: results });
  } catch (error) {
    console.error("Error en GET /capitulos:", error);
    res
      .status(500)
      .json({ success: false, error: "Error al obtener los capítulos" });
  }
});

// Manejo de rutas no existentes
server.use((req, res) => {
  res.status(404).json({ success: false, error: "Ruta no encontrada" });
});
