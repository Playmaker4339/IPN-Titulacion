const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();

// Credenciales fijas para el administrador (Se pueden cambiar según necesidad)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// Permitir recibir JSON en el body
app.use(express.json());

const dbPath = path.join(__dirname, 'CesarBasedeDatos.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Error abriendo la base de datos SQLite:', err.message);
    process.exit(1);
  }
  console.log('Conectado a la base de datos SQLite:', dbPath);
});

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(__dirname));

// Página de inicio: selección de perfil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'seleccion_perfil.html'));
});

// Login sencillo de administrador
app.post('/login-admin', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
  }

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return res.json({ ok: true });
  }

  return res.status(401).json({ error: 'Credenciales inválidas' });
});

// API: leer datos de la tabla "solicitudes"
app.get('/api/alumnos', (req, res) => {
  const q = (req.query.query || '').trim();

  let sql = `
    SELECT 
      boleta,
      apellidoPat,
      apellidoMat,
      nombre
    FROM solicitudes
  `;
  const params = [];

  if (q) {
    sql += `
      WHERE boleta LIKE ?
         OR (apellidoPat || ' ' || apellidoMat || ' ' || nombre) LIKE ?
    `;
    const like = `%${q}%`;
    params.push(like, like);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Error consultando tabla solicitudes:', err.message);
      return res.status(500).json({ error: 'Error al consultar solicitudes' });
    }

    const alumnos = rows.map(r => ({
      matricula: r.boleta,
      nombre: `${r.apellidoPat} ${r.apellidoMat} ${r.nombre}`
    }));

    res.json(alumnos);
  });
});

// RUTA PARA GUARDAR SOLICITUD (usada por el formulario y/o app.js)
app.post('/guardar-solicitud', (req, res) => {
  const {
    boleta,
    apellidoPat,
    apellidoMat,
    nombre,
    carrera,
    generacion,
    modalidad,
    grupo,
    correo,
    telefono
  } = req.body;

  // Validación mínima
  if (!boleta || !apellidoPat || !apellidoMat || !nombre) {
    return res.status(400).json({ error: 'Datos obligatorios faltantes' });
  }

  const sqlInsert = `
    INSERT INTO solicitudes (
      boleta,
      apellidoPat,
      apellidoMat,
      nombre,
      carrera,
      generacion,
      modalidad,
      grupo,
      correo,
      telefono
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    boleta,
    apellidoPat,
    apellidoMat,
    nombre,
    carrera,
    generacion,
    modalidad,
    grupo,
    correo,
    telefono
  ];

  db.run(sqlInsert, params, function (err) {
    if (err) {
      console.error('Error insertando en solicitudes:', err.message);
      return res.status(500).json({ error: 'Error al guardar la solicitud' });
    }
    // this.lastID contiene el ID del registro insertado (si hay PK autoincremental)
    res.status(201).json({ ok: true, id: this.lastID });
  });
});

// API: obtener datos completos de un alumno por boleta
app.get('/api/alumnos/:boleta', (req, res) => {
  const { boleta } = req.params;

  const sql = `
    SELECT 
      boleta,
      apellidoPat,
      apellidoMat,
      nombre,
      carrera,
      generacion,
      modalidad,
      'Pendiente' AS estatus
    FROM solicitudes
    WHERE boleta = ?
  `;

  db.get(sql, [boleta], (err, row) => {
    if (err) {
      console.error('Error consultando alumno por boleta:', err.message);
      return res.status(500).json({ error: 'Error al consultar el alumno' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }

    const alumno = {
      boleta: row.boleta,
      nombre: row.nombre,
      apellidoPaterno: row.apellidoPat,
      apellidoMaterno: row.apellidoMat,
      programa: row.carrera,
      anioIngreso: row.generacion,
      modalidad: row.modalidad,
      estatus: row.estatus
    };

    res.json(alumno);
  });
});

// API: actualizar datos de un alumno por boleta
app.put('/api/alumnos/:boleta', (req, res) => {
  const { boleta } = req.params; // boleta original

  const {
    boleta: nuevaBoleta,
    nombre,
    apellidoPaterno,
    apellidoMaterno,
    programa,
    anioIngreso,
    modalidad

  } = req.body || {};

  if (!nombre || !apellidoPaterno || !apellidoMaterno || !programa || !anioIngreso || !modalidad) {
    return res.status(400).json({ error: 'Faltan datos obligatorios para actualizar el alumno' });
  }

  const sqlUpdate = `
    UPDATE solicitudes
    SET
      boleta = ?,
      apellidoPat = ?,
      apellidoMat = ?,
      nombre = ?,
      carrera = ?,
      generacion = ?,
      modalidad = ?
    WHERE boleta = ?
  `;

  const params = [
    nuevaBoleta || boleta,
    apellidoPaterno,
    apellidoMaterno,
    nombre,
    programa,
    anioIngreso,
    modalidad,
    boleta
  ];

  db.run(sqlUpdate, params, function (err) {
    if (err) {
      console.error('Error actualizando alumno:', err.message);
      return res.status(500).json({ error: 'Error al actualizar el alumno' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado para actualizar' });
    }

    return res.json({ ok: true, cambios: this.changes, boleta: nuevaBoleta || boleta });
  });
});

module.exports = app;
