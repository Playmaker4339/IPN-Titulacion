// Código para pegar datos del formulario sobre una imagen usando canvas
document.addEventListener('DOMContentLoaded', function() {
    const btnGenerar = document.getElementById('btnGenerarImagen');
    if (!btnGenerar) return;

    const inputApellidoPat = document.getElementById('apellidoPat');
    const inputApellidoMat = document.getElementById('apellidoMat');
    const inputNombre = document.getElementById('nombre');

    function toTitleCase(text) {
        if (!text) return '';
        return text
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    function attachTitleCaseHandler(input) {
        if (!input) return;
        input.addEventListener('blur', () => {
            input.value = toTitleCase(input.value);
        });
    }

    attachTitleCaseHandler(inputApellidoPat);
    attachTitleCaseHandler(inputApellidoMat);
    attachTitleCaseHandler(inputNombre);

    btnGenerar.addEventListener('click', function() {
        const apellidoPat = document.getElementById('apellidoPat').value;
        const apellidoMat = document.getElementById('apellidoMat').value;
        const nombre = document.getElementById('nombre').value;
        const generacion = document.getElementById('generacion').value;
        const boleta = document.getElementById('boleta').value;
        const carrera = document.getElementById('carrera').options[document.getElementById('carrera').selectedIndex].text;
        const modalidad = document.getElementById('modalidad').options[document.getElementById('modalidad').selectedIndex].text;
        const grupo = document.getElementById('grupo').value;
        const correo = document.getElementById('correo').value;
        const telefono = document.getElementById('telefono').value;

        // Enviar datos al servidor para guardarlos en la base de datos
        enviarDatosABaseDeDatos({
            apellidoPat,
            apellidoMat,
            nombre,
            generacion,
            boleta,
            carrera,
            modalidad,
            grupo,
            correo,
            telefono
        });

        const canvas = document.getElementById('canvasImagen');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = 'solicitud.jpg';
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            ctx.font = '20px Arial';
            ctx.fillStyle = 'black';
            ctx.fillText(apellidoPat, 165, 670);
            ctx.fillText(apellidoMat, 520, 670);
            ctx.fillText(nombre, 870, 670);
            ctx.fillText(generacion, 970, 738);
            ctx.fillText(boleta, 533, 738);
            ctx.fillText(carrera, 140, 738);
            ctx.fillText(grupo, 618, 809);
            ctx.fillText(correo, 885, 809);
            ctx.fillText(telefono, 240, 809);

            if (modalidad === 'Curricular') {
                ctx.font = 'bold 24px Arial';
                ctx.fillText('x', 662, 530); // Coordenadas para "Curricular"
            } else if (modalidad === 'Escolaridad') {
                ctx.font = 'bold 24px Arial';
                ctx.fillText('x', 662, 498); // Coordenadas para "Escolaridad"
            }

            // Generar y descargar PDF usando jsPDF
            if (!window.jspdf || !window.jspdf.jsPDF) {
                alert('jsPDF no está cargado correctamente.');
                return;
            }
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: img.width > img.height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [img.width, img.height]
            });
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, img.width, img.height);
            pdf.save('solicitud de titulacion.pdf');
        };
    });
});

async function enviarDatosABaseDeDatos(datos) {
    // En desarrollo usa localhost:3000, en producción usa el mismo origen (Render)
    const baseUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : '';

    try {
        const respuesta = await fetch(`${baseUrl}/guardar-solicitud`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        if (!respuesta.ok) {
            console.error('Error al guardar en la base de datos:', respuesta.statusText);
            return;
        }

        const data = await respuesta.json();
        if (!data.ok) {
            console.error('Error reportado por el servidor al guardar en la base de datos:', data.error);
        }
    } catch (error) {
        console.error('Error en la comunicación con el servidor:', error);
    }
}
