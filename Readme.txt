1º.- Ejecutar Mongodb.

2º.- Ejecutar la aplicación con node app

Direcciones:
Administradores: 
http://localhost:3000/admin/findAll
http://localhost:3000/admin/findById/:id
http://localhost:3000/admin/add
http://localhost:3000/admin/update/:id


localhost:3000/api/courses
localhost:3000/api/deliveries
localhost:3000/api/scores
localhost:3000/api/students
localhost:3000/api/subjects
localhost:3000/api/tasks
localhost:3000/api/teachers
localhost:3000/api/users

Para consultar un restClient como el rest easy en firefox.

Admin Example:
{
	"firstName": "Pedro",
	"surname": "Pérez",
	"email": "pedro@hotmail.com",
	"password": "contraseña123"
}

Course Example: 
{
	"name": "primero",
}
	"subjects": [,] --> IDs del subject?? Por ahora no.

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

Subject Example: 
{
  "name": "Mates",
  "course": "56617975ae5bc6580fac7efb",
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

User Example: 
{
 "firstName":"Lola",
 "surname":"Lopez",
 "email":"lola@lola.com",
 "password":"secure123"
}

