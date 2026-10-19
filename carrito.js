
"use strict";

// =====================================================
// BELANOVA | Funciones interactivas de la página
// =====================================================

// IMPORTANTE:
// Este número corresponde al WhatsApp de contacto indicado
// en la página. Se utiliza el formato internacional de Colombia.
const TELEFONO_WHATSAPP = "573163224956";

// =====================================================
// 1. CATÁLOGO DE SERVICIOS
// Modifica aquí los precios cuando tengas las tarifas reales.
// Los valores están expresados en pesos colombianos (COP).
// =====================================================

const productos = {
    corte: {
        nombre: "Cortes y estilizado",
        precio: 45000
    },
    manicure: {
        nombre: "Manicure",
        precio: 30000
    },
    tratamiento: {
        nombre: "Tratamientos",
        precio: 60000
    }
};

// El carrito se conserva mientras la página esté abierta.
const carrito = new Map();

// =====================================================
// 2. ELEMENTOS DEL CARRITO
// =====================================================

const btnAbrirCarrito = document.getElementById("btn-abrir-carrito");
const btnCerrarCarrito = document.getElementById("btn-cerrar-carrito");
const ventanaCarrito = document.getElementById("carrito-ventana");
const overlayCarrito = document.getElementById("carrito-overlay");
const listaCarrito = document.getElementById("lista-carrito");
const contadorCarrito = document.getElementById("contador-carrito");
const precioTotal = document.getElementById("precio-total");
const btnEnviarWhatsApp = document.getElementById("btn-enviar-whatsapp");
const btnVaciarCarrito = document.getElementById("btn-vaciar-carrito");

// =====================================================
// 3. UTILIDADES
// =====================================================

function formatoCOP(valor) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(valor);
}

function obtenerCantidadTotal() {
    let cantidad = 0;

    carrito.forEach(item => {
        cantidad += item.cantidad;
    });

    return cantidad;
}

function obtenerTotal() {
    let total = 0;

    carrito.forEach(item => {
        total += item.precio * item.cantidad;
    });

    return total;
}

// =====================================================
// 4. ABRIR Y CERRAR EL CARRITO
// =====================================================

function abrirCarrito() {
    ventanaCarrito.classList.add("activo");
    overlayCarrito.classList.add("activo");

    ventanaCarrito.inert = false;
    ventanaCarrito.setAttribute("aria-hidden", "false");
    btnAbrirCarrito.setAttribute("aria-expanded", "true");

    document.body.classList.add("bloqueado");

    btnCerrarCarrito.focus();
}

function cerrarCarrito() {
    ventanaCarrito.classList.remove("activo");
    overlayCarrito.classList.remove("activo");

    ventanaCarrito.inert = true;
    ventanaCarrito.setAttribute("aria-hidden", "true");
    btnAbrirCarrito.setAttribute("aria-expanded", "false");

    document.body.classList.remove("bloqueado");

    btnAbrirCarrito.focus();
}

btnAbrirCarrito.addEventListener("click", abrirCarrito);
btnCerrarCarrito.addEventListener("click", cerrarCarrito);
overlayCarrito.addEventListener("click", cerrarCarrito);

// =====================================================
// 5. AGREGAR SERVICIOS AL CARRITO
// =====================================================

document.querySelectorAll("[data-agregar]").forEach(boton => {
    boton.addEventListener("click", () => {
        const id = boton.dataset.agregar;
        const producto = productos[id];

        if (!producto) {
            return;
        }

        if (carrito.has(id)) {
            carrito.get(id).cantidad += 1;
        } else {
            carrito.set(id, {
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: 1
            });
        }

        actualizarCarrito();

        const textoOriginal = boton.textContent;
        boton.textContent = "¡Añadido al pedido ✓!";
        boton.classList.add("agregado");

        window.setTimeout(() => {
            boton.textContent = textoOriginal;
            boton.classList.remove("agregado");
        }, 1200);
    });
});

// =====================================================
// 6. DIBUJAR Y ACTUALIZAR EL CARRITO
// =====================================================

