const { Sequelize, DataTypes } = require('sequelize');

// Toma la URL de la base de datos desde la nube
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // Fundamental para que Render/Railway acepte la conexión
        }
    }
});

const Socio = sequelize.define('Socio', {
    nombre: { type: DataTypes.STRING, allowNull: false },
    telefono: { type: DataTypes.STRING, allowNull: false },
    fechaPago: { type: DataTypes.DATEONLY, allowNull: false },
    fechaVencimiento: { type: DataTypes.DATEONLY, allowNull: false },
    metodoPago: { type: DataTypes.STRING, defaultValue: 'Efectivo' },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const Pago = sequelize.define('Pago', {
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    metodoPago: { type: DataTypes.STRING, allowNull: false },
    monto: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 }
});

Socio.hasMany(Pago);
Pago.belongsTo(Socio);

module.exports = { sequelize, Socio, Pago };