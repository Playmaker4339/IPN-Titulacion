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

        // Obtener fecha actual del sistema en formato dd/mm/aaaa
        const hoy = new Date();
        const dia = String(hoy.getDate()).padStart(2, '0');
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const anio = hoy.getFullYear();
        const fechaSolicitud = `${dia}/${mes}/${anio}`;

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
            ctx.fillText(apellidoPat, 190, 670);
            ctx.fillText(apellidoMat, 540, 670);
            ctx.fillText(nombre, 910, 670);
            ctx.fillText(generacion, 970, 738);
            ctx.fillText(boleta, 533, 738);
            ctx.fillText(carrera, 140, 738);
            ctx.fillText(grupo, 618, 805);
            ctx.fillText(correo, 900, 805);
            ctx.fillText(telefono, 239, 805);

            // Imprimir fecha de solicitud en el PDF (ajusta las coordenadas según tu formato)
            ctx.fillText(fechaSolicitud, 913, 308);

            if (modalidad === 'Curricular') {
                ctx.font = 'bold 24px Arial';
                ctx.fillText('x', 1183, 902); // Primera X para "Curricular"
                ctx.fillText('x', 663, 526); // Segunda X para "Curricular"
            } else if (modalidad === 'Escolaridad') {
                ctx.font = 'bold 24px Arial';
                ctx.fillText('x', 663, 494); // Coordenadas para "Escolaridad"
            } else if (modalidad === 'Licenciatura') {
                ctx.font = 'bold 24px Arial';
                ctx.fillText('x', 183, 591); // Primera X para "Licenciatura"
                ctx.fillText('x', 1183, 970); // Segunda X para "Licenciatura"
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
