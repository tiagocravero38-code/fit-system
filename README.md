# 🏋️ GymSystem - Sistema de Gestión para Gimnasios

GymSystem es una aplicación web full-stack diseñada para simplificar la administración de socios de un gimnasio. Permite llevar un control exacto de las membresías, registrar pagos, enviar recordatorios por WhatsApp y visualizar estadísticas financieras en tiempo real.

## ✨ Características Principales

* **Panel de Control (Dashboard):** Visualización rápida del estado de todos los socios (al día, por vencer, inactivos).
* **Gestión de Socios:** Alta, edición y ficha detallada de cada cliente.
* **Control de Pagos:** Registro de renovaciones con detalle de montos y métodos de pago (Efectivo, Transferencia, Tarjeta). Edición del historial de pagos.
* **Alertas por WhatsApp:** Integración directa para enviar recordatorios de vencimiento a un clic.
* **Papelera y Bajas:** Sistema de baja lógica (ocultar socios inactivos) y borrado definitivo de la base de datos (con limpieza de historial de pagos).
* **Estadísticas Financieras:** Gráficos y reportes de recaudación mensual y anual filtrados por método de pago.

## 🛠️ Tecnologías Utilizadas

### Frontend
* **React.js** (con Vite)
* **React Router Dom** (Navegación)
* **React Hook Form** (Manejo de formularios)
* **Axios** (Peticiones HTTP)
* **Bootstrap** (Diseño y UI)

### Backend & Base de Datos
* **Node.js & Express** (Servidor API REST)
* **Sequelize** (ORM)
* **PostgreSQL** (Base de datos alojada en Neon)

### Despliegue
* **Frontend:** Vercel
* **Backend:** Render

---

## 🚀 Instalación y Configuración Local

Para correr este proyecto en tu computadora, necesitás tener instalado [Node.js](https://nodejs.org/) y Git.

### 1. Clonar el repositorio
```bash
git clone [https://github.com/tu-usuario/gym-system.git](https://github.com/tu-usuario/gym-system.git)
cd gym-system
