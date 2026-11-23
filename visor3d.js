import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const contenedor = document.getElementById("visor-equusgora");

if (contenedor) {
    const escena = new THREE.Scene();
    escena.background = new THREE.Color("#0d1217");

    const camara = new THREE.PerspectiveCamera(35, 1, 0.01, 100000);

    const renderizador = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });

    renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderizador.outputColorSpace = THREE.SRGBColorSpace;
    renderizador.domElement.style.display = "block";
    renderizador.domElement.style.width = "100%";
    renderizador.domElement.style.height = "100%";

    contenedor.appendChild(renderizador.domElement);

    // Iluminación
    escena.add(
        new THREE.HemisphereLight(0xffffff, 0x263344, 2.5)
    );

    const luzPrincipal = new THREE.DirectionalLight(0xffffff, 3);
    luzPrincipal.position.set(4, 8, 6);
    escena.add(luzPrincipal);

    const luzFrontal = new THREE.DirectionalLight(0xffffff, 1.5);
    luzFrontal.position.set(-4, 3, 5);
    escena.add(luzFrontal);

    // Controles para girar y acercar el modelo
    const controles = new OrbitControls(
        camara,
        renderizador.domElement
    );

    controles.enableRotate = true;
    controles.enableZoom = true;
    controles.enablePan = false;
    controles.enableDamping = true;
    controles.dampingFactor = 0.06;
    controles.rotateSpeed = 1;
    controles.zoomSpeed = 1;

    const cargador = new GLTFLoader();

    cargador.load(
        "./MODELOS/EQUUSGORA.glb",

        (glb) => {
            const modelo = glb.scene;
            escena.add(modelo);

            // Obtener los límites reales del modelo
            const cajaInicial = new THREE.Box3().setFromObject(modelo);
            const centroInicial = cajaInicial.getCenter(new THREE.Vector3());
            const tamano = cajaInicial.getSize(new THREE.Vector3());

            const alto = tamano.y;
            const ancho = tamano.x;
            const profundidad = tamano.z;
            const maximo = Math.max(alto, ancho, profundidad);

            // Centrar el modelo tanto horizontal como verticalmente
            modelo.position.sub(centroInicial);

            // Calcular la distancia necesaria para mostrar el modelo completo
            const anguloVertical = THREE.MathUtils.degToRad(camara.fov / 2);
            const aspecto = Math.max(
                contenedor.clientWidth / Math.max(contenedor.clientHeight, 1),
                0.1
            );

            const anguloHorizontal = Math.atan(
                Math.tan(anguloVertical) * aspecto
            );

            const distanciaAlto =
                (alto / 2) / Math.tan(anguloVertical);

            const distanciaAncho =
                (ancho / 2) / Math.tan(anguloHorizontal);

            const distanciaProfundidad = profundidad / 2;

            const distancia = Math.max(
                distanciaAlto,
                distanciaAncho,
                distanciaProfundidad
            ) * 1.25;

            // El objetivo queda EXACTAMENTE en el centro del modelo
            const objetivo = new THREE.Vector3(0, 0, 0);
            controles.target.copy(objetivo);

            // Colocar la cámara frente al centro
            camara.position.set(0, 0, distancia);
            camara.lookAt(objetivo);

            camara.near = Math.max(maximo / 10000, 0.001);
            camara.far = Math.max(maximo * 100, 1000);
            camara.updateProjectionMatrix();

            controles.minDistance = Math.max(maximo * 0.3, 0.1);
            controles.maxDistance = distancia * 5;
            controles.update();

            const estado = document.getElementById("estado-modelo");
            if (estado) {
                estado.style.display = "none";
            }

            ajustarTamano();

            console.log("Equusgora cargado y centrado.");
            console.log("Dimensiones:", tamano);
        },

        (progreso) => {
            const estado = document.getElementById("estado-modelo");

            if (estado && progreso.total > 0) {
                const porcentaje = Math.round(
                    (progreso.loaded / progreso.total) * 100
                );

                estado.textContent = `CARGANDO MODELO... ${porcentaje}%`;
            }
        },

        (error) => {
            console.error("Error al cargar Equusgora:", error);

            const estado = document.getElementById("estado-modelo");
            if (estado) {
                estado.style.display = "block";
                estado.textContent =
                    "ERROR AL CARGAR EL MODELO. REVISA LA CONSOLA.";
            }
        }
    );

    // Mantener el visor ajustado a su contenedor
    function ajustarTamano() {
        const ancho = contenedor.clientWidth;
        const alto = contenedor.clientHeight;

        if (ancho <= 0 || alto <= 0) return;

        renderizador.setSize(ancho, alto);

        camara.aspect = ancho / alto;
        camara.updateProjectionMatrix();
    }

    const observador = new ResizeObserver(ajustarTamano);
    observador.observe(contenedor);
    window.addEventListener("resize", ajustarTamano);

    ajustarTamano();

    function animar() {
        requestAnimationFrame(animar);
        controles.update();
        renderizador.render(escena, camara);
    }

    animar();
}

