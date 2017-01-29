# proyecto-api

## Ejemplos de uso

* 1º.- Ejecutar Mongodb.

* 2º.- Ejecutar la aplicación con node app

* 3º.- Consultar a una ruta

Direcciones:
Administradores: 
http://localhost:3000/admin/findAll
http://localhost:3000/admin/findById/:id
http://localhost:3000/admin/add
http://localhost:3000/admin/update/:id
http://localhost:3000/admin/delete/:id

Entregas:
http://localhost:3000/delivery/findAll
http://localhost:3000/delivery/findById/:id
http://localhost:3000/delivery/add
http://localhost:3000/delivery/update/:id
http://localhost:3000/delivery/delete/:id

Calificaciones:
http://localhost:3000/score/findAll
http://localhost:3000/score/findById/:id
http://localhost:3000/score/add
http://localhost:3000/score/update/:id
http://localhost:3000/score/delete/:id

Estudiantes:
http://localhost:3000/student/findAll
http://localhost:3000/student/findById/:id
http://localhost:3000/student/add
http://localhost:3000/student/update/:id
http://localhost:3000/student/delete/:id

Asignaturas:
http://localhost:3000/subject/findAll
http://localhost:3000/subject/findById/:id
http://localhost:3000/subject/add
http://localhost:3000/subject/update/:id
http://localhost:3000/subject/delete/:id

Tareas:
http://localhost:3000/task/findAll
http://localhost:3000/task/findById/:id
http://localhost:3000/task/add
http://localhost:3000/task/update/:id
http://localhost:3000/task/delete/:id

Profesores:
http://localhost:3000/teacher/findAll
http://localhost:3000/teacher/findById/:id
http://localhost:3000/teacher/add
http://localhost:3000/teacher/update/:id
http://localhost:3000/teacher/delete/:id


Para consultar un restClient como el rest easy en firefox.

Admin Example:
{
	"firstName": "Pedro",
	"surname": "Pérez",
	"email": "pedro@hotmail.com",
	"password": "contraseña123"
}


Delivery Example: 
{
	"task": "56617b80ae5bc6580fac7efd",
	"student": "56583af9a0139514036bc3d4",
	"score": 1,
	"data": "www.google.com"
}
Score Example:
{
   "student": "56583af9a0139514036bc3d4",
   "subject": "5658462bf279e74810f97cec",
   finalScore: 1
}

Student Example:
{
	"firstName": "Lola",
	"surname": "Lopez",
	"email": "lolalo@hotmail.com",
	"password": "lolalo",
	"subjects": ["56617b80ae5bc6580fac7efd"],
	"tasks": ["56617b80ae5bc6580fac7efd"]
}

Subject Example: 
{
  "name": "Mates",
  "description": "Estudiaremos las base de toda ciencia",
  "temary"  : "Tema 1: sumas de números naturales. Tema 2: restas de números naturales."
}

Task Example:
{
   "name": "Ejercicio 1",
   "statement": "Hacer 2+2 en ensamblador",
   "startDate": "2012-04-21T18:25:43-05:00",
   "endDate": "2012-04-21T18:25:43-06:00",
   "maxScore": "10",
   "teacher": "56617882ae5bc6580fac7efa"
}

Teacher Example:
{
	"firstName": "María",
	"surname": "Padrón",
	"email": "mariap@hotmail.com",
	"password": "password",
	"subjects": ["56617b80ae5bc6580fac7efd"]
}

