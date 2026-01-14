const app = require('./server_sqlite');

// Render u otros servicios de despliegue pasan el puerto en process.env.PORT
// En desarrollo local, usamos 3000 por defecto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