// VISOR 3D DEL SEGUNDO KAIJU: GEKKO
(function () {
    const contenedor = document.getElementById("visor-gekkofinal");
    if (!contenedor) return;

    const escena = new THREE.Scene();
    escena.background = new THREE.Color("#0d1217");

    const camara = new THREE.PerspectiveCamera(35, 1, 0.01, 100000);
    const renderizador = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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

    const estado = document.getElementById("estado-gekkofinal");
    let dimensionesModelo = null;
    const objetivo = new THREE.Vector3(0, 0, 0);

    function encuadrarModelo() {
        if (!dimensionesModelo) return;

        const ancho = contenedor.clientWidth;
        const alto = contenedor.clientHeight;
        if (ancho <= 0 || alto <= 0) return;

        const aspecto = ancho / alto;
        camara.aspect = aspecto;
        camara.updateProjectionMatrix();

<<<<<<< HEAD
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
        const distancia = (radio / Math.sin(medioFov)) * 1.25;

        camara.position.set(0, 0, distancia);
        camara.lookAt(0, 0, 0);
        camara.near = Math.max(distancia / 1000, 0.001);
        camara.far = Math.max(distancia * 100, 1000);
        camara.updateProjectionMatrix();

        controles.target.set(0, 0, 0);
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> parent of ee95fe6 (Update visor3d.js)
=======
>>>>>>> parent of ee95fe6 (Update visor3d.js)
        controles.minDistance = Math.max(radio * 0.5, 0.1);
=======
        controles.minDistance = Math.max(maximo * 0.2, 0.1);
>>>>>>> parent of 43a0017 (Centrar verticalmente los modelos 3D en sus visores)
=======
        controles.minDistance = Math.max(radio * 0.5, 0.1);
>>>>>>> parent of 0db7922 (Update visor3d.js)
=======
        const anguloVertical = THREE.MathUtils.degToRad(camara.fov / 2);
        const anguloHorizontal = Math.atan(Math.tan(anguloVertical) * aspecto);

        const distanciaAlto = (dimensionesModelo.y / 2) / Math.tan(anguloVertical);
        const distanciaAncho = (dimensionesModelo.x / 2) / Math.tan(anguloHorizontal);
        const distanciaProfundidad = dimensionesModelo.z / 2;
        const distancia = Math.max(distanciaAlto, distanciaAncho, distanciaProfundidad) * 1.35;

        camara.position.set(0, 0, distancia);
        camara.lookAt(objetivo);
        camara.near = Math.max(Math.max(dimensionesModelo.x, dimensionesModelo.y, dimensionesModelo.z) / 10000, 0.001);
        camara.far = Math.max(distancia * 100, 1000);
        camara.updateProjectionMatrix();

        controles.target.copy(objetivo);
        controles.minDistance = Math.max(distancia * 0.15, 0.1);
>>>>>>> parent of 8b8b626 (Optimizar carga y renderizado de modelos 3D)
        controles.maxDistance = distancia * 5;
        controles.update();
    }

    const cargador = new GLTFLoader();
    cargador.load(
        "./MODELOS/gekkofinal.2.glb",
        (glb) => {
            const modelo = glb.scene;
            escena.add(modelo);

            const caja = new THREE.Box3().setFromObject(modelo);
            const centro = caja.getCenter(new THREE.Vector3());
            dimensionesModelo = caja.getSize(new THREE.Vector3());
            modelo.position.sub(centro);

            encuadrarModelo();
            if (estado) estado.style.display = "none";
            console.log("Gekko cargado correctamente.", dimensionesModelo);
        },
        (progreso) => {
            if (estado) {
                if (progreso.total > 0) {
                    const porcentaje = Math.round((progreso.loaded / progreso.total) * 100);
                    estado.textContent = "CARGANDO MODELO... " + porcentaje + "%";
                } else {
                    const megabytes = (progreso.loaded / (1024 * 1024)).toFixed(1);
                    estado.textContent = "DESCARGANDO MODELO... " + megabytes + " MB";
                }
            }
        },
        (error) => {
            console.error("Error al cargar Gekko:", error);
            if (estado) {
                estado.style.display = "block";
                estado.textContent = "ERROR AL CARGAR EL MODELO. REVISA LA CONSOLA.";
            }
        }
    );

    function ajustarTamano() {
        const ancho = contenedor.clientWidth;
        const alto = contenedor.clientHeight;
        if (ancho <= 0 || alto <= 0) return;
        renderizador.setSize(ancho, alto);
        encuadrarModelo();
    }

    const observador = new ResizeObserver(ajustarTamano);
    observador.observe(contenedor);
    window.addEventListener("resize", ajustarTamano);
    ajustarTamano();

    function animar() {
        requestAnimationFrame(animar);
        controles.update();
        renderizador.render(escena, camara);
    }
    animar();
})();
