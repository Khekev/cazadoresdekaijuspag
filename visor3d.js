import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/* Visores diferidos: cada modelo se carga al abrir su ficha. */
const visores = {
    equusgora: {
        contenedor: "visor-equusgora",
        estado: "estado-modelo",
        archivo: "./MODELOS/EQUUSGORA.glb",
        margen: 1.25
    },
    kaiju2: {
        contenedor: "visor-gekkofinal",
        estado: "estado-gekkofinal",
        archivo: "./MODELOS/gekkofinal.2.glb",
        margen: 1.35
    }
};

const visoresInicializados = new Set();

function iniciarVisor(id) {
    const config = visores[id];
    if (!config || visoresInicializados.has(id)) return;

    const contenedor = document.getElementById(config.contenedor);
    if (!contenedor) return;
    const ficha = contenedor.closest(".kaiju-details");
    if (!ficha) return;

    visoresInicializados.add(id);

    const escena = new THREE.Scene();
    escena.background = new THREE.Color("#0d1217");
    const camara = new THREE.PerspectiveCamera(35, 1, 0.01, 100000);
    const renderizador = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
    });

    renderizador.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderizador.outputColorSpace = THREE.SRGBColorSpace;
    renderizador.domElement.style.display = "block";
    renderizador.domElement.style.width = "100%";
    renderizador.domElement.style.height = "100%";
    contenedor.appendChild(renderizador.domElement);

    escena.add(new THREE.HemisphereLight(0xffffff, 0x263344, 2.5));
    const luzPrincipal = new THREE.DirectionalLight(0xffffff, 3);
    luzPrincipal.position.set(4, 8, 6);
    escena.add(luzPrincipal);
    const luzFrontal = new THREE.DirectionalLight(0xffffff, 1.5);
    luzFrontal.position.set(-4, 3, 5);
    escena.add(luzFrontal);

    const controles = new OrbitControls(camara, renderizador.domElement);
    controles.enableRotate = true;
    controles.enableZoom = true;
    controles.enablePan = false;
    controles.enableDamping = true;
    controles.dampingFactor = 0.06;
    controles.rotateSpeed = 1;
    controles.zoomSpeed = 1;

    const estado = document.getElementById(config.estado);
    let dimensionesModelo = null;
    let animacionId = null;

    function encuadrarModelo() {
        if (!dimensionesModelo) return;
        const ancho = contenedor.clientWidth;
        const alto = contenedor.clientHeight;
        if (ancho <= 0 || alto <= 0) return;

        const aspecto = ancho / alto;
        camara.aspect = aspecto;
        camara.updateProjectionMatrix();

        const anguloVertical = THREE.MathUtils.degToRad(camara.fov / 2);
        const anguloHorizontal = Math.atan(Math.tan(anguloVertical) * aspecto);
        const distanciaAlto = (dimensionesModelo.y / 2) / Math.tan(anguloVertical);
        const distanciaAncho = (dimensionesModelo.x / 2) / Math.tan(anguloHorizontal);
        const distanciaProfundidad = dimensionesModelo.z / 2;
        const distancia = Math.max(
            distanciaAlto, distanciaAncho, distanciaProfundidad
        ) * config.margen;

        camara.position.set(0, 0, distancia);
        camara.lookAt(0, 0, 0);
        const maximo = Math.max(
            dimensionesModelo.x, dimensionesModelo.y, dimensionesModelo.z
        );
        camara.near = Math.max(maximo / 10000, 0.001);
        camara.far = Math.max(distancia * 100, 1000);
        camara.updateProjectionMatrix();

        controles.target.set(0, 0, 0);
        controles.minDistance = Math.max(
            id === "equusgora" ? maximo * 0.3 : distancia * 0.15, 0.1
        );
        controles.maxDistance = distancia * 5;
        controles.update();
    }

    function ajustarTamano() {
        const ancho = contenedor.clientWidth;
        const alto = contenedor.clientHeight;
        if (ancho <= 0 || alto <= 0) return;
        renderizador.setSize(ancho, alto, false);
        encuadrarModelo();
    }

    function detenerAnimacion() {
        if (animacionId !== null) {
            cancelAnimationFrame(animacionId);
            animacionId = null;
        }
    }

    function animar() {
        if (document.hidden || ficha.style.display === "none") {
            detenerAnimacion();
            return;
        }
        controles.update();
        renderizador.render(escena, camara);
        animacionId = requestAnimationFrame(animar);
    }

    function actualizarAnimacion() {
        if (document.hidden || ficha.style.display === "none") {
            detenerAnimacion();
        } else if (animacionId === null) {
            animacionId = requestAnimationFrame(animar);
        }
    }

    const observador = new ResizeObserver(() => {
        ajustarTamano();
        actualizarAnimacion();
    });
    observador.observe(contenedor);
    document.addEventListener("visibilitychange", actualizarAnimacion);
    window.addEventListener("resize", ajustarTamano);

    const cargador = new GLTFLoader();
    cargador.load(
        config.archivo,
        (glb) => {
            const modelo = glb.scene;
            escena.add(modelo);
            const caja = new THREE.Box3().setFromObject(modelo);
            const centro = caja.getCenter(new THREE.Vector3());
            dimensionesModelo = caja.getSize(new THREE.Vector3());
            modelo.position.sub(centro);
            ajustarTamano();
            if (estado) estado.style.display = "none";
            console.log(id + " cargado correctamente.", dimensionesModelo);
            actualizarAnimacion();
        },
        (progreso) => {
            if (!estado) return;
            if (progreso.total > 0) {
                const porcentaje = Math.round(
                    (progreso.loaded / progreso.total) * 100
                );
                estado.textContent = "CARGANDO MODELO... " + porcentaje + "%";
            } else {
                const megabytes = (progreso.loaded / (1024 * 1024)).toFixed(1);
                estado.textContent = "DESCARGANDO MODELO... " + megabytes + " MB";
            }
        },
        (error) => {
            console.error("Error al cargar " + id + ":", error);
            if (estado) {
                estado.style.display = "block";
                estado.textContent =
                    "ERROR AL CARGAR EL MODELO. REVISA LA CONSOLA.";
            }
            visoresInicializados.delete(id);
        }
    );

    ajustarTamano();
    actualizarAnimacion();
}

window.addEventListener("kaiju:open", (evento) => {
    iniciarVisor(evento.detail && evento.detail.id);
});
