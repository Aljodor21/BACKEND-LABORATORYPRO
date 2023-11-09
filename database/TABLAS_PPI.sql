--Eliminamos primero las tablas debiles
DROP TABLE PROYECTOS_USUARIOS;
DROP TABLE AVANCES;
DROP TABLE USUARIOS;


--Luego eliminamos las tablas fuertes
DROP TABLE PROYECTOS;
DROP TABLE TIPOS;
DROP TABLE ESTADOS;



--Creamos nuestras tablas fuertes primero
CREATE TABLE TIPOS
(
    id_tipo NUMBER(1),
    tipo_usuario VARCHAR2(15)
)TABLESPACE ts_proyectosppi;

CREATE TABLE ESTADOS
(
    id_estado NUMBER(1),
    estado VARCHAR2(15)
)TABLESPACE ts_proyectosppi;

CREATE TABLE PROYECTOS 
(
    id_proyecto INTEGER,
    nombre_proyecto VARCHAR2(50),
    introduccion VARCHAR2(300),
    fecha_creacion DATE
)TABLESPACE ts_proyectosppi;

--Creamos nuestras tablas debiles
CREATE TABLE USUARIOS
(
    id_usuario INTEGER,
    nombre VARCHAR2(50),
    papellido VARCHAR2(50),
    sapellido VARCHAR2(50),
    correo VARCHAR2(80),
    contrasena VARCHAR2(70),
    fecha_registro DATE,
    codigo_tipo NUMBER(1),
    codigo_estado NUMBER(1)
)TABLESPACE ts_proyectosppi;



--Tabla de referencia para proyectos y usuarios
CREATE TABLE PROYECTOS_USUARIOS
(
    codigo_proyecto INTEGER,
    codigo_usuario INTEGER
)TABLESPACE ts_proyectosppi;

--Tabla de avances para usuarios y proyectos 
CREATE TABLE AVANCES
(
    codigo_proyecto INTEGER,
    codigo_usuario INTEGER,
    descripcion_avance VARCHAR2(4000),
    retroalimentacion VARCHAR2(300),
    codigo_coordinador INTEGER
)TABLESPACE ts_proyectosppi;

PURGE TABLESPACE ts_proyectosppi;