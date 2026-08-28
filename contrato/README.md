# Contrato de API y Mock Data — SP2

Esta carpeta contiene las especificaciones de los endpoints acordados entre Frontend y Backend, así como los esquemas JSON de prueba para el desarrollo paralelo.

## Endpoints acordados (Borrador inicial)
- `GET /api/grafo/matematicas-3`: Devuelve los temas y dependencias de la unidad.
- `GET /api/aula/estado`: Devuelve la cuadrícula de pupitres del profesor con niveles de dominio.
- `POST /api/alumno/respuesta`: Envía la respuesta de un ejercicio y devuelve la ruta actualizada.
- `GET /api/padre/resumen/:alumno_id`: Devuelve las bandas de dominio y recomendaciones del hogar.
