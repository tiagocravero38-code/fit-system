const { Socio, Pago } = require('../db');
const { Op } = require('sequelize');

// 1. Obtener Socios (Con Historial y Pagos ordenados)
exports.obtenerSocios = async (req, res) => {
    try {
        const mostrarInactivos = req.query.inactivos === 'true';
        const socios = await Socio.findAll({
            where: { activo: !mostrarInactivos },
            include: [{
                model: Pago,
                separate: true,
                order: [['fecha', 'DESC']]
            }],
            order: [['fechaVencimiento', 'ASC']]
        });
        res.json(socios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Crear Socio (Con Monto Inicial)
exports.crearSocio = async (req, res) => {
    try {
        const { nombre, telefono, fechaPago, metodoPago, monto } = req.body;

        const fechaP = new Date(fechaPago);
        const fechaVenc = new Date(fechaP);
        fechaVenc.setMonth(fechaVenc.getMonth() + 1);

        const nuevoSocio = await Socio.create({
            nombre, telefono, fechaPago, metodoPago,
            fechaVencimiento: fechaVenc.toISOString().split('T')[0],
            activo: true
        });

        // Guardamos el pago con su monto
        await Pago.create({
            fecha: fechaPago,
            metodoPago: metodoPago,
            monto: parseFloat(monto) || 0,
            SocioId: nuevoSocio.id
        });

        res.json(nuevoSocio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Renovar Cuota (Con Monto)
exports.renovarCuota = async (req, res) => {
    try {
        const { id } = req.params;
        const { fechaPago, metodoPago, monto } = req.body;

        const fechaP = new Date(fechaPago);
        const nuevaFechaVenc = new Date(fechaP);
        nuevaFechaVenc.setMonth(nuevaFechaVenc.getMonth() + 1);

        await Socio.update({
            fechaPago: fechaPago,
            metodoPago: metodoPago,
            fechaVencimiento: nuevaFechaVenc.toISOString().split('T')[0]
        }, { where: { id } });

        // Guardamos el historial con monto
        await Pago.create({
            fecha: fechaPago,
            metodoPago: metodoPago,
            monto: parseFloat(monto) || 0,
            SocioId: id
        });

        res.json({ message: 'Renovado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Estadísticas (Sumando dinero)
exports.obtenerEstadisticas = async (req, res) => {
    try {
        const pagos = await Pago.findAll();
        const estadisticas = { mensuales: {}, anuales: {} };

        pagos.forEach(pago => {
            const fecha = pago.fecha;
            const mes = fecha.substring(0, 7);
            const anio = fecha.substring(0, 4);
            const metodo = pago.metodoPago;
            const monto = pago.monto || 0;

            // Inicializar Mes
            if (!estadisticas.mensuales[mes]) estadisticas.mensuales[mes] = { Total: 0, Efectivo: 0, Transferencia: 0, Tarjeta: 0 };
            estadisticas.mensuales[mes][metodo] += monto;
            estadisticas.mensuales[mes].Total += monto;

            // Inicializar Año
            if (!estadisticas.anuales[anio]) estadisticas.anuales[anio] = { Total: 0, Efectivo: 0, Transferencia: 0, Tarjeta: 0 };
            estadisticas.anuales[anio][metodo] += monto;
            estadisticas.anuales[anio].Total += monto;
        });

        res.json(estadisticas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. Actualizar un Pago específico (Edición de montos/fechas)
exports.actualizarPago = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha, metodoPago, monto } = req.body;

        await Pago.update({
            fecha,
            metodoPago,
            monto: parseFloat(monto)
        }, { where: { id } });

        res.json({ message: 'Pago actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. Actualizar Datos del Socio (Nombre y Teléfono) - ¡ESTA FALTABA!
exports.actualizarSocio = async (req, res) => {
    try {
        const { id } = req.params;
        // req.body trae { nombre: '...', telefono: '...' }
        await Socio.update(req.body, { where: { id } });
        res.json({ message: 'Datos del socio actualizados' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 7. Baja Lógica
exports.bajaLogica = async (req, res) => {
    try {
        const { id } = req.params;
        await Socio.update({ activo: false }, { where: { id } });
        res.json({ message: 'Baja' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 8. Reactivar Socio
exports.reactivarSocio = async (req, res) => {
    try {
        const { id } = req.params;
        await Socio.update({ activo: true }, { where: { id } });
        res.json({ message: 'Alta' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 9. Eliminar Socio Definitivamente
exports.eliminarSocio = async (req, res) => {
    try {
        const { id } = req.params;
        
        // El "force: true" obliga a la base de datos a borrar el registro para siempre
        await Socio.destroy({ 
            where: { id },
            force: true 
        });

        res.json({ message: 'Socio eliminado definitivamente de la base de datos' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};