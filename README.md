# Challenge Backend

El presente proyecto corresponde a la entrega final del curso Full Stack de Start Coding IA.

Se debe implementar una biblioteca virtual.

* Los usuarios deben poder registrarse y loguearse.
* Se deben implementar operaciones CRUD para los usuarios, autores y libros.
* El usuario debe estar autorizado para poder realizar las distintas operaciones.
* Los usuarios pueden retirar hasta 3 libros. Y tienen 7 días para devolverlos.
* Al momento de devolver un libro, se le informa al usuario por medio de un email si el libro fue devuelto a tiempo o si debera pagar una penalización.
* Una vez por semana se debe enviar a la administración un informe con el estado de los libros. Es decir:
  - Qué libros estan disponibles.
  - Qué libros estan prestados.
  - Qué libros estan en penalización.
* Una vez por día se chequean los libros que esten en penalización, y se le informa al usuario por email que debe devolverlo.

Funcionalidades no implementadas hasta el momento:
* Se debe validar la casilla de correo del usuario al momento del registro.
* El usuario debe poder recuperar su contraseña.
