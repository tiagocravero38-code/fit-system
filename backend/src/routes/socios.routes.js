const express = require('express');
const router = express.Router();
const sociosController = require('../controllers/socios.controller');

// --- ⚠️ IMPORTANTE: EL ORDEN IMPORTA ---
// Las rutas específicas (como estadísticas o pagos) deben ir ARRIBA.
// Las rutas con :id (como editar socio) deben ir ABAJO.

// 1. Estadísticas (PRIMERA, para que no se confunda con un ID)
router.get('/estadisticas', sociosController.obtenerEstadisticas);

// 2. Editar PAGOS (Específica)
router.put('/pagos/:id', sociosController.actualizarPago);

// 3. Crear Socio (General)
router.post('/', sociosController.crearSocio);

// 4. Obtener todos los socios (General)
router.get('/', sociosController.obtenerSocios);


// --- RUTAS CON PARÁMETROS :id (VAN AL FINAL) ---

// 5. Renovar Cuota
router.post('/:id/renovar', sociosController.renovarCuota);

// 6. Reactivar
router.put('/:id/reactivar', sociosController.reactivarSocio);

// 7. EDITAR SOCIO (Nombre y Teléfono)
router.put('/:id', sociosController.actualizarSocio);

// 8. Borrar
router.delete('/:id', sociosController.bajaLogica);

// 9. Eliminar definitivamente
router.delete('/:id/definitivo', sociosController.eliminarSocio);

module.exports = router;