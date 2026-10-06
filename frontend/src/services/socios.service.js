import axios from 'axios';

// Toma la URL de Vercel, o usa localhost por defecto si estás en tu PC
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/socios`;

export const sociosService = {
    obtenerTodos: async (traerInactivos = false) => {
        const url = traerInactivos ? `${API_URL}?inactivos=true` : API_URL;
        const response = await axios.get(url);
        return response.data;
    },
    crear: async (datos) => {
        const response = await axios.post(API_URL, datos);
        return response.data;
    },
    // Baja lógica (ocultar)
    eliminar: async (id) => {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    },
    // Borrado definitivo de la base de datos
    eliminarDefinitivo: async (id) => {
        const response = await axios.delete(`${API_URL}/${id}/definitivo`);
        return response.data;
    },
    actualizar: async (id, datos) => {
        const response = await axios.put(`${API_URL}/${id}`, datos);
        return response.data;
    },
    actualizarPago: async (idPago, datos) => {
        const response = await axios.put(`${API_URL}/pagos/${idPago}`, datos);
        return response.data;
    },
    reactivar: async (id) => {
        const response = await axios.put(`${API_URL}/${id}/reactivar`);
        return response.data;
    },
    renovar: async (id, datosRenovacion) => {
        const response = await axios.post(`${API_URL}/${id}/renovar`, datosRenovacion);
        return response.data;
    },
    obtenerEstadisticas: async () => {
        const response = await axios.get(`${API_URL}/estadisticas`);
        return response.data;
    }
};