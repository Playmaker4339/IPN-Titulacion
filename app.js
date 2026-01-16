// Código para pegar datos del formulario sobre una imagen usando canvas
document.addEventListener('DOMContentLoaded', function() {
    const btnGenerar = document.getElementById('btnGenerarImagen');
    if (!btnGenerar) return;

    const inputApellidoPat = document.getElementById('apellidoPat');
    const inputApellidoMat = document.getElementById('apellidoMat');
    const inputNombre = document.getElementById('nombre');
    const inputBoleta = document.getElementById('boleta');
    const inputTelefono = document.getElementById('telefono');
    const inputGrupo = document.getElementById('grupo');
    const inputCorreo = document.getElementById('correo');

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

    // Permitir solo letras (y espacios) en campos de nombre y apellidos
    function allowOnlyLetters(input) {
        if (!input) return;
        input.addEventListener('input', () => {
            const soloLetras = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
            // Aplica mayúscula inicial a cada palabra mientras escribe
            const formateado = toTitleCase(soloLetras);
            if (formateado !== input.value) {
                input.value = formateado;
            }
        });
    }

    allowOnlyLetters(inputApellidoPat);
    allowOnlyLetters(inputApellidoMat);
    allowOnlyLetters(inputNombre);

    // Permitir solo números y máximo 10 caracteres en el campo boleta
    if (inputBoleta) {
        inputBoleta.addEventListener('input', () => {
            let soloDigitos = inputBoleta.value.replace(/\D/g, '');
            if (soloDigitos.length > 10) {
                soloDigitos = soloDigitos.slice(0, 10);
            }
            if (soloDigitos !== inputBoleta.value) {
                inputBoleta.value = soloDigitos;
            }
        });
    }

    // Permitir solo números en el campo teléfono
    if (inputTelefono) {
        inputTelefono.addEventListener('input', () => {
            const soloDigitos = inputTelefono.value.replace(/\D/g, '');
            if (soloDigitos !== inputTelefono.value) {
                inputTelefono.value = soloDigitos;
            }
        });
    }

    // Permitir solo letras y números en el campo grupo y convertir a mayúsculas
    if (inputGrupo) {
        inputGrupo.addEventListener('input', () => {
            // Quitar todo lo que no sea letra o número
            const soloAlfanumerico = inputGrupo.value.replace(/[^a-zA-Z0-9]/g, '');
            const enMayusculas = soloAlfanumerico.toUpperCase();
            if (enMayusculas !== inputGrupo.value) {
                inputGrupo.value = enMayusculas;
            }
        });
    }

    // Normalizar correo: solo alfanuméricos, @ y puntos, todo en minúsculas
    if (inputCorreo) {
        inputCorreo.addEventListener('input', () => {
            const soloPermitidos = inputCorreo.value.replace(/[^a-zA-Z0-9@.]/g, '');
            const enMinusculas = soloPermitidos.toLowerCase();
            if (enMinusculas !== inputCorreo.value) {
                inputCorreo.value = enMinusculas;
            }
        });
    }

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

        // Validar longitud exacta de boleta
        if (boleta.length !== 10) {
            alert('El número de boleta debe tener exactamente 10 dígitos.');
            return;
        }

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
