--Inserción de valores por defecto a mi tabla Tipos
INSERT INTO tipos(id_tipo,tipo_usuario) VALUES(1,'Administrador');
INSERT INTO tipos(id_tipo,tipo_usuario) VALUES(2,'Estudiante');
INSERT INTO tipos(id_tipo,tipo_usuario) VALUES(3,'Profesor');

--Inserción de valores por defecto a mi tabla Estados
INSERT INTO estados(id_estado,estado) VALUES(1,'Pendiente');
INSERT INTO estados(id_estado,estado) VALUES(2,'Activo');
INSERT INTO estados(id_estado,estado) VALUES(3,'Rechazado');

COMMIT;

