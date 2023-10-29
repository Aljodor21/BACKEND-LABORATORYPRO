connect system/0000

show con_name

ALTER SESSION SET CONTAINER=CDB$ROOT;
ALTER DATABASE OPEN;

DROP TABLESPACE ts_proyectosppi INCLUDING CONTENTS and DATAFILES;
    
CREATE TABLESPACE ts_proyectosppi LOGGING
DATAFILE 'C:\CBDI-2023\BASES DE DATOS\PPI\DF_proyectosppi01.dbf' size 2M
extent management local segment space management auto; 
 
alter session set "_ORACLE_SCRIPT"=true; 
 
drop user us_proyectoppi cascade;
    
CREATE user us_proyectoppi profile default 
identified by 0000
default tablespace ts_proyectosppi
temporary tablespace temp 
account unlock;     

--privilegios
grant connect, resource,dba to us_proyectoppi; 

connect us_proyectoppi/0000

show user