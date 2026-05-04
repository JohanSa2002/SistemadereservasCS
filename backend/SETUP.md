# Configuración del Backend en Supabase

## Requisitos previos
- Cuenta en [supabase.com](https://supabase.com)
- Node.js 18+ instalado
- Supabase CLI (`npm install -g supabase`)

---

## Paso 1 — Crear el proyecto en Supabase

1. Entra a [app.supabase.com](https://app.supabase.com) y crea un nuevo proyecto.
2. Anota los siguientes valores desde **Project Settings → API**:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`
   - **service_role key** → (solo para Edge Functions, nunca expongas esta clave en el frontend)

---

## Paso 2 — Ejecutar los scripts SQL

Ve a **SQL Editor** en el dashboard de Supabase y ejecuta los scripts en este orden:

### 2.1 Schema (tablas, índices, Realtime)
Copia y pega el contenido de `database/01_schema.sql` y ejecútalo.

> Si ya tienes la tabla `supabase_realtime` publicada o recibes un error en
> `ALTER PUBLICATION`, ignora ese error y continúa.

### 2.2 Políticas RLS
Copia y pega el contenido de `database/02_rls.sql` y ejecútalo.

### 2.3 Triggers y funciones de negocio
Copia y pega el contenido de `database/03_functions.sql` y ejecútalo.

### 2.4 Datos iniciales (tiers)
Al final de `03_functions.sql` hay un bloque comentado con los tiers por defecto.
Descoméntalo y ejecútalo, o crea los tiers manualmente desde **Table Editor → tiers**:

| nombre | color   | precio |
|--------|---------|--------|
| Tier A | #7C3AED | 250    |
| Tier B | #0891B2 | 175    |
| Tier C | #65A30D | 110    |

---

## Paso 3 — Crear el primer evento y stands

Desde **SQL Editor** (o desde tu panel de admin ya conectado):

```sql
-- Insertar el primer evento
INSERT INTO public.events (nombre, fecha, activo)
VALUES ('Expo Emprende — Junio 2026', '2026-06-14', true);

-- Insertar stands (ejemplo: 3 stands, ajusta según tu plano)
-- Reemplaza los UUIDs de event_id y tier_id por los reales
INSERT INTO public.stands (event_id, tier_id, nombre, svg_id)
SELECT
  e.id,
  t.id,
  'Stand ' || n,
  'stand-' || n
FROM
  public.events e,
  public.tiers t,
  generate_series(1, 60) AS n
WHERE e.activo = true
  AND t.nombre = CASE
    WHEN n <= 4  THEN 'Tier A'
    WHEN n <= 20 THEN 'Tier B'
    ELSE 'Tier C'
  END;
```

---

## Paso 4 — Crear el primer usuario administrador

1. Ve a **Authentication → Users → Invite user** e invita el correo del admin.
2. El usuario acepta la invitación y crea su contraseña.
3. El trigger `on_auth_user_created` crea automáticamente su fila en `public.users`.
4. Verifica en **Table Editor → users** que el registro existe con `rol = 'admin'`.

---

## Paso 5 — Configurar variables de entorno en el frontend

Crea un archivo `.env` en la raíz del proyecto frontend:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

---

## Paso 6 — Habilitar Realtime (si no se activó con el SQL)

1. Ve a **Database → Replication** en el dashboard.
2. Haz clic en **supabase_realtime** (o en **0 tables**).
3. Activa la tabla `stands`.

Verifica que el script `ALTER PUBLICATION supabase_realtime ADD TABLE public.stands;`
se ejecutó sin errores. Si hubo error, actívalo manualmente desde el dashboard.

---

## Paso 7 — Desplegar las Edge Functions

Desde la raíz del proyecto:

```bash
# Iniciar sesión en Supabase CLI
supabase login

# Vincular con tu proyecto (usa el Project ID de Settings → General)
supabase link --project-ref TU_PROJECT_ID

# Desplegar ambas funciones
supabase functions deploy create-reservation \
  --project-ref TU_PROJECT_ID

supabase functions deploy start-new-cycle \
  --project-ref TU_PROJECT_ID
```

Las Edge Functions necesitan acceso a las variables de entorno del proyecto.
Supabase las inyecta automáticamente (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`SUPABASE_ANON_KEY`) — no necesitas configurarlas manualmente.

---

## Paso 8 — Instalar dependencias en el frontend

```bash
npm install @supabase/supabase-js
```

---

## Verificación rápida

Desde la consola del navegador o un script de prueba:

```js
import { getActiveEvent, getTiers, getStandsWithTiers } from './api';

const event  = await getActiveEvent();
const tiers  = await getTiers();
const stands = await getStandsWithTiers(event.id);

console.log('Evento activo:', event.nombre);
console.log('Tiers:', tiers.length);
console.log('Stands:', stands.length);
```

---

## Notas de seguridad

- **Nunca expongas `service_role_key`** en el código del frontend.  
  Esta clave solo va en variables de entorno del servidor / Edge Functions.
- La `anon_key` es pública por diseño — las políticas RLS son la capa de seguridad.
- Las funciones SQL críticas usan `SECURITY DEFINER` para ejecutarse con privilegios
  del owner y así poder hacer `SELECT ... FOR UPDATE` sin que el cliente lo vea.
