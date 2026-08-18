const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('escuela.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS alumnos (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    seccion TEXT NOT NULL,
    edad INTEGER
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS cursos (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS inscripciones (
    alumno_id INTEGER,
    curso_id INTEGER,
    FOREIGN KEY (alumno_id) REFERENCES alumnos(id),
    FOREIGN KEY (curso_id) REFERENCES cursos(id)
  )
`);

const alumnos = [
  { nombre: 'Ana', seccion: '1114', edad: 19 },
  { nombre: 'Luis', seccion: '1114', edad: 21 },
  { nombre: 'Marta', seccion: '1113', edad: 20 },
  { nombre: 'Pedro', seccion: '1114', edad: 18 },
];

const insertAlumno = db.prepare('INSERT INTO alumnos (nombre, seccion, edad) VALUES (?, ?, ?)');
for (const a of alumnos) {
  insertAlumno.run(a.nombre, a.seccion, a.edad);
}

const insertCurso = db.prepare('INSERT INTO cursos (nombre) VALUES (?)');
insertCurso.run('Programación Web');
insertCurso.run('Base de Datos');

const insertInscripcion = db.prepare('INSERT INTO inscripciones (alumno_id, curso_id) VALUES (?, ?)');
insertInscripcion.run(1, 1);
insertInscripcion.run(1, 2);
insertInscripcion.run(2, 2);

console.log('--- ETAPA 4: Consultas SELECT ---');

const selSeccion = db.prepare('SELECT * FROM alumnos WHERE seccion = ?');
console.log('Alumnos de 1114:', selSeccion.all('1114'));

const selMayores = db.prepare('SELECT nombre, edad FROM alumnos WHERE edad >= ? ORDER BY edad');
console.log('Mayores de 20:', selMayores.all(20));

const selPrimero = db.prepare('SELECT * FROM alumnos ORDER BY edad DESC LIMIT 1');
console.log('El más grande:', selPrimero.get());

const selCuenta = db.prepare('SELECT COUNT(*) AS total FROM alumnos');
console.log('Total de alumnos:', selCuenta.get());

console.log('\n--- ETAPA 5: Update y Delete ---');

const actualizar = db.prepare('UPDATE alumnos SET edad = ? WHERE nombre = ?');
const cambio = actualizar.run(22, 'Ana');
console.log('Filas actualizadas (Ana):', cambio.changes);

const borrar = db.prepare('DELETE FROM alumnos WHERE nombre = ?');
const borrado = borrar.run('Marta');
console.log('Filas borradas (Marta):', borrado.changes);

console.log('\n--- ETAPA 6: Conversión a JSON ---');

const rows = selSeccion.all('1114');
const json = JSON.stringify(rows, null, 2);
console.log('Consulta en formato JSON:');
console.log(json);

console.log('\n--- ETAPA 7: Respuestas del Desafío ---');

const queryBaseDatos = db.prepare(`
  SELECT alumnos.nombre 
  FROM alumnos
  JOIN inscripciones ON alumnos.id = inscripciones.alumno_id
  JOIN cursos ON cursos.id = inscripciones.curso_id
  WHERE cursos.nombre = ?
`);
console.log('1. Alumnos en Base de Datos:', queryBaseDatos.all('Base de Datos'));

const queryCuentaCursos = db.prepare(`
  SELECT alumnos.nombre, COUNT(inscripciones.curso_id) AS total_cursos
  FROM alumnos
  LEFT JOIN inscripciones ON alumnos.id = inscripciones.alumno_id
  GROUP BY alumnos.id
`);
console.log('2. Cantidad de cursos por alumno:', queryCuentaCursos.all());