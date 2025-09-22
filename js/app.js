// js/app.js
let miCatalogo = [];

// cargar datos iiciales desde localStorage si existen
function cargarDatos() {
    const datosGuardados = localStorage.getItem('miCatalogo');
    if (datosGuardados) {
        miCatalogo = JSON.parse(datosGuardados);
        pintarTodoEnDOM();
    }
}

function guardarDatos() {
    localStorage.setItem('miCatalogo', JSON.stringify(miCatalogo));
}

function pintarGridPeliculas() {
    const grid = document.getElementById('grid-peliculas');
    grid.innerHTML = '';

    if (miCatalogo.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted">No hay películas en el catálogo. ¡Agrega algunas!</p>
            </div>
        `;
        return;
    }

    //agregar cada película como una card
    miCatalogo.forEach((pelicula) => {
        const cardHTML = `
            <div class="col-sm-6 col-md-4 col-lg-3 mb-2">
                <div class="card h-100">
                    <img src="${pelicula.portada || 'https://via.placeholder.com/300x450?text=Sin+Portada'}" 
                         class="card-img-top" 
                         alt="${pelicula.titulo}"
                         style="height: 350px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${pelicula.titulo}</h5>
                        <p class="card-text">${generarEstrellas(pelicula.calificacion)} (${pelicula.calificacion}/5)</p>
                        <button class="btn btn-primary btn-ver-detalles" data-id="${pelicula.id}">Ver Detalles</button>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += cardHTML;
    });
}

function pintarCarrusel() {
    const topPeliculas = miCatalogo.filter(peli => peli.calificacion > 4).slice(0, 3);
    const carruselInner = document.querySelector('#carouselTop .carousel-inner');
    const carruselIndicators = document.querySelector('#carouselTop .carousel-indicators');
    
    carruselInner.innerHTML = '';
    carruselIndicators.innerHTML = '';

    if (topPeliculas.length === 0) {
        carruselInner.innerHTML = `
            <div class="carousel-item active">
                <img src="https://via.placeholder.com/800x400/6c757d/ffffff?text=No+Hay+Películas+Top" 
                     class="d-block w-100" alt="No hay películas top">
                <div class="carousel-caption d-none d-md-block">
                    <h5>No hay películas destacadas</h5>
                    <p>Agrega películas con calificación mayor a 4 estrellas</p>
                </div>
            </div>
        `;
        carruselIndicators.innerHTML = '<button type="button" data-bs-target="#carouselTop" data-bs-slide-to="0" class="active"></button>';
        return;
    }

    topPeliculas.forEach((pelicula, index) => {
        const esActivo = index === 0 ? 'active' : '';
        
        carruselIndicators.innerHTML += `
            <button type="button" data-bs-target="#carouselTop" 
                    data-bs-slide-to="${index}" class="${esActivo}"></button>
        `;

        carruselInner.innerHTML += `
            <div class="carousel-item ${esActivo}">
                <img src="${pelicula.portada || 'https://via.placeholder.com/800x400?text=Top+Movie'}" 
                     class="d-block w-100" alt="${pelicula.titulo}"
                     style="height: 400px; object-fit: cover;">
                <div class="carousel-caption d-none d-md-block">
                    <h5>${pelicula.titulo}</h5>
                    <p>${generarEstrellas(pelicula.calificacion)} (${pelicula.calificacion}/5)</p>
                </div>
            </div>
        `;
    });
}

function generarEstrellas(calificacion) {
    if (!calificacion) return 'Sin calificación';
    const estrellasLlenas = Math.floor(calificacion);
    let estrellas = '⭐'.repeat(estrellasLlenas);
    estrellas += '☆'.repeat(5 - estrellasLlenas);
    return estrellas;
}

function manejarFormulario(event) {
    event.preventDefault();

    //CAPTURAR VALORES DEL FORMULARIO
    const titulo = document.getElementById('titulo').value.trim();
    const anio = document.getElementById('anio').value.trim();
    const genero = document.getElementById('genero').value;

    if (!titulo || !anio || !genero) {
        alert('Por favor, completa los campos obligatorios: Título, Año y Género');
        return;
    }

    const nuevaPelicula = {
        id: Date.now(),
        titulo: titulo,
        anio: anio,
        genero: genero,
        director: document.getElementById('director').value.trim(),
        calificacion: parseFloat(document.getElementById('calificacion').value) || 0,
        portada: document.getElementById('portada').value.trim(),
        sinopsis: document.getElementById('sinopsis').value.trim()
    };

    //verificar peliculas existentes
    const peliculaExistente = miCatalogo.find(peli => 
        peli.titulo.toLowerCase() === titulo.toLowerCase() && 
        peli.anio === anio
    );

    if (peliculaExistente) {
        if (confirm(`"${peliculaExistente.titulo}" ya existe. ¿Quieres actualizar la calificación?`)) {
            peliculaExistente.calificacion = nuevaPelicula.calificacion;
            guardarDatos();
            pintarTodoEnDOM();
            alert('¡Calificación actualizada!');
        }
    } else {
        miCatalogo.push(nuevaPelicula);
        guardarDatos();
        pintarTodoEnDOM();
        alert('¡Película agregada correctamente!');
    }

    // cerrar modal y limpiar form
    const modalForm = bootstrap.Modal.getInstance(document.getElementById('modalFormulario'));
    modalForm.hide();
    document.getElementById('form-pelicula').reset();
}

