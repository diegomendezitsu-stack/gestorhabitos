# HabitLife - Gestor de Habitats Gamificado

Convierte tus habitos en misiones RPG. Sube de nivel, gana oro y desbloquea logros.

## Stack

- **Backend:** Node.js + Express 5
- **Base de datos:** PostgreSQL (Supabase)
- **Frontend:** HTML/CSS/JS vanilla
- **Testing:** Jest + Supertest
- **DevOps:** Docker + GitHub Actions

## Instalacion

```bash
git clone https://github.com/tu-usuario/habitlife.git
cd habitlife
npm install
```

### Variables de entorno

Copia `.env.example` a `.env` y configura:

```env
PORT=5000
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_HOST=tu_host.supabase.com
DB_PORT=6543
DB_NAME=postgres
JWT_SECRET=secreto_aleatorio_largo
JWT_REFRESH_SECRET=otro_secreto_aleatorio_largo
ALLOWED_ORIGINS=http://localhost:5000
NODE_ENV=development
```

### Iniciar

```bash
node index.js          # produccion
npm run dev            # desarrollo (con --watch)
npm test               # ejecutar tests
node scripts/migrate.js  # agregar columnas nuevas a la DB
```

## Arquitectura

```
gestorhabitos/
  app.js                 # Express app (middleware, rutas, error handler)
  index.js               # Server entry (graceful shutdown)
  config/
    db.js                # PostgreSQL pool (Supabase)
    logger.js            # Winston logger (files + console)
    schema.sql           # Schema DDL completo
  controllers/
    authController.js    # Register, login, refresh tokens
    habitController.js   # CRUD + complete + undo + restore + categorias
    shopController.js    # Comprar recompensas + historial
    statsController.js   # Estadisticas + badges + heatmap semanal
    userController.js    # Perfil, avatar, exportar datos, eliminar cuenta
  middleware/
    auth.js              # JWT verification
    validate.js          # express-validator rules
    errorHandler.js      # Error handler centralizado
  routes/
    authRoutes.js, habitRoutes.js, shopRoutes.js,
    statsRoutes.js, userRoutes.js
  public/
    index.html           # SPA completa
    app.js               # Logica frontend
    diseno-profesional.css
    icons/
  tests/
    auth.test.js, habits.test.js, shop.test.js
  scripts/
    migrate.js           # Migraciones ALTER TABLE
    init-db.js           # Crear tablas desde cero
  Dockerfile, docker-compose.yml
  .github/workflows/ci.yml
```

## API Endpoints

### Auth
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/auth/register` | Crear cuenta (nombre, email, password) |
| POST | `/api/auth/login` | Iniciar sesion |
| POST | `/api/auth/refresh` | Renovar access token |

### Habitos
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/habits` | Listar habitos activos (`?archived=true` para archivados) |
| POST | `/api/habits` | Crear habito (nombre, dificultad, categoria) |
| PUT | `/api/habits/:id` | Actualizar habito |
| DELETE | `/api/habits/:id` | Archivar habito (soft delete) |
| POST | `/api/habits/:id/complete` | Completar habito (ganar XP/oro) |
| POST | `/api/habits/:id/undo` | Deshacer completacion de hoy |
| POST | `/api/habits/:id/restore` | Restaurar habito archivado |
| GET | `/api/habits/categorias` | Listar categorias disponibles |

Categorias: general, salud, estudio, trabajo, fitness, meditacion, lectura, creatividad, social, finanzas

### Tienda
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/shop/comprar` | Comprar producto (producto, costo) |
| GET | `/api/shop/historial` | Ver historial de compras |

### Estadisticas
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/stats` | Estadisticas generales + badges desbloqueados |
| GET | `/api/stats/heatmap` | Actividad ultimos 7 dias |

### Usuario
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/user/me` | Obtener perfil |
| PUT | `/api/user/me` | Actualizar perfil (nombre, avatar) |
| GET | `/api/user/me/avatars` | Listar avatares disponibles |
| GET | `/api/user/me/export` | Exportar todos mis datos (JSON) |
| DELETE | `/api/user/me` | Eliminar cuenta permanentemente |

### Health
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/health` | Estado del servidor |

## Seguridad

- Helmet (headers HTTP seguros)
- Rate limiting (100 req/15min general, 10 req/15min auth)
- CORS restringido
- express-validator en todos los endpoints
- Password hashing bcrypt (salt 12)
- JWT con access (1h) + refresh tokens (7d)
- Body parser limit (10kb)
- Gzip compression
- Request ID tracking (uuid)
- Soft delete en habitos

## Gamificacion

- **XP y Nivel:** Gana XP completando habitos. Sube de nivel al alcanzar el XP necesario.
- **Oro:** Moneda virtual para canjear en la tienda.
- **Dificultad:** Facil (10 XP / 5 oro), Media (20 XP / 15 oro), Dificil (40 XP / 30 oro).
- **Rachas:** Contador de dias consecutivos + mejor racha historica.
- **14 Logros/Insignias:** Primera mision, racha de 7, nivel 10, etc.
- **Tienda:** Netflix, Postre, Videojuegos, Compra Libre.
- **Categorias:** Organiza habitos por tipo.
- **Archivado:** Soft delete con posibilidad de restaurar.

## Docker

```bash
docker-compose up --build
```

## License

MIT
