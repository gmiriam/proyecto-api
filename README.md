# Proyecto-api

## Instalación

1. Ejecutar Mongodb.
2. Ejecutar con `npm start`
3. Consultar a la ruta

## Servicios

### Usuario

#### GET

* FindAll: Encuentra todos los usuarios.
	* Parámetros de consulta. La lista de usuarios se filtrará dependiendo de éstos.
		* Rol (role)
		* Email (email)
		* Asignatura matriculada (enrolledsubjectid)
		* Tarea asignada (assignedtaskid)
	* Ruta: /user/
	* Ejemplo de uso: /user?role=student

* FindById: Encuentra el usuario dado un id.
	* Ruta: /user/:userid
	* Ejemplo de uso: /user/589e13d7a5347c2b903284b7

#### POST
* Create: Crea un usuario.
	* Campos de entrada:
		* Nombre (firstName)
		* Apellidos (surname)
		* Correo (email)
		* Contraseña (password)
	* Rol (role)
	* Ruta: /user/
	* Ejemplo JSON de entrada:
	`{"firstName": "Ana",
	"surname": "Pérez",
	"email": "ana@ull.es",
	"password": "123",
	“role”:”teacher”}`

#### PUT
* Update: Actualiza la información de un usuario.
	* Campos de entrada:
		* Nombre (firstName)
		* Apellidos (surname)
		* Correo (email)
		* Contraseña (password)
		* Rol (role)
	* Ruta: /user/:userid
	* Ejemplo de uso:/user/589e13d7a5347c2b903284b7
	* Ejemplo JSON de entrada:
	`{"firstName": "Ana",
	"surname": "Pérez",
	"email": "ana@ull.es",
	"password": "123",
	“role”:”teacher”}`

#### DELETE
* Delete: Eliminará al usuario
	* Ruta: /user/:userid
	* Ejemplo de uso: /user/589e13d7a5347c2b903284b7

### Asignatura

#### GET
* FindAll: Encuentra todas las asignaturas.
	* Parámetros de consulta. La lista de asignaturas se filtrará dependiendo de éstos.
		* Usuario (userid): listará las asignaturas matriculadas por el usuario.
	* Ruta: /subject/
	* Ejemplo de uso:/subject?userid=589e13d7a5347c2b903284b7

* FindById: Encuentra la asignatura dado un id.
	* Ruta: /subject/:subjectid
	* Ejemplo de uso: /subject/5658462bf279e74810f97cec

#### POST
* Create: Crea una asignatura.
	* Campos de entrada:
		* Nombre (name)
		* Descripción (description)
		* Temario (temary)
		* Profesores (teachers)
	* Ruta: /subject/
	* Ejemplo JSON de entrada:
	`{"name": "Programación",
	"description": "Se estudiará las bases de la programación",
	"temary": "dd715d82-9bef-4707-987f-6aaf5a96dfc5.pdf” ,
	“teachers":  ["56617b80ae5bc6580fac7efd"] }`

* EnrollStudents: Matricula una lista de alumnos en una asignatura.
	* Campos de entrada:
		* Asignatura (subject)
		* Estudiantes(students)
	* Ruta: /subject/enrollstudents
	* Ejemplo JSON de entrada:
	`{"subject": "5658462bf279e74810f97cec",
	“students":["56617b80ae5bc6580fac7efd", ”589e13d7a5347c2b903284b7”] }`

* UnenrollStudents: Desmatricula una lista de alumnos de una asignatura..
	* Campos de entrada:
		* Asignatura (subject)
		* Estudiantes(students)
	* Ruta: /subject/unenrollstudents
	* Ejemplo JSON de entrada:
	`{"subject": "5658462bf279e74810f97cec",
	“students":["56617b80ae5bc6580fac7efd", ”589e13d7a5347c2b903284b7”] }`

#### PUT
* Update: Actualiza la información de una asignatura.
	* Campos de entrada:
		* Nombre (name)
		* Descripción (description)
		* Temario (temary)
		* Profesores (teachers)
	* Ruta: /subject/:subjectid
	* Ejemplo de uso: /subject/56617882ae5bc6580fac7efa
	* Ejemplo JSON de entrada:
	`{"name": "Programación",
	"description": "Se estudiará las bases de la programación",
	"temary": "dd715d82-9bef-4707-987f-6aaf5a96dfc5.pdf” ,
	“teachers":  ["56617b80ae5bc6580fac7efd"] }`

#### DELETE
* Delete: Eliminará la asignatura.
	* Ruta: /subject/subjectid
	* Ejemplo de uso:/user/5658462bf279e74810f97cec

### Tarea

#### GET
* FindAll: Encuentra todas las tareas.
	* Parámetros de consulta. La lista de tareas se filtrará dependiendo de éstos.
		* Asignatura (subjectid): listará las tareas de una asignatura.
		* Usuario (userid): encuentra las asignaturas asignadas a un usuario.
	* Ruta: /task/
	* Ejemplo de uso: /task?subjectid=5658462bf279e74810f97cec

* FindById: Encuentra la tarea dado un id.
	* Ruta: /task/:taskid
	* Ejemplo de uso:/task/589e13d7a5347c2b903284b7

