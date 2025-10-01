# Stock & Orders API

API REST para gestión de productos y pedidos.

## Requisitos
- Node >= 16
- MongoDB (Atlas recomendado)

## Instalación
1. Clona el repo
2. Copia `.env.example` a `.env` y completa las variables
3. `npm install`
4. `npm run dev`

## Endpoints principales
- POST /api/auth/register
- POST /api/auth/login
- CRUD productos: /api/products
- Pedidos: /api/orders

Cuando crees un pedido, el stock se reducirá. Al cancelar un pedido, se restaurará el stock.
