import { apiClient } from "./apiClient";

export const getLoans = () => apiClient.get("/api/sports/loans");

export const createLoan = ({ itemId, cantidad, canchaOActividad }) =>
    apiClient.post("/api/sports/loans", { itemId, cantidad, canchaOActividad });

// Lo usara el panel de admin
export const returnLoan = (id, { estadoDevolucion, notas }) =>
    apiClient.patch(`/api/sports/loans/${id}/return`, { estadoDevolucion, notas });