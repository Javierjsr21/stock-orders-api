# Guía de Uso - Stock & Orders API

## Base URL
```
http://localhost:4000/api
```

## 1. AUTENTICACIÓN

### Registrar Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@email.com",
  "password": "123456"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6789",
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "role": "user"
  }
}
```

### Iniciar Sesión
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@email.com",
  "password": "123456"
}
```

## 2. PRODUCTOS (Requiere autenticación)

### Obtener Todos los Productos
```http
GET /api/products
Authorization: Bearer tu_token_aqui
```

### Crear Producto (Solo Admin)
```http
POST /api/products
Authorization: Bearer token_admin
Content-Type: application/json

{
  "nombre": "iPhone 15",
  "descripcion": "Smartphone Apple",
  "precio": 999.99,
  "stock": 50,
  "categoria": "Electrónicos"
}
```

### Obtener Producto por ID
```http
GET /api/products/64a1b2c3d4e5f6789
Authorization: Bearer tu_token_aqui
```

### Actualizar Producto (Solo Admin)
```http
PUT /api/products/64a1b2c3d4e5f6789
Authorization: Bearer token_admin
Content-Type: application/json

{
  "nombre": "iPhone 15 Pro",
  "precio": 1199.99,
  "stock": 30
}
```

### Eliminar Producto (Solo Admin)
```http
DELETE /api/products/64a1b2c3d4e5f6789
Authorization: Bearer token_admin
```

## 3. PEDIDOS (Requiere autenticación)

### Crear Pedido
```http
POST /api/orders
Authorization: Bearer tu_token_aqui
Content-Type: application/json

{
  "items": [
    {
      "producto": "64a1b2c3d4e5f6789",
      "cantidad": 2
    },
    {
      "producto": "64a1b2c3d4e5f6790",
      "cantidad": 1
    }
  ]
}
```

### Obtener Mis Pedidos
```http
GET /api/orders
Authorization: Bearer tu_token_aqui
```

### Obtener Pedido por ID
```http
GET /api/orders/64a1b2c3d4e5f6791
Authorization: Bearer tu_token_aqui
```

### Cancelar Pedido
```http
PUT /api/orders/64a1b2c3d4e5f6791/cancel
Authorization: Bearer tu_token_aqui
```

## 4. HEALTH CHECK
```http
GET /api/health
```

## Ejemplos con cURL

### 1. Registrarse
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@email.com", 
    "password": "123456"
  }'
```

### 2. Crear Producto (guarda el token del registro)
```bash
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "nombre": "Laptop Dell",
    "descripcion": "Laptop para trabajo",
    "precio": 799.99,
    "stock": 10,
    "categoria": "Computadoras"
  }'
```

### 3. Crear Pedido
```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "items": [
      {
        "producto": "ID_DEL_PRODUCTO",
        "cantidad": 1
      }
    ]
  }'
```

## Ejemplos con Postman

### Configurar Authorization
1. En Postman, ve a la pestaña "Authorization"
2. Selecciona "Bearer Token"
3. Pega tu token en el campo "Token"

### Colección de Requests
1. **Register**: POST `/api/auth/register`
2. **Login**: POST `/api/auth/login`
3. **Get Products**: GET `/api/products`
4. **Create Product**: POST `/api/products`
5. **Create Order**: POST `/api/orders`
6. **Get Orders**: GET `/api/orders`

## Notas Importantes

- **Todos los endpoints excepto auth requieren token**
- **Solo usuarios admin pueden crear/editar/eliminar productos**
- **Al crear un pedido, el stock se reduce automáticamente**
- **Al cancelar un pedido, el stock se restaura**
- **Los tokens expiran en 7 días**

## Códigos de Estado HTTP

- `200` - OK
- `201` - Creado
- `400` - Error de validación
- `401` - No autorizado
- `403` - Prohibido (no admin)
- `404` - No encontrado
- `500` - Error del servidor