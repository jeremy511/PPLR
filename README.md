# PPLR

Aplicación web para la gestión de turnos y carritos, donde publicadores pueden inscribirse en horarios disponibles y los administradores pueden gestionar carritos, turnos y zonas.

---

## 🚀 Stack Tecnológico

**Backend**

- Node.js + Express
- ORM: Prisma (o TypeORM si decides usar SQL Server)
- Base de datos: PostgreSQL (o SQL Server)

**Frontend**

- React.js
- HeroUI (Shadcn/UI + Tailwind CSS)

**Herramientas adicionales**

- Git/GitHub
- Postman (para pruebas de API)
- Visual Studio Code

---

## 🗂 Estructura del Proyecto

- /backend →
- /frontend →
- /docs →

---

## 📊 Funcionalidades Principales

### Publicadores

- Ver turnos disponibles
- Inscribirse en turnos y agregar al carrito
- Confirmar inscripción

### Administradores

- Crear/editar carritos
- Crear/editar zonas
- Asignar turnos a carritos
- Ver inscritos por turno/carrito

---

## 📐 Diagramas

### 1️⃣ Diagrama ER de la Base de Datos

![Diagrama ER](./Docs/PPLR.drawio.pdf)

> Representa las tablas: Usuarios, Turnos, Zonas, Carritos y CarritoTurnos, con sus relaciones.

### 2️⃣ Flujo de Datos

- Frontend (React) → API (Express) → Base de Datos (PostgreSQL)

---

## 📝 Casos de Uso

1. Como publicador quiero ver los turnos disponibles para inscribirme.
2. Como publicador quiero agregar un turno a mi carrito y confirmar inscripción.
3. Como admin quiero crear carritos y asignar turnos.
4. Como admin quiero ver los publicadores inscritos en cada turno/carrito.

---

## ✅ Checklist de Preparación

- [x] Idea clara y objetivo definido
- [x] Esquema de base de datos listo
- [x] Historias de usuario definidas
- [x] Wireframes de pantallas principales
- [ ] Crear repositorio y estructura inicial
- [ ] Configurar backend y frontend básicos
- [ ] Implementar endpoints principales
- [ ] Integrar frontend y backend
- [ ] Pruebas completas y validaciones

---

## 🔧 Cómo ejecutar el proyecto (provisional)

1. Clona el repositorio:

```bash
git clone https://github.com/tuusuario/proyecto-carritos.git
```

2. Instala dependencias:

```bash
cd backend
npm install

cd ../frontend
npm install
```

3. Configura .env con la conexión a tu base de datos.

4. Ejecuta backend:

```bash
cd backend
npm run dev
```

5. Ejecuta frontend:

```bash
cd frontend
npm start
```
