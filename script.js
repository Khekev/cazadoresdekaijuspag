/* 
   CAZADORES DE KAIJUS
   JAVASCRIPT PRINCIPAL
 */


/* 
   MOSTRAR KAIJU
*/

function mostrarKaiju(id) {

    // Obtener todos los registros de Kaijus
    const fichas = document.querySelectorAll(".kaiju-details");


    // Ocultar todos los registros
    fichas.forEach(function (ficha) {

        ficha.style.display = "none";

    });


    // Buscar el registro seleccionado
    const fichaSeleccionada = document.getElementById(id);


    // Comprobar que existe
    if (fichaSeleccionada) {

        // Mostrar el registro
        fichaSeleccionada.style.display = "grid";


        // Desplazarse hasta el registro
        fichaSeleccionada.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }

}


/* =========================
   CERRAR KAIJU
========================= */

function cerrarKaiju() {

    // Obtener todos los registros
    const fichas = document.querySelectorAll(".kaiju-details");


    // Ocultar todos
    fichas.forEach(function (ficha) {

        ficha.style.display = "none";

    });


    // Buscar sección Kaijus
    const kaijusSection =
        document.getElementById("kaijus");


    // Regresar a Kaijus
    if (kaijusSection) {

        kaijusSection.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }

}


/* =========================
   NAVEGACIÓN SUAVE
========================= */

document.querySelectorAll('a[href^="#"]').forEach(function (enlace) {

    enlace.addEventListener("click", function (event) {

        const id =
            this.getAttribute("href");


        const destino =
            document.querySelector(id);


        // Si existe el destino
        if (destino) {

            event.preventDefault();


            destino.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }

    });

});


/* =========================
   ANIMACIÓN AL CARGAR
========================= */

window.addEventListener("load", function () {

    document.body.classList.add("loaded");

});

/* 
   POPUP — AVISOS KAIJU
 */

const alertaKaiju =
    document.getElementById("alerta-kaiju");


/* 
   MOSTRAR POPUP
*/

window.addEventListener("load", function () {

    setTimeout(function () {

        if (alertaKaiju) {

            alertaKaiju.classList.add("activo");

        }

    }, 5000);

});


/* 
   CERRAR POPUP
 */

function cerrarAlerta() {

    if (alertaKaiju) {

        alertaKaiju.classList.remove("activo");

    }

}


/* 
   CERRAR AL HACER CLICK
   FUERA DE LA VENTANA
 */

if (alertaKaiju) {

    alertaKaiju.addEventListener("click", function (event) {

        if (event.target === alertaKaiju) {

            cerrarAlerta();

        }

    });

}


/*
   SUPABASE
*/


/*
   CONEXIÓN CON SUPABASE
 */

const SUPABASE_URL =
    "https://ginwyhfvcxhaajgktoal.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_FZO9_H6SRnTJlxHgnmjW9w_0rz9m2l8";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* 
   FORMULARIO
 */

const formularioAlerta =
    document.getElementById("form-alerta");


if (formularioAlerta) {

    formularioAlerta.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const correo =
                document
                    .getElementById("correo-alerta")
                    .value
                    .trim();


            const mensaje =
                document.getElementById(
                    "mensaje-alerta"
                );


            const boton =
                formularioAlerta.querySelector(
                    "button"
                );


            /* 
               COMPROBAR CORREO
            */

            if (!correo) {

                mensaje.textContent =
                    "INTRODUCE UN CORREO VÁLIDO.";

                return;

            }


            /* 
               ENVIANDO
            */

            boton.disabled = true;

            boton.textContent =
                "ENVIANDO...";


            /* 
               GUARDAR EN SUPABASE
             */

            const { data, error } =
                await supabaseClient
                    .from("suscriptores")
                    .insert([
                        {
                            correo: correo
                        }
                    ]);


            /*
               ERROR ola
         */

            if (error) {

                console.error(
                    "Error Supabase:",
                    error
                );


                /* Correo duplicado */

                if (error.code === "23505") {

                    mensaje.textContent =
                        "ESTE CORREO YA ESTÁ REGISTRADO.";

                } else {

                    mensaje.textContent =
                        "NO SE PUDO REGISTRAR EL CORREO.";

                }


                boton.disabled = false;

                boton.textContent =
                    "RECIBIR AVISOS →";

                return;

            }


            /* =========================
               REGISTRO CORRECTO
            ========================= */

            mensaje.textContent =
                "TRANSMISIÓN RECIBIDA. TE MANTENDREMOS INFORMADO.";


            document
                .getElementById("correo-alerta")
                .value = "";


            boton.disabled = false;

            boton.textContent =
                "RECIBIR AVISOS →";


            /* =========================
               CERRAR POPUP
            ========================= */

            setTimeout(function () {

                cerrarAlerta();

            }, 2500);

        }
    );

}



/* POPUP QR — CAZADORES DE KAIJUS */
document.addEventListener("DOMContentLoaded", function () {
    const botonAbrir = document.getElementById("boton-qr-kaijus");
    const popup = document.getElementById("popup-qr-kaijus");
    const botonCerrar = document.getElementById("cerrar-qr-kaijus");

    if (!botonAbrir || !popup || !botonCerrar) return;

    function abrirQR() {
        popup.classList.add("activo");
        popup.setAttribute("aria-hidden", "false");
        botonAbrir.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
    }

    function cerrarQR() {
        popup.classList.remove("activo");
        popup.setAttribute("aria-hidden", "true");
        botonAbrir.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
    }

    botonAbrir.addEventListener("click", abrirQR);
    botonCerrar.addEventListener("click", cerrarQR);

    popup.addEventListener("click", function (event) {
        if (event.target === popup) cerrarQR();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && popup.classList.contains("activo")) {
            cerrarQR();
        }
    });
});
