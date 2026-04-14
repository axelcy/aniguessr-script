// ==UserScript==
// @name         Insanosdle Aniguessr Script
// @namespace    https://tampermonkey.net/
// @version      2.0.0
// @description  el aniguessr configurado para los insanosdle
// @author       apel
// @match        https://aniguessr.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    /* ===============================================
       CONFIGURACIÓN Y VARIABLES GLOBALES
       =============================================== */
    
    // Clave para guardar el estado del script en localStorage
    const LS_KEY = 'aniguessr-blur-script-enabled';
    
    // Estado del script (activado/desactivado) - lee del localStorage si existe
    let SCRIPT_ENABLED = localStorage.getItem(LS_KEY) !== 'false';

    // Valor por defecto del blur aplicado a las imágenes de anidle
    const ANIDLE_BLUR_DEFAULT_VALUE = 'blur(9px)';
    
    // ID del botón de ojito para controlar el blur
    const BTN_ID_TOGGLE_ANIDLE_BLUR = 'ag-blur-toggle-btn';

    /* ===============================================
       ESTILOS CSS INYECTADOS
       =============================================== */

    // Estilo para remover el blur de los videos en los modos música y endings
    const videoStyle = document.createElement('style');
    videoStyle.innerHTML = `
    .c-game--music .plyr video,
    .c-game--endings .plyr video {
        -webkit-filter: none !important;
        filter: none !important;
    }
`;
    document.head.appendChild(videoStyle);
    
    // Estilos para el botón del header (botón de activar/desactivar script)
    const headerBtnStyle = document.createElement('style');
    headerBtnStyle.innerHTML = `
.ag-cloned-btn {
    color: #ff4f87 !important; /* icono */
    outline: none !important;
}

.ag-cloned-btn:hover {
    color: #ff7fa6 !important;
}

.ag-cloned-btn.ag-disabled {
    color: #888 !important;
    opacity: 0.5;
}
`;
    document.head.appendChild(headerBtnStyle);

    /* ===============================================
       BOTÓN DE OJITO - TOGGLE BLUR EN ANIDLE
       =============================================== */

    /**
     * Inyecta el botón de ojito para controlar el blur de la imagen de anidle
     * @param {HTMLElement} img - Elemento de imagen al que se le aplicará el blur
     */
    function injectButton(img) {
        // Si el script está desactivado, no hacer nada
        if (!SCRIPT_ENABLED) return;
        
        // Si no hay imagen o el botón ya existe, no hacer nada
        if (!img || document.getElementById(BTN_ID_TOGGLE_ANIDLE_BLUR)) return;

        // Buscar el contenedor de la imagen
        const container = img.closest('.c-game__cover');
        if (!container) return;

        // Configurar el contenedor para posicionamiento absoluto
        container.style.position = 'relative';
        
        // Aplicar el blur por defecto a la imagen
        img.style.filter = ANIDLE_BLUR_DEFAULT_VALUE;

        // Crear el botón de ojito
        const btn = document.createElement('button');
        btn.id = BTN_ID_TOGGLE_ANIDLE_BLUR;
        btn.textContent = '👁️';

        // Estilos inline del botón (posicionado en la esquina superior derecha)
        Object.assign(btn.style, {
            position: 'absolute',
            top: '6px',
            right: '6px',
            zIndex: '999',
            background: 'rgba(0,0,0,0.6)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '4px 6px',
            cursor: 'pointer',
            fontSize: '14px'
        });

        // Estado del blur (inicialmente activado)
        let blurred = true;

        // Evento click: alternar entre blur activado y desactivado
        btn.onclick = () => {
            blurred = !blurred;
            img.style.filter = blurred ? ANIDLE_BLUR_DEFAULT_VALUE : 'none';
            btn.textContent = blurred ? '👁️' : '🚫';
        };

        // Agregar el botón al contenedor
        container.appendChild(btn);
    }

    /**
     * Busca la imagen de anidle en el DOM e inyecta el botón de ojito
     */
    function findCover() {
        // Si el script está desactivado, no hacer nada
        if (!SCRIPT_ENABLED) return;

        // Buscar la imagen del cover de anidle
        const img = document.querySelector(
            '.c-game .c-game__clues .c-game__cover img'
        );
        
        // Inyectar el botón si se encontró la imagen
        injectButton(img);
    }

    /* ===============================================
       BOTÓN DEL HEADER - ACTIVAR/DESACTIVAR SCRIPT
       =============================================== */

    /**
     * Inyecta el botón de activar/desactivar en el header de la página
     */
    function injectHeaderButton() {
        // Buscar el header principal de la página
        const header = document.querySelector('header.c-header');
        if (!header) return;

        // Buscar el contenedor de botones del header
        const headerChild = header.querySelector(':scope > div');
        // const headerChild = header.querySelector(':scope > div:first-child'); // tal vez sirva para un futuro

        if (!headerChild) return;

        // Si ya existe el botón, no duplicarlo
        if (headerChild.querySelector('.ag-cloned-btn')) return;

        // Obtener el primer botón del header para clonar su estructura
        const first = headerChild.children[0];
        if (!first) return;

        // Clonar el botón para mantener la consistencia visual con el header
        const clone = first.cloneNode(true);
        clone.classList.add('ag-cloned-btn');

        // Reemplazar el contenido con un icono de código (</>)
        clone.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="22" height="22"
     viewBox="0 0 24 24"
     fill="none"
     stroke="currentColor"
     stroke-width="2"
     stroke-linecap="round"
     stroke-linejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M7 8l-4 4l4 4" />
    <path d="M17 8l4 4l-4 4" />
    <path d="M14 4l-4 16" />
</svg>
`;
        // Centrar el icono dentro del botón
        clone.style.display = 'flex';
        clone.style.alignItems = 'center';
        clone.style.justifyContent = 'center';

        // Configurar título y clase según el estado del script
        clone.title = SCRIPT_ENABLED ? 'Script enabled' : 'Script disabled';
        clone.classList.toggle('ag-disabled', !SCRIPT_ENABLED);

        // Evento click: alternar el estado del script completo
        clone.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Cambiar el estado del script
            SCRIPT_ENABLED = !SCRIPT_ENABLED;
            
            // Activar/desactivar los estilos de video
            videoStyle.disabled = !SCRIPT_ENABLED;
            
            // Guardar el nuevo estado en localStorage
            localStorage.setItem(LS_KEY, SCRIPT_ENABLED);

            // Actualizar la apariencia del botón
            clone.classList.toggle('ag-disabled', !SCRIPT_ENABLED);
            clone.title = SCRIPT_ENABLED ? 'Script enabled' : 'Script disabled';

            if (!SCRIPT_ENABLED) {
                // Limpiar efectos activos cuando se desactiva el script
                document.getElementById(BTN_ID_TOGGLE_ANIDLE_BLUR)?.remove();
                document.querySelectorAll('.c-game__cover img')
                    .forEach(img => img.style.filter = '');
            } else {
                // Reactivar el botón de ojito cuando se activa el script
                findCover();
            }
        });

        // Agregar el botón al header
        headerChild.appendChild(clone);
    }

    /* ===============================================
       OBSERVADORES DEL DOM
       =============================================== */

    // Observador de mutaciones: detecta cambios en el DOM para inyectar los botones
    // cuando aparecen los elementos necesarios (imagen de anidle y header)
    const observer = new MutationObserver(() => {
        // Intentar inyectar el botón del header cada vez que el DOM cambie
        injectHeaderButton();
        
        // Intentar inyectar el botón de ojito si el script está activo
        if (SCRIPT_ENABLED) findCover();
    });

    // Configurar el observador para que vigile todo el body y sus descendientes
    observer.observe(document.body, {
        childList: true,  // Observar adición/eliminación de nodos hijos
        subtree: true     // Observar todo el árbol de descendientes
    });

    // Listener de clicks: también busca elementos al hacer click (para detectar cambios de página)
    document.addEventListener('click', () => {
        injectHeaderButton();
        if (SCRIPT_ENABLED) findCover();
    }, true);

    // Búsqueda inicial de elementos al cargar el script
    injectHeaderButton();
    findCover();

})();