#### POST
* Create: Crea una asignatura.
	* Campos de entrada:
		* Nombre (name)
		* Enunciado (statement)
		* Fecha de inicio (startDate)
		* Fecha de finalización (endDate)
		* Nota máxima (maxScore)
		* Profesor (teacher)
		* Asignatura (subject)
		* Tests de evaluación (evaluationTests)
		* Adjunto (attached)
	* Ruta: /task/
	* Ejemplo JSON de entrada:
	`{"name": "Nociones básicas",
	"statement": “Aprender nociones básicas",
	"maxScore": 100,
	"teacher": "5894d4d85e434a1dbc2114d0",
	"subject": "589e13d7a5347c2b903284b7",
	"startDate": "2017-01-01T09:22:00.000Z",
	"endDate": "2017-02-23T18:30:00.000Z",
	"attached": "efd36794-cc39-4d1e-95bc-3eeb95a72831.pdf",
	"evaluationTest": "79727038-4bb8-40c6-aeec-876ae6e6df3b.js"}`

* Assign: Asigna a una lista de alumnos una tarea.
	* Campos de entrada:
		* Tarea (task)
		* Estudiantes (students)
	* Ruta: /task/assign
	* Ejemplo JSON de entrada:
	`{"task": "589391ed32706710707928bb",
	“students":	["56617b80ae5bc6580fac7efd", ”589e13d7a5347c2b903284b7”] }`

* Unassign: Desasigna una lista de alumnos de una tarea.
	* Campos de entrada:
		* Tarea (task)
		* Estudiantes (students)
	* Ruta: /task/unassign
	* Ejemplo JSON de entrada:
	`{"task": "589391ed32706710707928bb",
	“students":	["56617b80ae5bc6580fac7efd", ”589e13d7a5347c2b903284b7”] }`

#### PUT
* Update: Actualiza la información de una tarea.
	* Campos de entrada:
		* Nombre (name)
		* Enunciado (statement)
		* Fecha de inicio (startDate)
		* Fecha de finalización (endDate)
		* Nota máxima (maxScore)
		* Profesor (teacher)
		* Asignatura (subject)
		* Tests de evaluación (evaluationTests)
		* Adjunto (attached)
	* Ruta: /task/:taskid
	* Ejemplo de uso:	/task/589391ed32706710707928bb
	* Ejemplo JSON de entrada:
	`{"name": "Nociones básicas",
	"statement": “Aprender nociones básicas",
	"maxScore": 100,
	"teacher": "5894d4d85e434a1dbc2114d0",
	"subject": "589e13d7a5347c2b903284b7",
	"startDate": "2017-01-01T09:22:00.000Z",
	"endDate": "2017-02-23T18:30:00.000Z",
	"attached": "efd36794-cc39-4d1e-95bc-3eeb95a72831.pdf",
	"evaluationTest": "79727038-4bb8-40c6-aeec-876ae6e6df3b.js"}`

#### DELETE
* Delete: Eliminará la tarea
	* Ruta: /task/:taskid
	* Ejemplo de uso:/task/589391ed32706710707928bb
### Entrega

#### GET
* FindAll: Encuentra todas las entregas.
	* Parámetros de consulta. La lista de entregas se filtrará dependiendo de éstos.
		* Tarea (taskid): listará las entregas efectuadas para una tarea.
		* Estudiante (studentid): listará las entregas de este estudiante
	* Ruta: /delivery/
	* Ejemplo de uso: /delivery?studentid=589e13d7a5347c2b903284b7

* FindById: Encuentra la entrega dado un id.
	* Ruta: /delivery/:deliveryid
	* Ejemplo de uso: /delivery/5658462bf279e74810f97cec

#### POST
* Create: Crea una entrega.
	* Campos de entrada:
		* Tarea (task)
		* Estudiante (student)
		* Nota (score)
		* Información (data)
	* Ruta: /delivery/
	* Ejemplo JSON de entrada:
	`{"task": "56617b80ae5bc6580fac7efd",
	"student": "56583af9a0139514036bc3d4",
	"score": 1
	"data": "79919039-cc39-4d1e-95bc-3eeb95a72831.zip”}`

#### PUT
* UpdateScore: Actualiza la nota de la entrega.
	* Campos de entrada:
		* Nota (score)
		* Ruta: /delivery/:deliveryid/updatescore
	* Ejemplo de uso:	/delivery/5658462bf279e74810f97cec/updatescore
	* Ejemplo JSON de entrada:
	`{"score": 1}`

* UpdateData: Actualiza la información de la entrega.
	* Campos de entrada:
		* Información (data)
		* Ruta: /delivery/:deliveryid/updatedata
	* Ejemplo de uso: /delivery/5658462bf279e74810f97cec/updatedata
	* Ejemplo JSON de entrada:
	`{"data": "79919039-cc39-4d1e-95bc-3eeb95a72831.zip”}`

#### DELETE
* Delete: Eliminará la entrega
	* Ruta: /delivery/:deliveryid
	* Ejemplo de uso: /delivery/5658462bf279e74810f97cec

### Nota

#### GET
* FindAll: Encuentra todas las notas.
	* Parámetros de consulta. La lista de notas se filtrará dependiendo de éstos.
		* Estudiante (studentid): listará las notas finales del estudiante.
		* Asignatura (subjectid): listará las notas finales de una asignatura.
	* Ruta: /score/
	* Ejemplo de uso: /score?studentid=589e13d7a5347c2b903284b7

* FindById: Encuentra la nota dado un id.
	* Ruta: /score/:score
	* Ejemplo de uso: /score/56617882ae5bc6580fac7efa

#### PUT
* Update: Actualiza la información de una nota.
	* Campos de entrada:
		* Nota final (finalScore)
	* Ruta: /score/:scoreid
	* Ejemplo de uso: /score/56617882ae5bc6580fac7efa
	* Ejemplo JSON de entrada:
	`{"finalScore": 10}`
