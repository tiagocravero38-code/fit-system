import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
// import keycloak from "./keycloak"; // 1. Comentamos la importación temporalmente

const root = ReactDOM.createRoot(document.getElementById("root"));

// 2. Renderizamos la app directamente, sin pasar por la validación
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/* 3. Dejamos comentada toda la lógica de Keycloak para usarla más adelante
keycloak
  .init({
    onLoad: "login-required", 
    checkLoginIframe: false, 
  })
  .then((authenticated) => {
    if (authenticated) {
      root.render(<App />);
    } else {
      window.location.reload();
    }
  })
  .catch((error) => {
    console.error("Authentication Failed", error);
    root.render(
      <div className="container mt-5 text-center text-danger">
        <h1>⚠️ Error de Conexión</h1>
        <p>No pudimos conectar con el Servidor de Seguridad (Keycloak).</p>
      </div>
    );
  });
  */