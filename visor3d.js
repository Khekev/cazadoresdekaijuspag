import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/*
 * VISOR 3D OPTIMIZADO
 * - Crea el renderizador solo cuando el visor se acerca a la pantalla.
 * - Descarga cada modelo una sola vez.
 * - Detiene la animacion cuando el visor sale de pantalla.
 * - Limita la resolucion y la frecuencia de renderizado.
 */

function crearVisor({ contenedorId, estadoId, modeloUrl, nombre }) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    const estado = document.getElementById(estadoId);
    let iniciado = false;
    let cargando = false;
    let visible = false;
    let animacionId = null;
    let ultimoFrame = 0;
    let renderizador;
    let camara;
    let controles;
    let modeloCargado = false;

    const escena = new THREE.Scene();
    escena.background = new THREE.Color("#0d1217");

    function iniciarRenderizador() {
        if (iniciado) return;
        iniciado = true;

        camara = new THREE.PerspectiveCamera(35, 1, 0.01, 100000);
        renderizador = new THREE.WebGLRenderer({
            antialias: false,
            alpha: false,
            powerPreference: "low-power"
        });

        renderizador.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderizador.outputColorSpace = THREE.SRGBColorSpace;
        renderizador.domElement.style.display = "block";
        renderizador.domElement.style.width = "100%";
        renderizador.domElement.style.height = "100%";
        contenedor.appendChild(renderizador.domElement);

        escena.add(new THREE.HemisphereLight(0xffffff, 0x263344, 2.2));

        const luzPrincipal = new THREE.DirectionalLight(0xffffff, 2.5);
        luzPrincipal.position.set(4, 8, 6);
        escena.add(luzPrincipal);

        const luzFrontal = new THREE.DirectionalLight(0xffffff, 1.2);
        luzFrontal.position.set(-4, 3, 5);
        escena.add(luzFrontal);

        controles = new OrbitControls(camara, renderizador.domElement);
        controles.enableRotate = true;
        controles.enableZoom = true;
        controles.enablePan = false;
        controles.enableDamping = true;
        controles.dampingFactor = 0.07;
        controles.rotateSpeed = 0.9;
        controles.zoomSpeed = 0.9;
        controles.addEventListener("change", renderizar);

        ajustarTamano();
        cargarModelo();
    }

    function ajustarTamano() {
        if (!renderizador || !camara) return;

        const ancho = contenedor.clientWidth;
        const alto = contenedor.clientHeight;
        if (ancho <= 0 || alto <= 0) return;

        renderizador.setSize(ancho, alto, false);
        camara.aspect = ancho / alto;
        camara.updateProjectionMatrix();
        renderizar();
    }

    function encuadrarModelo(objeto) {
        // Calcula el centro y el volumen completo del modelo.
        const caja = new THREE.Box3().setFromObject(objeto);
        const centro = caja.getCenter(new THREE.Vector3());
        const esfera = caja.getBoundingSphere(new THREE.Sphere());

        // Centra realmente la geometría en el visor.
        objeto.position.sub(centro);

        const radio = Math.max(esfera.radius, 0.01);
        const medioFovVertical = THREE.MathUtils.degToRad(camara.fov / 2);
        const aspecto = Math.max(
            contenedor.clientWidth / Math.max(contenedor.clientHeight, 1),
            0.1
        );
        const medioFovHorizontal = Math.atan(
            Math.tan(medioFovVertical) * aspecto
        );

        // Ajusta la distancia usando una esfera envolvente para que
        // ninguna parte del Kaiju quede cortada, incluso si es muy ancho.
        const medioFov = Math.min(medioFovVertical, medioFovHorizontal);
        const distancia = (radio / Math.sin(medioFov)) * 2.25;

        camara.position.set(0, 0, distancia);
        camara.lookAt(0, 0, 0);
        camara.near = Math.max(distancia / 1000, 0.001);
        camara.far = Math.max(distancia * 100, 1000);
        camara.updateProjectionMatrix();

        controles.target.set(0, 0, 0);
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
        controles.minDistance = Math.max(radio * 0.5, 0.1);
=======
=======
>>>>>>> parent of 43a0017 (Centrar verticalmente los modelos 3D en sus visores)
        controles.minDistance = Math.max(maximo * 0.2, 0.1);
>>>>>>> parent of 43a0017 (Centrar verticalmente los modelos 3D en sus visores)
=======
        controles.minDistance = Math.max(radio * 0.5, 0.1);
>>>>>>> parent of 0db7922 (Update visor3d.js)
        controles.maxDistance = distancia * 5;
        controles.update();
    }

    function cargarModelo() {
        if (cargando || modeloCargado) return;
        cargando = true;

        const cargador = new GLTFLoader();
        cargador.load(
            modeloUrl,
            (glb) => {
                escena.add(glb.scene);
                encuadrarModelo(glb.scene);
                modeloCargado = true;
                cargando = false;
                if (estado) estado.style.display = "none";
                renderizar();
                console.log(nombre + " cargado correctamente.");
            },
            (progreso) => {
                if (!estado) return;
                if (progreso.total > 0) {
                    const porcentaje = Math.round((progreso.loaded / progreso.total) * 100);
                    estado.textContent = "CARGANDO MODELO... " + porcentaje + "%";
                } else {
                    const mb = (progreso.loaded / (1024 * 1024)).toFixed(1);
                    estado.textContent = "DESCARGANDO MODELO... " + mb + " MB";
                }
            },
            (error) => {
                cargando = false;
                console.error("Error al cargar " + nombre + ":", error);
                if (estado) {
                    estado.style.display = "block";
                    estado.textContent = "ERROR AL CARGAR EL MODELO. REVISA LA CONSOLA.";
                }
            }
        );
    }

    function renderizar() {
        if (!renderizador || !visible) return;
        renderizador.render(escena, camara);
    }

    function animar(tiempo) {
        if (!visible || !renderizador) {
            animacionId = null;
            return;
        }

        animacionId = requestAnimationFrame(animar);

        // Limita el visor a unos 30 FPS para reducir consumo de GPU.
        if (tiempo - ultimoFrame < 33) return;
        ultimoFrame = tiempo;

        if (controles) controles.update();
        renderizador.render(escena, camara);
    }

    function iniciarAnimacion() {
        if (animacionId === null && visible && renderizador) {
            ultimoFrame = 0;
            animacionId = requestAnimationFrame(animar);
        }
    }

    function detenerAnimacion() {
        if (animacionId !== null) {
            cancelAnimationFrame(animacionId);
            animacionId = null;
        }
    }

    const observadorVisibilidad = new IntersectionObserver((entradas) => {
        for (const entrada of entradas) {
            visible = entrada.isIntersecting;
            if (visible) {
                iniciarRenderizador();
                iniciarAnimacion();
            } else {
                detenerAnimacion();
            }
        }
    }, { rootMargin: "150px 0px", threshold: 0.01 });

    observadorVisibilidad.observe(contenedor);

    const observadorTamano = new ResizeObserver(() => {
        ajustarTamano();
    });
    observadorTamano.observe(contenedor);
    window.addEventListener("resize", ajustarTamano, { passive: true });
}

crearVisor({
    contenedorId: "visor-equusgora",
    estadoId: "estado-modelo",
    modeloUrl: "./MODELOS/EQUUSGORA.glb",
    nombre: "Equusgora"
});

crearVisor({
    contenedorId: "visor-gekkofinal",
    estadoId: "estado-gekkofinal",
    modeloUrl: "./MODELOS/gekkofinal.2.glb",
    nombre: "Kyuukazan"
});
