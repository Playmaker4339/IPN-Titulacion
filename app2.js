        document.addEventListener('DOMContentLoaded', function() {
    const btnGenerar = document.getElementById('btnGenerarImagen');
    if (!btnGenerar) return;
    btnGenerar.addEventListener('click', function() {
        const nombre = document.getElementById('nombre').value;
        const generacion = document.getElementById('generacion').value;
        const boleta = document.getElementById('boleta').value;

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
