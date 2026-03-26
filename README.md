# CERCAreport

Descripción
CERCAreport es una aplicación desarrollada principalmente en TypeScript para generar, visualizar y exportar reportes. Proporciona una base tipada y modular para crear pipelines de reporte y vistas web con estilos mínimos en CSS.

Estado
En desarrollo.

Composición de lenguajes
- TypeScript: 97.8%
- CSS: 1.3%
- Otros: 0.9%

Características
- Núcleo escrito en TypeScript para seguridad de tipos y mejor mantenibilidad.
- Estructura modular y fácil de extender.
- Scripts para desarrollo, compilación y pruebas.

Requisitos
- Node.js (versión LTS recomendada)
- npm o yarn

Instalación
1. Clona el repositorio:
   git clone https://github.com/FranciscoLavinCarpanetti/cercareport.git
2. Entra al directorio del proyecto:
   cd cercareport
3. Cambia a la rama Develop (si no existe, créala desde Develop en remoto):
   git checkout Develop
4. Instala dependencias:
   npm install
   (o) yarn install

Uso
- Desarrollo (modo observador / hot-reload):
  npm run dev
- Compilar para producción:
  npm run build
- Ejecutar la aplicación compilada (si aplica):
  npm start

Scripts recomendados (ajusta en package.json según el proyecto)
- "dev": modo desarrollo con watch
- "build": compilación TypeScript -> JavaScript
- "start": iniciar la aplicación compilada
- "test": ejecutar pruebas unitarias
- "lint": ejecutar linters (eslint/prettier)

Configuración
- Variables de entorno: crea un archivo .env a partir de .env.example (si existe) y define las variables necesarias (por ejemplo: DATABASE_URL, API_KEY, NODE_ENV).
- TypeScript: ajusta tsconfig.json según tu entorno.
- Linter/formato: configura .eslintrc/.prettierrc según tus preferencias.

Pruebas
- Ejecuta:
  npm test
- Añade más tests en la carpeta de pruebas (por ejemplo: tests/ o src/__tests__/).

Cómo contribuir
1. Haz fork del repositorio.
2. Crea una rama descriptiva: git checkout -b feature/mi-mejora
3. Realiza tus cambios y añade tests.
4. Abre un pull request detallando los cambios y la razón.
5. Respeta las convenciones de código y añade documentación cuando sea necesario.

Guía de estilo
- Usa TypeScript estricto cuando sea posible.
- Añade comentarios JSDoc para funciones públicas.
- Mantén los commits atómicos y con mensajes claros.

Problemas y soporte
- Abre un issue en GitHub describiendo el problema o la mejora propuesta.
- Incluye pasos para reproducir, logs y la versión de Node.js/TypeScript que usas.

Licencia
Este proyecto se distribuye bajo la Licencia MIT. Consulta el archivo LICENSE para el texto completo.

Créditos
- Autor: FranciscoLavinCarpanetti

---