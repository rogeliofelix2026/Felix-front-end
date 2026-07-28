# FARO - Landing informativa

Landing estática del widget de accesibilidad FARO para Moodle.

## Estructura

- `index.html`: contenido y estructura semántica de la página.
- `style2.css`: identidad visual, estados accesibles y diseño responsive.
- `script.js`: menú mobile y demo interactiva de preferencias.
- `imagen/faro-icono.png`: recurso gráfico oficial de FARO.

El proyecto usa HTML, CSS y JavaScript nativo. No utiliza React ni requiere dependencias para funcionar.

## Demo local

La opción **Probar la demo** aplica algunos ajustes sobre la propia landing y conserva las preferencias en el navegador cuando el almacenamiento está disponible.

Esta demostración no reemplaza al plugin: la experiencia completa de FARO funciona integrada en Moodle.

## Pendientes antes de producción

- Definir el destino real de **Contacto**: correo institucional, formulario, WhatsApp u otro canal acordado por el equipo. Hasta entonces, el botón de esa sección abre la demo.
- Validar que las funcionalidades descriptas en la landing coincidan con la versión de FARO instalada en Moodle.
- Realizar pruebas autenticadas en Moodle para comprobar integración, persistencia de preferencias y separación entre usuarios.
- Confirmar el sitio y la URL oficial de publicación. Utilizar un Deploy Preview para la revisión del Pull Request antes de actualizar producción.

## Trabajo en Git

Los cambios deben realizarse en una rama de trabajo y revisarse mediante un Pull Request antes de incorporarlos a `main`.
