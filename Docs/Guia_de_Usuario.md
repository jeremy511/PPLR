# Guía de Usuario - Plataforma PPLR

¡Bienvenido a la plataforma PPLR! Esta herramienta ha sido diseñada para facilitar la organización y gestión de los turnos de predicación pública en nuestra congregación.

---

## 🚀 1. Acceso y Cuenta

### 1.1 Registro e Inicio de Sesión
Para acceder al sistema, puedes:
- **Correo y Contraseña**: Ingresa tus credenciales en la página de [Inicio de Sesión](file:///Frontend/src/pages/login.jsx). Si no tienes cuenta, usa el formulario de [Registro](file:///Frontend/src/pages/register.jsx).
- **Google**: Puedes usar el botón "Continuar con Google" para una entrada más rápida y segura.

### 1.2 Recuperación de Contraseña
Si olvidaste tu contraseña:
1. Ve a la pantalla de login y haz clic en "¿Olvidaste tu contraseña?".
2. Ingresa tu correo electrónico registrado.
3. Recibirás un enlace para establecer una nueva clave.

---

## 📊 2. Tablero Principal (Dashboard)

El [Dashboard](file:///Frontend/src/pages/dashboard.jsx) es tu centro de operaciones.

- **Carrusel de Imágenes**: En la parte superior verás momentos destacados de nuestra congregación y actividades de predicación.
- **Selector de Zona**: Puedes elegir entre diferentes puntos de predicación (ej. Jardín Botánico, Centros Comerciales). Al cambiar de zona, el cronograma y la información se actualizarán automáticamente.
- **Efectos Visuales**: Algunas zonas especiales (como el Jardín Botánico) tienen fondos dinámicos y estilos únicos.

---

## 📅 3. Gestión de Turnos

### 3.1 Inscripción en Turnos
En el **Cronograma de Turnos** del Dashboard:
1. Busca el día y horario que prefieras.
2. Haz clic en un espacio disponible (verás el botón para inscribirte).
3. Confirma tu asistencia.

### 3.2 Mis Turnos
En la sección [Mis Turnos](file:///Frontend/src/pages/MyShifts.jsx), podrás ver todas tus asignaciones confirmadas:
- **Detalles Logísticos**: Fecha, hora exacta y ubicación.
- **Compañeros**: Verás quiénes están asignados contigo.
- **Contacto Directo**: Tienes botones rápidos para enviar un **WhatsApp** o realizar una **Llamada** a tus compañeros de turno directamente desde la plataforma.
- **Responsable**: Si eres el responsable del turno, verás una placa indicadora.

---

## 🔔 4. Recordatorios y Perfil

- **Recordatorios**: En la sección de [Recordatorios](file:///Frontend/src/pages/Reminders.jsx) aparecerán anuncios importantes de los siervos/ancianos encargados.
- **Perfil**: En tu [Perfil](file:///Frontend/src/pages/Profile.jsx) puedes actualizar tu teléfono, nombre y ver tu historial.

---

## 🛠️ 5. Administración (Solo para Administradores)

Si tienes privilegios de administrador, tendrás acceso a herramientas adicionales:

### 5.1 Gestión de Usuarios
En [Usuarios](file:///Frontend/src/pages/admin/Users.jsx) puedes:
- Buscar publicadores por nombre o email.
- Editar datos personales y cambiar roles (PUBLISHER / ADMIN).
- Restablecer contraseñas de hermanos que tengan dificultades de acceso.
- Eliminar cuentas si es necesario.

### 5.2 Gestión de Zonas
En [Zonas](file:///Frontend/src/pages/admin/Zones.jsx) puedes:
- Crear nuevos puntos de predicación.
- Asignar **colores distintivos** a cada zona para que sea fácil identificarlas en el tablero.
- Configurar instrucciones específicas (donde está el carrito, llaves, etc.).
- Ocultar o mostrar zonas según la temporada.

### 5.3 Reportes y Estadísticas
En [Reportes](file:///Frontend/src/pages/admin/Reports.jsx) encontrarás:
- KPIs sobre cobertura semanal de turnos.
- Gráficos de las zonas más activas.
- Un **Registro de Actividad** (Audit Log) para ver cambios recientes en el sistema.

---
*Si tienes dudas técnicas o encuentras un error, por favor contacta al equipo de soporte de la congregación.*
