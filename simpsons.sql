-- CREACIÓN DE TABLAS--
CREATE TABLE `frases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `texto` varchar(45) NOT NULL,
  `marca_tiempo` time DEFAULT NULL,
  `descripcion` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `personajes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `apellidos` varchar(45) NOT NULL,
  `ocupacion` varchar(45) DEFAULT NULL,
  `decripcion` tinytext,
  PRIMARY KEY (`id`)
);

CREATE TABLE `capitulos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(45) NOT NULL,
  `numero_episodio` int DEFAULT NULL,
  `temporada` int DEFAULT NULL,
  `fecha_emision` date DEFAULT NULL,
  `sinopsis` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `personajes_has_capitulos` (
  `personajes_id` int NOT NULL,
  `personajes_frases_id` int NOT NULL,
  `capitulos_id` int NOT NULL,
  PRIMARY KEY (`personajes_id`,`personajes_frases_id`,`capitulos_id`),
  KEY `fk_personajes_has_capitulos_capitulos1_idx` (`capitulos_id`),
  KEY `fk_personajes_has_capitulos_personajes1_idx` (`personajes_id`,`personajes_frases_id`),
  CONSTRAINT `fk_personajes_has_capitulos_capitulos1` FOREIGN KEY (`capitulos_id`) REFERENCES `capitulos` (`id`),
  CONSTRAINT `fk_personajes_has_capitulos_personajes1` FOREIGN KEY (`personajes_id`, `personajes_frases_id`) REFERENCES `personajes` (`id`, `frases_id`)
);


--INSERCIÓN DE FILAS DE LA TABLA FRASES--

INSERT INTO frases (texto,descripcion)
VALUES
('¡Doh!', 'Frase clásica de Homer'),
('¡Ay caramba!', 'Frase clásica de Bart'),
('Excelente...', 'Frase de Mr. Burns');








































INSERT INTO frases (texto)
VALUE ('¡Doh!');
INSERT INTO frases (texto)
VALUE ('¡Ay,caramba!');
INSERT INTO frases (texto)
VALUE ('¡Excelente!');

INSERT INTO personajes(nombre,apellidos,ocupacion)
VALUE('Homer', 'Simpson', 'supervisor');
INSERT INTO personajes(nombre,apellidos,ocupacion)
VALUE('Bart', 'Simpson', 'estudiante');
INSERT INTO personajes(nombre,apellidos,ocupacion)
VALUE('Montgomery', 'Burns', 'jefe')