function actualizarCarrito() {
    listaCarrito.replaceChildren();

    if (carrito.size === 0) {
        const mensaje = document.createElement("p");
        mensaje.className = "carrito-vacio";
        mensaje.textContent =
            "Tu carrito está esperando algo especial. ✨";

        listaCarrito.appendChild(mensaje);
    } else {
        carrito.forEach((item, id) => {
            const fila = document.createElement("article");
            fila.className = "item-carrito";

            const informacion = document.createElement("div");

            const titulo = document.createElement("h3");
            titulo.textContent = item.nombre;

            const precioUnitario = document.createElement("p");
            precioUnitario.className = "item-precio";
            precioUnitario.textContent =
                formatoCOP(item.precio) + " por servicio";

            const controles = document.createElement("div");
            controles.className = "item-controles";

            const btnMenos = document.createElement("button");
            btnMenos.type = "button";
            btnMenos.textContent = "−";
            btnMenos.setAttribute(
                "aria-label",
                "Disminuir cantidad de " + item.nombre
            );
            btnMenos.addEventListener("click", () => {
                cambiarCantidad(id, -1);
            });

            const cantidad = document.createElement("span");
            cantidad.textContent = String(item.cantidad);
            cantidad.setAttribute("aria-label", "Cantidad");

            const btnMas = document.createElement("button");
            btnMas.type = "button";
            btnMas.textContent = "+";
            btnMas.setAttribute(
                "aria-label",
                "Aumentar cantidad de " + item.nombre
            );
            btnMas.addEventListener("click", () => {
                cambiarCantidad(id, 1);
            });

            const btnEliminar = document.createElement("button");
            btnEliminar.type = "button";
            btnEliminar.className = "eliminar-item";
            btnEliminar.textContent = "Eliminar";
            btnEliminar.addEventListener("click", () => {
                carrito.delete(id);
                actualizarCarrito();
            });

            controles.append(
                btnMenos,
                cantidad,
                btnMas,
                btnEliminar
            );

            informacion.append(titulo, precioUnitario, controles);

            const subtotal = document.createElement("strong");
            subtotal.className = "item-subtotal";
            subtotal.textContent =
                formatoCOP(item.precio * item.cantidad);

            fila.append(informacion, subtotal);
            listaCarrito.appendChild(fila);
        });
    }

    contadorCarrito.textContent = String(obtenerCantidadTotal());
    contadorCarrito.setAttribute(
        "aria-label",
        obtenerCantidadTotal() + " servicios en el carrito"
    );

    precioTotal.textContent = formatoCOP(obtenerTotal());

    const estaVacio = carrito.size === 0;

    btnEnviarWhatsApp.disabled = estaVacio;
    btnVaciarCarrito.disabled = estaVacio;
}

// =====================================================
// 7. AUMENTAR O DISMINUIR CANTIDADES
// =====================================================

function cambiarCantidad(id, cambio) {
    if (!carrito.has(id)) {
        return;
    }

    const item = carrito.get(id);
    item.cantidad += cambio;

    if (item.cantidad <= 0) {
        carrito.delete(id);
    }

    actualizarCarrito();
}

// =====================================================
// 8. VACIAR CARRITO
// =====================================================

btnVaciarCarrito.addEventListener("click", () => {
    if (carrito.size === 0) {
        return;
    }

    const confirmar = window.confirm(
        "¿Deseas eliminar todos los servicios del carrito?"
    );

    if (!confirmar) {
        return;
    }

    carrito.clear();
    actualizarCarrito();
});

// =====================================================
// 9. CONFIRMAR PEDIDO POR WHATSAPP
// =====================================================

btnEnviarWhatsApp.addEventListener("click", () => {
    if (carrito.size === 0) {
        window.alert("Agrega al menos un servicio antes de continuar.");
        return;
    }

    let mensaje = "¡Hola, BELANOVA! 🌿\n";
    mensaje += "Quiero consultar y confirmar el siguiente pedido:\n\n";

    carrito.forEach(item => {
        mensaje += "• " + item.nombre + "\n";
        mensaje += "  Cantidad: " + item.cantidad + "\n";
        mensaje += "  Precio unitario: " + formatoCOP(item.precio) + "\n";
        mensaje += "  Subtotal: " +
            formatoCOP(item.precio * item.cantidad) + "\n\n";
    });

    mensaje += "TOTAL ESTIMADO: " + formatoCOP(obtenerTotal()) + "\n\n";
    mensaje += "Por favor, confirmen disponibilidad y precios finales. Gracias.";

    const url = "https://wa.me/" +
        TELEFONO_WHATSAPP +
        "?text=" +
        encodeURIComponent(mensaje);

    window.open(url, "_blank", "noopener,noreferrer");
});

// =====================================================
// 10. MENÚ PARA CELULARES
// =====================================================

const btnMenu = document.getElementById("menu-toggle");
const menuPrincipal = document.getElementById("menu-principal");

function cerrarMenu() {
    menuPrincipal.classList.remove("abierto");
    btnMenu.setAttribute("aria-expanded", "false");
    btnMenu.setAttribute("aria-label", "Abrir menú");
}

btnMenu.addEventListener("click", () => {
    const abierto = menuPrincipal.classList.toggle("abierto");

    btnMenu.setAttribute("aria-expanded", String(abierto));
    btnMenu.setAttribute(
        "aria-label",
        abierto ? "Cerrar menú" : "Abrir menú"
    );
});

