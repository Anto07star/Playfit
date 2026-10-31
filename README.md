# PlayFit – Football Jersey Shop

- **Frontend:** React (Vite) – red & black theme – http://localhost:5173
- **Backend:** NestJS + TypeORM – http://localhost:4000/api
- **Database:** PostgreSQL on localhost:5432 (database `playfit`, created automatically)

## What you get
**Customers (no login needed):** browse jerseys, filter by club / season / version, search, sort, product page with sizes and
optional name + number printing, cart, guest checkout (Cash on Delivery or Razorpay online), order tracking by order number + phone.

**Admin (login):** dashboard, add / edit / delete jerseys (upload images **or** paste image URLs), categories (with sub-categories
such as clubs), view orders, change order status, mark payments as paid.

## 1. Requirements
- Node.js 18 or newer (20 recommended)
- PostgreSQL running locally on port 5432

## 2. Run the backend
```bash
cd backend
npm install
# open .env and set DB_PASSWORD to your PostgreSQL password (default user is "postgres")
npm run start:dev
```
On first start it creates the `playfit` database, all tables, and the admin account.

## 3. Run the frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

## 4. Admin login
- URL: http://localhost:5173/admin/login
- Email: `admin@playfit.in`
- Password: `Admin@123`  (change `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET` in `backend/.env` **before** the first start)

The database starts empty. In the admin panel: add categories first (e.g. "Football Jerseys", then "Barcelona" inside it),
then add jerseys.

## 5. Razorpay (online payment)
Put your keys in `backend/.env` and restart the backend:
```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
```
Without keys the "Pay online" option is hidden and only Cash on Delivery is shown.

## 6. Other settings (`backend/.env`)
| Key | Meaning |
|---|---|
| `SHIPPING_FEE` | Flat shipping charge in ₹ (0 = free) |
| `CUSTOM_FEE` | Extra ₹ per jersey when name/number is added |
| `CORS_ORIGIN` | Allowed frontend URL(s), comma separated |

## 7. Production build (optional)
```bash
cd backend && npm run build && npm run start:prod
cd frontend && npm run build        # serve the dist/ folder; set VITE_API_URL to your API's address first
```
Note: tables are auto-synced (`synchronize: true`) which is perfect for development. For a live shop, switch to migrations.

## 8. Free hosting (Neon + Render + Cloudflare Pages)
See `DEPLOY.md` for the step-by-step guide.

## Troubleshooting
- *"Could not connect to PostgreSQL"* → check `DB_USER` / `DB_PASSWORD` in `backend/.env` and that PostgreSQL is running.
- *Port in use* → change `PORT` in `backend/.env` and the proxy target in `frontend/vite.config.js`.
