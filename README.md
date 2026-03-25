# BTG Fondos

Aplicacion frontend desarrollada en Angular para gestionar la vinculacion y cancelacion de participaciones en fondos de inversion FPV y FIC.

Este proyecto permite consultar el catalogo de fondos, validar montos minimos, revisar el saldo disponible del cliente, registrar suscripciones, cancelar participaciones activas y consultar el historial de transacciones. Toda la informacion se consume desde una API REST simulada con `json-server`.

La idea principal fue construir una solucion clara, ordenada y facil de mantener, con una experiencia responsive y un flujo sencillo de entender.

## Objetivo

Desarrollar una aplicacion web que permita administrar fondos de inversion a partir de un usuario unico con saldo inicial y un conjunto fijo de fondos definidos en la prueba tecnica.

## Stack utilizado

- Angular 21
- TypeScript
- RxJS
- SCSS
- json-server
- Vitest

## Que hace la aplicacion

- Muestra el saldo disponible del cliente
- Lista los fondos FPV y FIC disponibles
- Permite suscribirse a un fondo validando el monto minimo
- Valida que exista saldo suficiente antes de invertir
- Permite elegir el metodo de notificacion por email o SMS
- Permite cancelar participaciones activas
- Actualiza el saldo automaticamente despues de cada operacion
- Muestra el historial de transacciones
- Maneja estados de carga, exito y error
- Tiene una interfaz responsive

## Estructura del proyecto

```text
src/app/
  core/
    constants/
    interceptors/
    models/
    services/
  features/
    dashboard/
      pages/
    funds/
      services/
    history/
      pages/
```

## Arquitectura

La solucion se organizo con un enfoque feature-first y separacion por responsabilidades:

- **core**: contiene modelos, constantes, servicios base e interceptor HTTP
- **features**: agrupa los casos de uso principales por modulo funcional
- **PortfolioStoreService**: concentra el estado de la aplicacion usando RxJS y coordina las operaciones principales del flujo
- **componentes standalone**: simplifican la composicion de la app y el enrutamiento

Esta estructura ayuda a que la aplicacion pueda crecer sin mezclar logica de negocio, presentacion y acceso a datos.

## Flujo funcional

### Dashboard

Desde el dashboard se visualiza el saldo actual, el catalogo de fondos y las participaciones activas del cliente.

### Suscripcion

Al seleccionar un fondo, el formulario carga la informacion necesaria para registrar la inversion:

- fondo seleccionado
- monto minimo permitido
- saldo actual
- metodo de notificacion

Antes de registrar la operacion se validan estas reglas:

- el fondo debe estar seleccionado
- el monto debe ser mayor o igual al minimo del fondo
- el monto no puede superar el saldo disponible
- no se permite una segunda suscripcion activa al mismo fondo

### Cancelacion

Cuando un fondo tiene una participacion activa, puede cancelarse desde el dashboard. Esta operacion actualiza el estado de la suscripcion, devuelve el monto al saldo disponible y registra el movimiento en el historial.

### Historial

Cada suscripcion y cancelacion genera una transaccion visible en la ruta de historial, incluyendo monto, fecha, fondo y saldo resultante.

## Datos iniciales

El backend simulado parte de la siguiente base:

- un usuario unico
- saldo inicial de COP 500.000
- cinco fondos predefinidos
- colecciones para suscripciones y transacciones

La informacion persistida se encuentra en `db.json`.

## Instalacion

```bash
npm install
```

## Ejecucion

### 1. Levantar el backend simulado

```bash
npx json-server --watch db.json --port 3000
```

### 2. Levantar la aplicacion Angular

```bash
npm start
```

## Rutas principales

- `/dashboard`
- `/historial`

## Pruebas

```bash
ng test
```

## Cobertura funcional implementada

La solucion cubre los puntos principales solicitados en la prueba:

- consumo de API REST simulada
- gestion de estado con servicios y observables
- formularios reactivos
- validaciones de negocio
- historial de transacciones
- feedback visual de carga y error
- interfaz responsive
- pruebas unitarias del flujo principal

## Decisiones de implementacion

- Se evito incorporar librerias de estado adicionales para no sobredimensionar la solucion.
- La logica principal se centralizo en un store service basado en RxJS.
- Se uso `json-server` para simular persistencia simple y facilitar la validacion funcional.
- El diseno se construyo con SCSS sin frameworks visuales externos para mantener control total sobre la interfaz.

## Nota final

Este proyecto fue pensado como una solucion practica, entendible y bien organizada para resolver la prueba tecnica, priorizando claridad en la arquitectura, validaciones de negocio y una experiencia de usuario limpia.

Autor: Maicol Jacobo Aristizabal Obando - Prueba GFT - Desarrollador FrontEnd Angular