function mostrarDetalles(pelicula) {
    if (!pelicula) return;

    document.getElementById('titulo-modal').textContent = pelicula.titulo;
    
    const tablaBody = document.querySelector('#modalDetalles tbody');
    tablaBody.innerHTML = `
        <tr><th>Título:</th><td>${pelicula.titulo || 'N/A'}</td></tr>
        <tr><th>Año:</th><td>${pelicula.anio || 'N/A'}</td></tr>
        <tr><th>Género:</th><td>${pelicula.genero || 'N/A'}</td></tr>
        <tr><th>Director:</th><td>${pelicula.director || 'N/A'}</td></tr>
        <tr><th>Calificación:</th><td>${pelicula.calificacion ? `${pelicula.calificacion}/5` : 'N/A'}</td></tr>
        <tr><th>Sinopsis:</th><td>${pelicula.sinopsis || 'No disponible'}</td></tr>
    `;

    const modalDetalles = new bootstrap.Modal(document.getElementById('modalDetalles'));
    modalDetalles.show();
}

function buscarPeliculas(termino) {
    if (!termino) {
        pintarGridPeliculas();
        return;
    }

    const terminoLower = termino.toLowerCase();
    const resultados = miCatalogo.filter(pelicula => 
        pelicula.titulo.toLowerCase().includes(terminoLower) ||
        pelicula.genero.toLowerCase().includes(terminoLower) ||
        (pelicula.director && pelicula.director.toLowerCase().includes(terminoLower)) ||
        (pelicula.anio && pelicula.anio.includes(termino))
    );

    pintarResultadosBusqueda(resultados);
}

function pintarResultadosBusqueda(resultados) {
    const grid = document.getElementById('grid-peliculas');
    grid.innerHTML = '';

    if (resultados.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted">No se encontraron películas que coincidan con la búsqueda.</p>
            </div>
        `;
        return;
    }
    //agregar cada película como una card si coincide con búsqueda 
    resultados.forEach((pelicula) => {
        const cardHTML = `
            <div class="col-sm-6 col-md-4 col-lg-3 mb-2">
                <div class="card h-100">
                    <img src="${pelicula.portada || 'https://via.placeholder.com/300x450?text=Sin+Portada'}" 
                         class="card-img-top" 
                         alt="${pelicula.titulo}"
                         style="height: 350px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${pelicula.titulo}</h5>
                        <p class="card-text">${pelicula.anio} • ${pelicula.genero}</p>
                        <p class="card-text">${generarEstrellas(pelicula.calificacion)} (${pelicula.calificacion}/5)</p>
                        <button class="btn btn-primary btn-ver-detalles" data-id="${pelicula.id}">Ver Detalles</button>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += cardHTML;
    });
}

function actualizarEstadisticas() {
    const total = miCatalogo.length;
    const mejorCalificada = miCatalogo.reduce((max, peli) => 
        peli.calificacion > max ? peli.calificacion : max, 0
    );
    const promedio = total > 0 
        ? (miCatalogo.reduce((sum, peli) => sum + peli.calificacion, 0) / total).toFixed(1)
        : 0;

    document.getElementById('total-peliculas').textContent = total;
    document.getElementById('mejor-calificada').textContent = mejorCalificada;
    document.getElementById('promedio-calificacion').textContent = promedio;
}

// Pointar en DOM(cargar todo )
function pintarTodoEnDOM() {
    pintarGridPeliculas();
    pintarCarrusel();
    actualizarEstadisticas();
}

function configurarEventListeners() {
    // Evento para el formulario
    document.getElementById('form-pelicula').addEventListener('submit', manejarFormulario);

    // Evento para botones "Ver Detalles" (delegación de eventos)
    document.getElementById('grid-peliculas').addEventListener('click', function(event) {
        if (event.target.classList.contains('btn-ver-detalles')) {
            const idPelicula = parseInt(event.target.getAttribute('data-id'));
            const pelicula = miCatalogo.find(peli => peli.id === idPelicula);
            mostrarDetalles(pelicula);
        }
    });

    // Evento para botón "Agregar" del navbar
    document.querySelector('a[href="#agregar"]').addEventListener('click', function(e) {
        e.preventDefault();
        const modalForm = new bootstrap.Modal(document.getElementById('modalFormulario'));
        modalForm.show();
    });

    // Eventos de búsqueda
    document.getElementById('btn-buscar').addEventListener('click', function() {
        const termino = document.getElementById('input-busqueda').value;
        buscarPeliculas(termino);
    });

    document.getElementById('input-busqueda').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            buscarPeliculas(this.value);
        }
    });
}

//inicialización
document.addEventListener('DOMContentLoaded', function() {
    cargarDatos();
    configurarEventListeners();
});

//datos iniciale de ejemplo para mostrar
miCatalogo.push({
    id: Date.now(),
    titulo: "300",
    anio: "2006",
    genero: "Acción",
    director: "Zack Snyder",
    calificacion: 4.5,
    portada: "/img/300.jpg",
    sinopsis: "El rey Leónidas de Esparta y sus 300 guerreros luchan hasta la muerte contra el masivo ejército persa de Jerjes I en la batalla de las Termópilas."
});

miCatalogo.push({
    id: Date.now() + 1,
    titulo: "Juego de Tronos",
    anio: "2011",
    genero: "Fantasía",
    director: "David Benioff, D.B. Weiss",
    calificacion: 4.9,
    portada: "/img/got.jpg",
    sinopsis: "El Lord Ned Stark está preocupado por los perturbantes reportes de un desertor del Nights Watch; El Rey Robert y los Lannisters llegan a Winterfell; el exiliado Viserys Targaryen forja una nueva y poderosa alianza."
});

miCatalogo.push({
    id: Date.now() + 2,
    titulo: "Los Vengadores",
    anio: "2012",
    genero: "Acción",
    director: "Joss Whedon",
    calificacion: 4.8,
    portada: "/img/vengadores.jpg",
    sinopsis: "Los superhéroes más poderosos de la Tierra se unen para salvar el mundo."
});

guardarDatos();
