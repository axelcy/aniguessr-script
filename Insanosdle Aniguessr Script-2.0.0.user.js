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

    const LS_KEY = 'aniguessr-blur-script-enabled';
    let SCRIPT_ENABLED = localStorage.getItem(LS_KEY) !== 'false';

    const ANIDLE_BLUR_DEFAULT_VALUE = 'blur(9px)';
    const BTN_ID_TOGGLE_ANIDLE_BLUR = 'ag-blur-toggle-btn';

    /* ---------------- STYLES ---------------- */

    const videoStyle = document.createElement('style');
    videoStyle.innerHTML = `
    .c-game--music .plyr video,
    .c-game--endings .plyr video {
        -webkit-filter: none !important;
        filter: none !important;
    }
`;
    document.head.appendChild(videoStyle);
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

    /* ---------------- ANIDLE TOGGLE BLUR BUTTON ---------------- */

    function injectButton(img) {
        if (!SCRIPT_ENABLED) return;
        if (!img || document.getElementById(BTN_ID_TOGGLE_ANIDLE_BLUR)) return;

        const container = img.closest('.c-game__cover');
        if (!container) return;

        container.style.position = 'relative';
        img.style.filter = ANIDLE_BLUR_DEFAULT_VALUE;

        const btn = document.createElement('button');
        btn.id = BTN_ID_TOGGLE_ANIDLE_BLUR;
        btn.textContent = '👁️';

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

        let blurred = true;

        btn.onclick = () => {
            blurred = !blurred;
            img.style.filter = blurred ? ANIDLE_BLUR_DEFAULT_VALUE : 'none';
            btn.textContent = blurred ? '👁️' : '🚫';
        };

        container.appendChild(btn);
    }

    function findCover() {
        if (!SCRIPT_ENABLED) return;

        const img = document.querySelector(
            '.c-game .c-game__clues .c-game__cover img'
        );
        injectButton(img);
    }

    /* ---------------- OBSERVERS ---------------- */

    const observer = new MutationObserver(() => {
        if (SCRIPT_ENABLED) findCover();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    document.addEventListener('click', () => {
        if (SCRIPT_ENABLED) findCover();
    }, true);

    findCover();

    /* ---------------- HEADER BUTTON ---------------- */

    setTimeout(() => {
        const header = document.querySelector('header.c-header');
        if (!header) return;

        const headerChild = header.querySelector(':scope > div');
        // const headerChild = header.querySelector(':scope > div:first-child'); // tal vez sirva para un futuro

        if (!headerChild) return;

        if (headerChild.querySelector('.ag-cloned-btn')) return;

        const first = headerChild.children[0];
        if (!first) return;

        const clone = first.cloneNode(true);
        clone.classList.add('ag-cloned-btn');

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
        clone.style.display = 'flex';
        clone.style.alignItems = 'center';
        clone.style.justifyContent = 'center';

        clone.title = SCRIPT_ENABLED ? 'Script enabled' : 'Script disabled';
        clone.classList.toggle('ag-disabled', !SCRIPT_ENABLED);

        clone.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            SCRIPT_ENABLED = !SCRIPT_ENABLED;
            videoStyle.disabled = !SCRIPT_ENABLED;
            localStorage.setItem(LS_KEY, SCRIPT_ENABLED);

            clone.classList.toggle('ag-disabled', !SCRIPT_ENABLED);
            clone.title = SCRIPT_ENABLED ? 'Script enabled' : 'Script disabled';

            if (!SCRIPT_ENABLED) {
                // limpiar efectos activos
                document.getElementById(BTN_ID_TOGGLE_ANIDLE_BLUR)?.remove();
                document.querySelectorAll('.c-game__cover img')
                    .forEach(img => img.style.filter = '');
            } else {
                findCover();
            }
        });

        headerChild.appendChild(clone);
    }, 1000);

})();
