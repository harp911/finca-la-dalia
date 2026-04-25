# Finca La Dalia — Sistema de Administración (Optifrutas)

Este proyecto es una aplicación web completa para la administración de la finca productora de limón Tahití "La Dalia", ubicada en Chigorodó, Antioquia.

## Tecnologías Utilizadas
- **Frontend:** React + Vite + Tailwind CSS
- **Iconos:** Lucide React
- **Gráficas:** Recharts
- **Backend:** Firebase (Firestore + Auth + Storage)
- **Diseño:** Identidad corporativa de Optifrutas (Verde y Naranja)

## Estructura del Proyecto
- `src/pages`: Módulos de Lotes, Cosecha, Personal, Inventario, Transporte, Ventas y Configuración.
- `src/components`: Layout principal y componentes compartidos.
- `src/context`: Gestión de autenticación y roles de usuario.
- `src/utils`: Cálculos de semana ISO 8601 y formateadores de moneda/peso.

## Cómo poner en funcionamiento
Dado que el entorno actual no tiene `npm` configurado, sigue estos pasos:

1. **Instalar Node.js:** Descarga e instala Node.js desde [nodejs.org](https://nodejs.org/).
2. **Instalar Dependencias:** Abre una terminal en la carpeta del proyecto y ejecuta:
   ```bash
   npm install
   ```
3. **Configurar Firebase:** 
   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
   - Activa Authentication (Email/Password) y Firestore.
   - Copia tus credenciales en un archivo `.env.local` basado en el archivo `.env.example` que he creado.
4. **Ejecutar en Desarrollo:**
   ```bash
   npm run dev
   ```

## Roles del Sistema
- **Propietario:** Acceso total.
- **Mayordomo:** Acceso operativo (Cosecha, Lotes, Personal).
- **Contador:** Acceso financiero (Ventas, Nómina).

Desarrollado con identidad visual premium para **Optifrutas**.
