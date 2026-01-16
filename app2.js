        document.addEventListener('DOMContentLoaded', function() {
                    const btnGenerar = document.getElementById('btnGenerarImagen');
                    if (!btnGenerar) return;

                    const inputNombre = document.getElementById('nombre');
                    const inputBoleta = document.getElementById('boleta');

            // Función para poner la primera letra de cada palabra en mayúscula
            // sin eliminar espacios mientras el usuario escribe
            function toTitleCasePreservandoEspacios(text) {
                if (!text) return '';
                let resultado = '';
                let nuevaPalabra = true;
                const lower = text.toLowerCase();
                for (let i = 0; i < lower.length; i++) {
                    const ch = lower[i];
                    if (/\s/.test(ch)) {
                        nuevaPalabra = true;
                        resultado += ch;
                    } else if (nuevaPalabra) {
                        resultado += ch.toUpperCase();
                        nuevaPalabra = false;
                    } else {
                        resultado += ch;
                    }
                }
                return resultado;
            }

            // Restringir el campo nombre solo a letras (incluyendo acentos y ñ) y espacios,
            // y aplicar mayúscula inicial en cada palabra en cada pulsación
            if (inputNombre) {
                inputNombre.addEventListener('input', () => {
                    // Permitir letras (incluyendo acentos y ñ) y espacios
                    const soloLetras = inputNombre.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
                    const formateado = toTitleCasePreservandoEspacios(soloLetras);
                    if (formateado !== inputNombre.value) {
                        inputNombre.value = formateado;
                    }
                });
            }

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

            btnGenerar.addEventListener('click', function() {
                const nombre = document.getElementById('nombre').value;
                const generacion = document.getElementById('generacion').value;
                const boleta = document.getElementById('boleta').value;

                // Obtener fecha actual (día, mes en letras, año)
                const fecha = new Date();
                const dia = String(fecha.getDate()).padStart(2, '0');
                const nombresMes = [
                    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                ];
                const mes = nombresMes[fecha.getMonth()];
                const anio = String(fecha.getFullYear()).slice(-2); // Solo últimos 2 dígitos

                const canvas = document.getElementById('canvasImagen');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.src = 'carta.jpg'; 
                img.onload = function() {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    ctx.font = '20px Arial';
                    ctx.fillStyle = 'black';
                    ctx.fillText(nombre, 395, 516);
                    ctx.fillText(boleta, 330, 543);
                    ctx.fillText(generacion, 718, 543);

                    // Dibujar día, mes y año en coordenadas independientes
                    // Ajusta manualmente estas coordenadas según necesites
                    ctx.fillText(dia, 738, 467);   // Día
                    ctx.fillText(mes, 820, 467);  // Mes
                    ctx.fillText(anio, 1026, 468); // Año

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
                    pdf.save('Carta de no adeudo.pdf');
                };
            });
        });
