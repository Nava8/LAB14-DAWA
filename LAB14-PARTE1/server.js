const express = require('express');
const multer = require('multer');
const app = express();
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    // Verificar el tipo de archivo permitido (solo JPEG y PNG)
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true); // Aceptar el archivo
    } else {
      cb(new Error('Solo se permiten archivos de imagen en formato JPEG o PNG.'), false); // Rechazar el archivo
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // Tamaño máximo del archivo en bytes (5 MB)
  }
});

app.use(express.static(__dirname));

app.post('/upload', upload.array('files', 10), (req, res, next) => {
  if (req.files && req.files.length > 0) {
    // Los archivos se cargaron correctamente
    const fileInfos = req.files.map((file) => ({
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.send(fileInfos);
  } else {
    // No se cargaron archivos o se produjo un error de validación
    next(new Error('Se produjo un error al cargar los archivos.'));
  }
});

app.use((err, req, res, next) => {
  res.status(400).send(err.message);
});

app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});
