CREATE DATABASE MiBaseDeDatos;
USE MiBaseDeDatos;
CREATE TABLE Alumnos (
    id_boleta INT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL,
    ape_pat VARCHAR(20) NOT NULL,
    ape_mat VARCHAR(20) NOT NULL,
    carrera VARCHAR(50) NOT NULL,
    generacion INT NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    modalidad VARCHAR(20) NOT NULL
);
select*from Alumnos;