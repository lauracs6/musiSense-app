# MusiSense - Streaming Musical

MusiSense es una aplicación web de streaming musical que permite explorar un catálogo de canciones, álbumes, artistas y géneros, así como crear y gestionar playlists de forma interactiva. Construida con Laravel (API REST) y React (SPA), ofrece un reproductor persistente y una experiencia de usuario fluida.

## Repositorios

- Backend (API Laravel): [https://github.com/tu-usuario/musisense](https://github.com/tu-usuario/musisense)
- Frontend (React): [https://github.com/tu-usuario/musiSense-app](https://github.com/tu-usuario/musiSense-app)

## Características principales

- Reproductor persistente con cola, shuffle y controles de volumen.
- Gestión dinámica de playlists: crear, editar, eliminar, añadir/eliminar canciones y reordenar mediante drag & drop.
- Búsqueda en tiempo real de canciones, álbumes y artistas con debounce.
- Panel de administración completo (CRUD de usuarios, géneros, artistas, álbumes, canciones y playlists).
- Actualización en tiempo real mediante polling selectivo y eventos personalizados.
- Diseño responsive con Tailwind CSS y modo oscuro.

## Tecnologías utilizadas

- Backend: Laravel 13, MySQL, Sanctum, getID3
- Frontend: React 18, Vite, Tailwind CSS, Axios, Lucide React, @hello-pangea/dnd
- Entorno: Laragon (Apache, MySQL, PHP 8.2)

## Requisitos previos

- PHP >= 8.2
- Composer
- MySQL >= 8.0
- Node.js >= 18
- npm o yarn

## Instalación

### 1. Clonar los repositorios


# Backend
```Bash
git clone https://github.com/tu-usuario/musisense.git
cd musisense
```

# Frontend (en otra carpeta)
```Bash
git clone https://github.com/tu-usuario/musiSense-app.git
cd musisense-app
```

### 2. Configurar el backend

```Bash
cd musisense
composer install
cp .env.example .env   # Configurar base de datos y APP_URL
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
```

Asegúrate de que `APP_URL=http://musisense.test` y que tienes un servidor virtual apuntando a la carpeta `public`.

---

## 3. Configurar el frontend

```bash
cd musisense-app
npm install
cp .env.example .env   # Ajustar VITE_API_URL si es necesario
npm run dev
```

El frontend se servirá en `http://localhost:5173` por defecto.

---

## 4. Configuración del servidor virtual (Laragon recomendado)

Crea un sitio para el backend con dominio `musisense.test` apuntando a la carpeta `public` de Laravel.

Asegúrate de que en `config/sanctum.php` y `config/cors.php` los dominios permitidos incluyan:

- `localhost:5173`
- `musisense.test`

---

## Importación de música

Desde la carpeta del backend, ejecuta:

```bash
php artisan music:import "C:\ruta\a\la\carpeta\de\musica"
```

El comando extrae metadatos mediante **getID3**, normaliza artistas/álbumes/géneros y asigna números de pista consecutivos.

---

# API Endpoints principales

## Públicos

- `POST /api/login`
- `POST /api/register`
- `GET /api/tracks/{track}/stream`

## Protegidos (requieren token y usuario activo)

- `GET /api/genres`
- `GET /api/artists`
- `GET /api/albums`
- `GET /api/tracks`
- `GET /api/search`
- `GET /api/playlists`
- `POST /api/playlists`
- `GET|PUT|DELETE /api/playlists/{id}`
- `POST /api/playlists/{id}/tracks`
- `DELETE /api/playlists/{id}/tracks/{track}`
- `POST /api/playlists/{id}/reorder`
- `GET|PUT|DELETE /api/user`
- `PUT /api/user/password`
- `POST /api/logout`

## Administración (requieren rol admin)

- `GET|PUT|DELETE /api/users`
- `GET|PUT|DELETE /api/users/{id}`

---

# Lógica destacada

### Activación/desactivación en cascada

- Al desactivar un género, se desactivan sus álbumes y canciones.
- Al desactivar un artista, se desactivan sus álbumes principales.
- Al desactivar un usuario, se desactivan sus playlists.

### Polling

Cada 3-10 segundos se refrescan los datos en diferentes componentes para reflejar cambios realizados por el administrador.

### Evento `track-invalidated`

Se dispara cuando una canción deja de ser reproducible:

- Los componentes reaccionan refrescándose.
- El reproductor se limpia automáticamente.

---

# Estructura del proyecto

## Backend (Laravel)

```text
musisense/
├── app/
│   ├── Http/Controllers/Api/       (API: Albums, Artists, Playlists, etc.)
│   ├── Http/Controllers/Admin/     (Panel de administración)
│   ├── Http/Middleware/            (EnsureUserIsActive, CheckRoleAdmin)
│   └── Models/                     (User, Artist, Album, Track, Playlist...)
├── database/migrations/            (Esquema de BD)
├── database/seeders/               (Datos iniciales)
├── resources/views/admin/          (Vistas Blade del panel)
└── routes/api.php                  (Endpoints de la API)
```

## Frontend (React)

```text
musisense-app/
├── src/
│   ├── components/                 (TrackActions, ElectroBorder, MainLayout)
│   ├── pages/                      (Home, AlbumDetail, PlaylistDetail, Search...)
│   ├── utils/                      (trackUtils.js)
│   └── api/axios.js                (Configuración de Axios)
├── public/                         (Imágenes estáticas)
└── index.html
```

---

# Licencia

Proyecto académico sin ánimo de lucro.

- Uso de música bajo derecho de copia privada.
- Código abierto bajo licencia MIT (para los frameworks utilizados).
