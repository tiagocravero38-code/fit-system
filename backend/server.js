const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/db'); 

// Importamos el archivo de RUTAS
const sociosRoutes = require('./src/routes/socios.routes');

const app = express();

// 1. PUERTO DINÁMICO: Toma el de la nube o usa 3000 en tu PC
const PORT = process.env.PORT || 3000;

// 2. CONFIGURACIÓN DE CORS: Permite que tu frontend se comunique con esta API
const origenesPermitidos = [
    'http://localhost:5173', // Para cuando desarrollás en tu PC
    process.env.FRONTEND_URL // Para cuando lo subas a Vercel
];

app.use(cors({
    origin: (origin, callback) => {
        // Permite peticiones sin origin (como Postman) o si coincide con la lista
        if (!origin || origenesPermitidos.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('No permitido por CORS'));
    }
}));

app.use(express.json());

// --- RUTAS ---
app.use('/api/socios', sociosRoutes);

// Endpoint de prueba rápido para saber si la API está viva en la nube
app.get('/', (req, res) => {
    res.send('API del Gimnasio funcionando correctamente 🏋️‍♂️');
});

// Iniciar servidor y sincronizar base de datos
app.listen(PORT, async () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);

    try {
        await sequelize.sync({ alter: true });
        console.log("Base de datos sincronizada");
    } catch (error) {
        console.error("Error al conectar con la base de datos:", error);
    }
});