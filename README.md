# Taller RxJS: búsqueda de perfiles

Aplicación Angular de una sola página para consultar perfiles en [DummyJSON](https://dummyjson.com/). El componente principal consulta la API usando `HttpClient` y se suscribe a los resultados con RxJS. Los componentes de perfil y publicaciones reciben sus datos con `@Input`.

## Ejecutar el proyecto

```bash
npm install
npm start
```

Abre `http://localhost:4200/` y busca un username. Por ejemplo, `emilys`.

> El username `atuny0` que aparece como ejemplo en el enunciado ya no está disponible en la API actual; `emilys` sí existe.

## Consultas

- `GET /users/filter?key=username&value={username}` para buscar el usuario.
- `GET /posts/user/{userId}` para cargar sus publicaciones.
- `GET /comments/post/{postId}` para cargar los comentarios de cada publicación.

## Verificar

```bash
npm test -- --watch=false
npm run build
```
