import { useEffect, useState } from "react";
import { sociosService } from "../services/socios.service";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

function Dashboard() {
  const [socios, setSocios] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [orden, setOrden] = useState("vencimiento");
  const [paginaActual, setPaginaActual] = useState(1);
  const [verInactivos, setVerInactivos] = useState(false);

  // Estados Modales
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);
  const [socioARenovar, setSocioARenovar] = useState(null);

  // Estados Edición Socio
  const [editandoSocio, setEditandoSocio] = useState(false);
  const [datosEdicionSocio, setDatosEdicionSocio] = useState({
    nombre: "",
    telefono: "",
  });

  // Estados Edición Pago (NUEVO)
  const [pagoEditandoId, setPagoEditandoId] = useState(null); // ID del pago que se está editando
  const [datosEdicionPago, setDatosEdicionPago] = useState({}); // Datos temporales del pago

  const { register, handleSubmit, reset } = useForm();
  const ELEMENTOS_POR_PAGINA = 5;

  useEffect(() => {
    cargarSocios();
  }, [verInactivos]);

  const cargarSocios = async () => {
    try {
      const data = await sociosService.obtenerTodos(verInactivos);
      setSocios(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Dar de baja?")) {
      await sociosService.eliminar(id);
      cargarSocios();
    }
  };
  const handleReactivar = async (id) => {
    if (window.confirm("¿Reactivar?")) {
      await sociosService.reactivar(id);
      cargarSocios();
    }
    const handleReactivar = async (id) => {
    if (window.confirm("¿Reactivar?")) {
      await sociosService.reactivar(id);
      cargarSocios();
    }
  };

  // --- NUEVA FUNCIÓN: ELIMINAR DEFINITIVAMENTE ---
  const handleEliminarDefinitivo = async (id, nombre) => {
    const confirmacion = window.confirm(`⚠️ ¿Estás seguro de eliminar a ${nombre} PARA SIEMPRE?\n\nEsta acción NO se puede deshacer y se borrarán todos sus registros.`);
    
    if (confirmacion) {
      try {
        await sociosService.eliminar(id);
        cargarSocios();
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Hubo un error al intentar eliminar al socio.");
      }
    }
  };
  };

  const onRenovarSubmit = async (data) => {
    if (!socioARenovar) return;
    try {
      await sociosService.renovar(socioARenovar.id, data);
      alert(
        `✅ Registrado pago de $${data.monto} para ${socioARenovar.nombre}`,
      );
      setSocioARenovar(null);
      cargarSocios();
    } catch (error) {
      alert("Error al renovar");
    }
  };

  // --- GUARDAR EDICIÓN SOCIO (Nombre/Teléfono) ---
  const guardarEdicionSocio = async () => {
    try {
      await sociosService.actualizar(socioSeleccionado.id, datosEdicionSocio);
      alert("✅ Datos de socio actualizados");
      setEditandoSocio(false);
      // Actualizar localmente
      const socioActualizado = { ...socioSeleccionado, ...datosEdicionSocio };
      setSocioSeleccionado(socioActualizado);
      cargarSocios();
    } catch (error) {
      alert("❌ Error al actualizar socio");
    }
  };

  // --- LOGICA EDICIÓN PAGO ---
  const activarEdicionPago = (pago) => {
    setPagoEditandoId(pago.id);
    setDatosEdicionPago({ ...pago });
  };

  const cancelarEdicionPago = () => {
    setPagoEditandoId(null);
    setDatosEdicionPago({});
  };

  const guardarEdicionPago = async () => {
    try {
      await sociosService.actualizarPago(pagoEditandoId, datosEdicionPago);
      alert("✅ Pago corregido");

      // Actualizar la lista de pagos en memoria sin recargar todo
      const nuevosPagos = socioSeleccionado.Pagos.map((p) =>
        p.id === pagoEditandoId ? { ...p, ...datosEdicionPago } : p,
      );

      // Ordenar de nuevo por fecha (opcional, pero queda mejor)
      nuevosPagos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      setSocioSeleccionado({ ...socioSeleccionado, Pagos: nuevosPagos });
      setPagoEditandoId(null);
      cargarSocios(); // Para que impacte en la tabla principal si cambió algo critico
    } catch (error) {
      alert("❌ Error al corregir pago");
    }
  };
  // ---------------------------

  const abrirFicha = (socio) => {
    setSocioSeleccionado(socio);
    setEditandoSocio(false);
    setPagoEditandoId(null);
    setDatosEdicionSocio({ nombre: socio.nombre, telefono: socio.telefono });
  };

  const abrirRenovacion = (socio) => {
    setSocioARenovar(socio);
    reset({
      fechaPago: new Date().toISOString().split("T")[0],
      metodoPago: "Efectivo",
      monto: 15000,
    });
  };

  const formatearFecha = (f) => (f ? f.split("-").reverse().join("/") : "-");

  // Filtros y Render
  const sociosFiltrados = socios.filter((s) =>
    s.nombre.toLowerCase().includes(filtro.toLowerCase()),
  );
  const sociosOrdenados = [...sociosFiltrados].sort((a, b) =>
    orden === "vencimiento"
      ? new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento)
      : a.nombre.localeCompare(b.nombre),
  );
  const sociosPaginados = sociosOrdenados.slice(
    (paginaActual - 1) * ELEMENTOS_POR_PAGINA,
    paginaActual * ELEMENTOS_POR_PAGINA,
  );
  const totalPaginas = Math.ceil(sociosOrdenados.length / ELEMENTOS_POR_PAGINA);

  const enviarWhatsApp = (socio) => {
    let tel = socio.telefono.replace(/[^0-9]/g, "");
    if (tel.length === 10) tel = `549${tel}`;
    window.open(
      `https://wa.me/${tel}?text=${encodeURIComponent(`Hola ${socio.nombre}, te recordamos que tu cuota vence el ${formatearFecha(socio.fechaVencimiento)}`)}`,
      "_blank",
    );
  };

  return (
    <div className="container mt-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="text-primary fw-bold mb-0">
          {verInactivos ? "🗑️ Papelera" : "🏋️ Panel de Control"}
        </h2>
        <div className="d-flex gap-2 align-items-center">
          <div className="form-check form-switch me-3">
            <input
              className="form-check-input"
              type="checkbox"
              checked={verInactivos}
              onChange={(e) => setVerInactivos(e.target.checked)}
            />
            <label className="form-check-label fw-bold text-muted">
              {verInactivos ? "Volver" : "Ver Bajas"}
            </label>
          </div>
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Buscar..."
            value={filtro}
            onChange={(e) => {
              setFiltro(e.target.value);
              setPaginaActual(1);
            }}
          />
          {!verInactivos && (
            <Link to="/registro" className="btn btn-success text-nowrap">
              + Nuevo
            </Link>
          )}
        </div>
      </div>

      {!verInactivos && (
        <div className="mb-3 d-flex gap-2">
          <button
            className={`btn btn-sm ${orden === "vencimiento" ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => setOrden("vencimiento")}
          >
            📅 Vencimiento
          </button>
          <button
            className={`btn btn-sm ${orden === "nombre" ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => setOrden("nombre")}
          >
            🅰️ Nombre
          </button>
        </div>
      )}

      {/* TABLA PRINCIPAL */}
      <div
        className={`card shadow border-0 overflow-hidden ${verInactivos ? "border-danger" : ""}`}
      >
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className={verInactivos ? "table-danger" : "table-light"}>
              <tr>
                <th className="ps-4">Socio</th>
                <th>Estado</th>
                <th className="text-end pe-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sociosPaginados.length > 0 ? (
                sociosPaginados.map((socio) => {
                  const diasRest = Math.ceil(
                    (new Date(socio.fechaVencimiento) - new Date()) / 86400000,
                  );
                  const esUrgente = diasRest <= 3;
                  return (
                    <tr
                      key={socio.id}
                      style={{ opacity: verInactivos ? 0.7 : 1 }}
                    >
                      <td className="ps-4">
                        <div className="fw-bold text-dark">{socio.nombre}</div>
                        <div className="small text-muted">{socio.telefono}</div>
                      </td>
                      <td>
                        {verInactivos ? (
                          <span className="badge bg-secondary">Baja</span>
                        ) : (
                          <>
                            <div className="small text-muted">
                              Pagó: {formatearFecha(socio.fechaPago)}
                            </div>
                            <div
                              className={`fw-bold ${esUrgente ? "text-danger" : "text-dark"}`}
                            >
                              Vence: {formatearFecha(socio.fechaVencimiento)}
                            </div>
                            {esUrgente ? (
                              <span className="badge bg-danger mt-1">
                                ⏳ Por Vencer
                              </span>
                            ) : (
                              <span className="badge bg-success mt-1">
                                ✅ Al día
                              </span>
                            )}
                          </>
                        )}
                      </td>
                      <td className="text-end pe-4">
                        <div className="btn-group">
                          {verInactivos ? (
                          <>
                            <button
                              className="btn btn-outline-success btn-sm"
                              onClick={() => handleReactivar(socio.id)}
      >
        ♻️ Restaurar
      </button>
      <button 
        className="btn btn-danger btn-sm ms-2"
        onClick={() => handleEliminarDefinitivo(socio.id, socio.nombre)}
      >
        🗑️ Eliminar
      </button>
    </>
  ) : (
                            <>
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => abrirRenovacion(socio)}
                              >
                                💲 Renovar
                              </button>
                              <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => abrirFicha(socio)}
                              >
                                👁️
                              </button>
                              {esUrgente && (
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => enviarWhatsApp(socio)}
                                >
                                  📱
                                </button>
                              )}
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleEliminar(socio.id)}
                              >
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-5 text-muted">
                    Sin resultados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPaginas > 1 && (
        <nav className="mt-4 d-flex justify-content-center">
          <ul className="pagination shadow-sm">
            <li className={`page-item ${paginaActual === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setPaginaActual((p) => p - 1)}
              >
                Ant
              </button>
            </li>
            <li className="page-item disabled">
              <span className="page-link">
                {paginaActual} / {totalPaginas}
              </span>
            </li>
            <li
              className={`page-item ${paginaActual === totalPaginas ? "disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setPaginaActual((p) => p + 1)}
              >
                Sig
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/* --- MODAL FICHA (EDICIÓN SOCIO + EDICIÓN PAGOS) --- */}
      {socioSeleccionado && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            {" "}
            {/* modal-lg para mas espacio */}
            <div className="modal-content border-0 shadow-lg">
              <div
                className={`modal-header text-white ${editandoSocio ? "bg-warning" : "bg-secondary"}`}
              >
                <h5 className="modal-title">
                  {editandoSocio
                    ? "✏️ Editando Socio"
                    : `Ficha de ${socioSeleccionado.nombre}`}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSocioSeleccionado(null)}
                ></button>
              </div>

              <div className="modal-body">
                {/* --- SECCIÓN DATOS SOCIO --- */}
                {editandoSocio ? (
                  <div className="row mb-3 bg-light p-2 rounded">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        Nombre Completo:
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={datosEdicionSocio.nombre}
                        onChange={(e) =>
                          setDatosEdicionSocio({
                            ...datosEdicionSocio,
                            nombre: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Teléfono:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={datosEdicionSocio.telefono}
                        onChange={(e) =>
                          setDatosEdicionSocio({
                            ...datosEdicionSocio,
                            telefono: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p>
                        <strong>📞 Teléfono:</strong>{" "}
                        {socioSeleccionado.telefono}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p>
                        <strong>💳 Último Pago:</strong>{" "}
                        {formatearFecha(socioSeleccionado.fechaPago)} (
                        {socioSeleccionado.metodoPago})
                      </p>
                    </div>
                  </div>
                )}

                <hr className="my-3" />

                {/* --- SECCIÓN HISTORIAL PAGOS --- */}
                <h6 className="fw-bold text-dark d-flex justify-content-between align-items-center">
                  <span>📜 Historial de Pagos</span>
                  {editandoSocio && (
                    <small className="text-muted fw-normal">
                      (Editá los pagos abajo si es necesario)
                    </small>
                  )}
                </h6>

                {socioSeleccionado.Pagos &&
                socioSeleccionado.Pagos.length > 0 ? (
                  <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                    <table className="table table-sm table-striped small mb-0 align-middle">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>Fecha</th>
                          <th>Método</th>
                          <th>Monto</th>
                          {editandoSocio && (
                            <th className="text-end">Editar</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {socioSeleccionado.Pagos.map((pago) => (
                          <tr key={pago.id}>
                            {/* SI ESTAMOS EDITANDO ESTE PAGO ESPECÍFICO */}
                            {pagoEditandoId === pago.id ? (
                              <>
                                <td>
                                  <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    value={datosEdicionPago.fecha}
                                    onChange={(e) =>
                                      setDatosEdicionPago({
                                        ...datosEdicionPago,
                                        fecha: e.target.value,
                                      })
                                    }
                                  />
                                </td>
                                <td>
                                  <select
                                    className="form-select form-select-sm"
                                    value={datosEdicionPago.metodoPago}
                                    onChange={(e) =>
                                      setDatosEdicionPago({
                                        ...datosEdicionPago,
                                        metodoPago: e.target.value,
                                      })
                                    }
                                  >
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Transferencia">
                                      Transferencia
                                    </option>
                                    <option value="Tarjeta">Tarjeta</option>
                                  </select>
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    value={datosEdicionPago.monto}
                                    onChange={(e) =>
                                      setDatosEdicionPago({
                                        ...datosEdicionPago,
                                        monto: e.target.value,
                                      })
                                    }
                                  />
                                </td>
                                <td className="text-end">
                                  <button
                                    className="btn btn-sm btn-success me-1"
                                    onClick={guardarEdicionPago}
                                  >
                                    💾
                                  </button>
                                  <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={cancelarEdicionPago}
                                  >
                                    ❌
                                  </button>
                                </td>
                              </>
                            ) : (
                              /* SI VEMOS LA FILA NORMAL */
                              <>
                                <td>{formatearFecha(pago.fecha)}</td>
                                <td>{pago.metodoPago}</td>
                                <td className="fw-bold text-success">
                                  ${pago.monto || 0}
                                </td>
                                {editandoSocio && (
                                  <td className="text-end">
                                    <button
                                      className="btn btn-sm btn-outline-warning border-0"
                                      onClick={() => activarEdicionPago(pago)}
                                    >
                                      ✏️
                                    </button>
                                  </td>
                                )}
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-light text-center small">
                    Sin historial.
                  </div>
                )}
              </div>

              <div className="modal-footer">
                {editandoSocio ? (
                  <>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setEditandoSocio(false)}
                    >
                      Cancelar Edición
                    </button>
                    <button
                      className="btn btn-success fw-bold"
                      onClick={guardarEdicionSocio}
                    >
                      💾 Guardar Cambios del Socio
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => setEditandoSocio(true)}
                    >
                      ✏️ Editar Socio y Pagos
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSocioSeleccionado(null)}
                    >
                      Cerrar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RENOVAR */}
      {socioARenovar && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  💲 Renovar: {socioARenovar.nombre}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSocioARenovar(null)}
                ></button>
              </div>
              <form onSubmit={handleSubmit(onRenovarSubmit)}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Fecha de Pago:</label>
                    <input
                      type="date"
                      className="form-control"
                      {...register("fechaPago", { required: true })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Monto ($):</label>
                    <input
                      type="number"
                      className="form-control form-control-lg fw-bold text-primary"
                      placeholder="Ej: 15000"
                      {...register("monto", { required: true, min: 0 })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Método:</label>
                    <select className="form-select" {...register("metodoPago")}>
                      <option value="Efectivo">💵 Efectivo</option>
                      <option value="Transferencia">💸 Transferencia</option>
                      <option value="Tarjeta">💳 Tarjeta</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSocioARenovar(null)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Confirmar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
