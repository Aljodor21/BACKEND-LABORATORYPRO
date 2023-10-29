DROP SEQUENCE secuencia_usuarios;
DROP SEQUENCE secuencia_proyectos;


CREATE SEQUENCE secuencia_usuarios
START WITH 1
INCREMENT BY 1
MAXVALUE 9999
MINVALUE 1
NOCYCLE
CACHE 20
ORDER;

CREATE SEQUENCE secuencia_proyectos
START WITH 1
INCREMENT BY 1
MAXVALUE 9999
MINVALUE 1
NOCYCLE
CACHE 20
ORDER;
