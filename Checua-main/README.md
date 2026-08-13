<div align="center">

# Checua

### Plataforma de reservas para experiencias turísticas en el Desierto de Checua

Aplicación web moderna para consultar planes, registrar participantes y completar reservas de experiencias ofrecidas por **Adrenaline Colombia**.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel)](https://vercel.com/)

</div>

---

## Descripción

**Checua** centraliza el proceso de reserva de actividades turísticas en el Desierto de Checua. Su flujo guiado permite seleccionar una experiencia, consultar fechas y horarios disponibles, registrar al responsable y sus acompañantes, revisar el valor estimado y acceder a las instrucciones de pago.

La aplicación utiliza **Supabase** para consultar y almacenar la información operativa, ofrece una experiencia bilingüe y está preparada para desplegarse como una aplicación de página única (SPA) en **Vercel**.

## Funcionalidades

- Consulta dinámica de experiencias y precios.
- Selección de fechas según la disponibilidad de cada plan.
- Horarios variables y asignación automática de horarios fijos.
- Registro y validación de los datos del responsable.
- Gestión de acompañantes y participantes.
- Validación internacional de números telefónicos.
- Cálculo del valor total estimado.
- Resumen completo antes de continuar con el pago.
- Información de abono y medios de pago.
- Envío del comprobante mediante WhatsApp.
- Interfaz en español e inglés.
- Temas claro y oscuro.
- Diseño adaptable para móviles y computadores.
- Persistencia de clientes, participantes, planes y reservas con Supabase.

## Tecnologías

| Tecnología | Propósito |
| --- | --- |
| [React 19](https://react.dev/) | Interfaz de usuario |
| [Vite 8](https://vite.dev/) | Desarrollo y compilación |
| [Supabase](https://supabase.com/) | Base de datos y servicios |
| [React Router](https://reactrouter.com/) | Navegación |
| [i18next](https://www.i18next.com/) | Internacionalización |
| [Tailwind CSS](https://tailwindcss.com/) | Utilidades de estilos |
| [libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js) | Validación telefónica |
| [ESLint](https://eslint.org/) | Calidad del código |
| [Vercel](https://vercel.com/) | Despliegue |

## Requisitos

- [Node.js](https://nodejs.org/) 20 o superior.
- npm 10 o superior.
- Un proyecto de Supabase configurado para la aplicación.

## Instalación local

1. Clona el repositorio:

```bash
git clone https://github.com/Eduar-Construcciones-S-A-S/Checua.git
cd Checua/Checua-main
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea `.env.local` en la carpeta `Checua-main`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
```

4. Inicia el entorno de desarrollo:

```bash
npm run dev
```

5. Abre la dirección indicada por Vite, normalmente `http://localhost:5173`.

> [!IMPORTANT]
> Las variables `VITE_` son visibles desde el navegador. Utiliza solamente la clave pública `anon` de Supabase. Nunca incluyas una clave `service_role` en el frontend ni en el repositorio.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor local con recarga automática |
| `npm run build` | Genera la versión optimizada en `dist/` |
| `npm run preview` | Previsualiza la compilación de producción |
| `npm run lint` | Analiza el código con ESLint |

## Estructura

```text
Checua-main/
├── public/                 # Iconos y archivos públicos
├── src/
│   ├── assets/             # Recursos visuales
│   ├── components/         # Formularios, selectores y modales
│   ├── config/             # Configuración de pagos
│   ├── lib/                # Cliente de Supabase
│   ├── locales/            # Traducciones en español e inglés
│   ├── pages/              # Páginas de la aplicación
│   ├── services/           # Acceso a datos y persistencia
│   ├── utils/              # Utilidades y catálogos
│   ├── App.jsx             # Estado y flujo principal
│   ├── i18n.js             # Configuración de idiomas
│   └── main.jsx            # Punto de entrada
├── index.html
├── package.json
├── vercel.json
└── vite.config.js
```

## Flujo de reserva

1. El visitante proporciona su teléfono y acepta la política de tratamiento de datos.
2. Selecciona una experiencia disponible.
3. Registra los datos del responsable.
4. Escoge una fecha y un horario válidos para el plan.
5. Añade acompañantes cuando corresponde.
6. Revisa el resumen y el valor estimado.
7. Consulta las instrucciones de pago.
8. Envía el comprobante por WhatsApp para validar la reserva.

## Configuración de pagos

Los medios de pago, el beneficiario y el número oficial de WhatsApp se administran en:

```text
src/config/paymentConfig.js
```

> [!WARNING]
> Antes de publicar la aplicación, reemplaza todos los valores marcados como `PLACEHOLDER` por información verificada. No almacenes credenciales privadas ni secretos bancarios en el código.

## Internacionalización

Los textos se encuentran en:

```text
src/locales/es/translation.json
src/locales/en/translation.json
```

Para agregar un idioma, crea el archivo de traducción correspondiente y regístralo en `src/i18n.js`.

## Verificación

Antes de integrar o desplegar cambios, ejecuta:

```bash
npm run lint
npm run build
```

Ambos comandos deben finalizar correctamente.

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Establece `Checua-main` como directorio raíz del proyecto.
3. Configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
4. Usa `npm run build` como comando de compilación.
5. Usa `dist` como directorio de salida.
6. Inicia el despliegue.

El archivo `vercel.json` contiene la regla necesaria para resolver correctamente las rutas de la SPA.

## Contribución

1. Crea una rama desde `main`.
2. Implementa cambios pequeños y claramente documentados.
3. Ejecuta el lint y la compilación.
4. Usa mensajes de commit descriptivos.
5. Abre un pull request explicando el propósito del cambio.

```bash
git checkout -b feat/nueva-funcionalidad
git commit -m "feat: agrega nueva funcionalidad"
git push origin feat/nueva-funcionalidad
```

## Mantenimiento

Proyecto mantenido por **Eduar Construcciones S.A.S.**

Repositorio: [Eduar-Construcciones-S-A-S/Checua](https://github.com/Eduar-Construcciones-S-A-S/Checua)

---

<div align="center">

**Checua — experiencias memorables, reservas sencillas.**

</div>
