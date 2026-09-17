-- Catalogo de productos tal como lo entrego el equipo.
-- Los precios no estan: faltan por definir con la empresa.

USE gf_menudeo;

INSERT INTO producto (codigo, nombre, presentacion, talla) VALUES
    ('CAM-001',    'Camarón', 'Frizado sin cabeza',              '91/110'),
    ('CAM-002',    'Camarón', 'Frizado sin cabeza',              '71/90'),
    ('CAM-003',    'Camarón', 'Frizado sin cabeza',              '61/70'),
    ('CAM-004',    'Camarón', 'Frizado sin cabeza',              '51/60'),
    ('CAM-005',    'Camarón', 'Frizado sin cabeza',              '41/50'),
    ('CAM-006',    'Camarón', 'Frizado sin cabeza',              '31/40'),
    ('CAM-007',    'Camarón', 'Frizado sin cabeza',              '26/30'),
    ('CAM-008',    'Camarón', 'Frizado sin cabeza',              '21/25'),
    ('CAM-PD-001', 'Camarón', 'Pelado y desvenado',              '51/60'),
    ('CAM-PD-002', 'Camarón', 'Pelado y desvenado',              '41/50'),
    ('CAM-PD-003', 'Camarón', 'Pelado y desvenado',              '31/40'),
    ('CAM-PD-004', 'Camarón', 'Pelado y desvenado',              '26/30'),
    ('CAM-PD-005', 'Camarón', 'Pelado y desvenado',              '21/25'),
    ('TIL-001',    'Tilapia', 'Entera / presentación comercial', NULL),
    ('PUL-001',    'Pulpo',   'Presentación comercial',          NULL);

-- TODO: confirmar las zonas reales de reparto con la empresa.
INSERT INTO zona_reparto (nombre, municipio, minutos_estimados) VALUES
    ('Centro',     'Culiacán', 20),
    ('Tres Ríos',  'Culiacán', 25);