menuPrincipal.querySelectorAll("a").forEach(enlace => {
    enlace.addEventListener("click", cerrarMenu);
});

// =====================================================
// 11. FORMULARIO DE CONTACTO
// Abre WhatsApp con los datos escritos por el visitante.
// No requiere servidor ni almacena los datos.
// =====================================================

const formulario = document.getElementById("formulario-contacto");
const estadoFormulario = document.getElementById("estado-formulario");

formulario.addEventListener("submit", evento => {
    evento.preventDefault();

    if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return;
    }

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const mensajeUsuario = document.getElementById("mensaje").value.trim();

    if (!nombre || !correo || !mensajeUsuario) {
        estadoFormulario.textContent =
            "Por favor, completa todos los campos.";
        return;
    }

    let mensaje = "¡Hola, BELANOVA! 🌿\n\n";
    mensaje += "Mi nombre es: " + nombre + "\n";
    mensaje += "Mi correo: " + correo + "\n\n";
    mensaje += "Mi consulta:\n" + mensajeUsuario;

    const url = "https://wa.me/" +
        TELEFONO_WHATSAPP +
        "?text=" +
        encodeURIComponent(mensaje);

    estadoFormulario.textContent =
        "Se abrirá WhatsApp para que revises y envíes tu mensaje.";

    window.open(url, "_blank", "noopener,noreferrer");
});

// =====================================================
// 12. GALERÍA AMPLIABLE
// Permite abrir imágenes, avanzar y retroceder.
// =====================================================

const botonesGaleria = Array.from(
    document.querySelectorAll(".galeria-item")
);

const visorGaleria = document.getElementById("visor-galeria");
const visorImagen = document.getElementById("visor-imagen");
const visorDescripcion = document.getElementById("visor-descripcion");
const visorCerrar = document.getElementById("visor-cerrar");
const visorAnterior = document.getElementById("visor-anterior");
const visorSiguiente = document.getElementById("visor-siguiente");

let indiceImagen = 0;
let elementoAnteriorVisor = null;

function mostrarImagen(indice) {
    if (botonesGaleria.length === 0) {
        return;
    }

    indiceImagen =
        (indice + botonesGaleria.length) % botonesGaleria.length;

    const boton = botonesGaleria[indiceImagen];
    const imagen = boton.querySelector("img");

    visorImagen.src = imagen.src;
    visorImagen.alt = imagen.alt;
    visorDescripcion.textContent = imagen.alt;

    visorAnterior.hidden = botonesGaleria.length < 2;
    visorSiguiente.hidden = botonesGaleria.length < 2;
}

function abrirVisor(indice) {
    elementoAnteriorVisor = document.activeElement;

    mostrarImagen(indice);

    visorGaleria.classList.add("activo");
    visorGaleria.inert = false;
    visorGaleria.setAttribute("aria-hidden", "false");

    document.body.classList.add("bloqueado");
    visorCerrar.focus();
}

function cerrarVisor() {
    visorGaleria.classList.remove("activo");
    visorGaleria.inert = true;
    visorGaleria.setAttribute("aria-hidden", "true");

    document.body.classList.remove("bloqueado");

    if (elementoAnteriorVisor &&
        typeof elementoAnteriorVisor.focus === "function") {
        elementoAnteriorVisor.focus();
    }
}

botonesGaleria.forEach((boton, indice) => {
    boton.addEventListener("click", () => abrirVisor(indice));
});

visorCerrar.addEventListener("click", cerrarVisor);

visorAnterior.addEventListener("click", () => {
    mostrarImagen(indiceImagen - 1);
});

visorSiguiente.addEventListener("click", () => {
    mostrarImagen(indiceImagen + 1);
});

// Cerrar con Escape y navegar con las flechas del teclado.
document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") {
        if (visorGaleria.classList.contains("activo")) {
            cerrarVisor();
        } else if (ventanaCarrito.classList.contains("activo")) {
            cerrarCarrito();
        } else {
            cerrarMenu();
        }
    }

    if (visorGaleria.classList.contains("activo")) {
        if (evento.key === "ArrowRight") {
            mostrarImagen(indiceImagen + 1);
        }

        if (evento.key === "ArrowLeft") {
            mostrarImagen(indiceImagen - 1);
        }
    }
});

// =====================================================
// 13. INICIALIZACIÓN
// =====================================================

actualizarCarrito();

ventanaCarrito.inert = true;
ventanaCarrito.setAttribute("aria-hidden", "true");

visorGaleria.inert = true;
visorGaleria.setAttribute("aria-hidden", "true");
