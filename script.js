/* ==================================================
   CAZADORES DE KAIJUS
   JAVASCRIPT PRINCIPAL
================================================== */


/* =========================
   MOSTRAR KAIJU
========================= */

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