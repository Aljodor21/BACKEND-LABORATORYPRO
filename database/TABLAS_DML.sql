--Inserción de valores por defecto a mi tabla Tipos
INSERT INTO tipos(id_tipo,tipo_usuario) VALUES(1,'Administrador');
INSERT INTO tipos(id_tipo,tipo_usuario) VALUES(2,'Estudiante');
INSERT INTO tipos(id_tipo,tipo_usuario) VALUES(3,'Profesor');

--Inserción de valores por defecto a mi tabla Estados
INSERT INTO estados(id_estado,estado) VALUES(1,'Pendiente');
INSERT INTO estados(id_estado,estado) VALUES(2,'Activo');
INSERT INTO estados(id_estado,estado) VALUES(3,'Rechazado');

--De la siguiente manera seleccionamos un registro
--SELECT * FROM ESTADOS WHERE ID_ESTADO=1;

--De la siguiente manera actualizamos un registro
--UPDATE ESTADOS SET ESTADO = 'ACTUALIZADO' WHERE ID_ESTADO=1;

--De la siguiente manera eliminamos un registro
--DELETE FROM ESTADOS WHERE ID_ESTADO=1;

COMMIT;

