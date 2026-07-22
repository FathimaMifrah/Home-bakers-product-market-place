<!--
 File: server/README.md
 Purpose: Server setup and documentation.
 Main exports: Exports or main definitions
 -->

# Home Bakers Marketplace Backend

This folder contains a small Node/Express API for your MySQL database.

## Setup

1. Copy `.env.example` to `.env` and update your database credentials.
2. Install root dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm run server
```

## API endpoints

- `GET /api/ping`
- `GET /api/users`
- `GET /api/users/:id`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/orders`
- `GET /api/orders/:id`
- `GET /api/reviews`
- `GET /api/reviews/:id`
- `GET /api/delivery-settings`
- `GET /api/delivery-settings/:bakerId`
