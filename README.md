# 3DFV (3D Food Visualisation) - Full Stack Application

Welcome to the 3DFV project! This is a complete full-stack solution featuring a React Native (Expo) frontend for customers and admins, powered by a scalable FastAPI backend with PostgreSQL.

## 🚀 Project Overview

The 3DFV application allows customers to browse a food menu, view items (with future AR integration capabilities), place orders, and pay via cash or card. It also includes an integrated Admin Panel to manage menu items, prices, and view live orders.

## 🛠️ Tech Stack

* **Frontend:** React Native, Expo, TypeScript, React Navigation
* **Backend:** Python 3.12, FastAPI, SQLAlchemy, Pydantic, Alembic
* **Database:** PostgreSQL (with `psycopg2-binary` adapter)
* **Authentication:** JWT (JSON Web Tokens) with role-based access control.

---

## 📂 Folder Structure

```
.
├── 3dfv-project/
│   └── 3dfv/                # React Native Expo Frontend
│       ├── App.tsx          # Main entry and navigation state
│       ├── src/
│       │   ├── api/         # Axios client and API wrappers
│       │   ├── screens/     # UI Screens (Home, Cart, Admin, etc.)
│       │   ├── styles/      # Global stylesheet
│       │   └── types/       # TypeScript models
├── Backend/                 # FastAPI Backend
│   ├── alembic/             # Database migrations
│   ├── app/                 # FastAPI routes, models, schemas, auth
│   ├── database_seed.sql    # Default data for setup
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
└── README.md                # This file
```

---

## ⚙️ Backend Setup & Execution

### 1. PostgreSQL Database Setup
1. Ensure **PostgreSQL** is installed on your local machine (e.g., v15).
2. Open **pgAdmin** or your preferred database tool.
3. Login using your `postgres` user.
4. **Create a new database** named `ar_menu`.
   * *SQL Command:* `CREATE DATABASE ar_menu;`

### 2. Configure Environment Variables
Navigate to the `Backend` folder and locate `.env`. Ensure your `DATABASE_URL` matches your actual local PostgreSQL password:
```env
# ⚠️ Replace 'your_password' with your actual pgAdmin password!
DATABASE_URL=postgresql+psycopg2://postgres:your_password@localhost:5432/ar_menu
```

### 3. Install Dependencies
Ensure you are using the correct Python virtual environment. Open a terminal in the `Backend` folder:
```bash
# Activate your virtual environment
.\.venv-cpython\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

### 4. Run Migrations & Seed Database
Initialize the database tables and insert the default roles and menu items:
```bash
# Run Alembic migrations to create tables
alembic upgrade head

# Seed the database
psql -U postgres -d ar_menu -f database_seed.sql
```
*(If `psql` is not in your PATH, you can run the SQL script manually inside pgAdmin Query Tool).*

### 5. Start the Backend Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
*The API will be available at http://localhost:8000. Swagger UI documentation is available at http://localhost:8000/docs.*

---

## 📱 Frontend Setup & Execution

### 1. Configure the API Connection
If you are testing on a physical device (via Expo Go), your phone needs to communicate with your computer over Wi-Fi. 
Open `3dfv-project/3dfv/app.config.js` and change `apiBaseUrl` to your computer's local IPv4 address (e.g., `http://192.168.1.5:8000`).
If using a local emulator, `http://localhost:8000` is sufficient.

### 2. Install Dependencies
Open a terminal in the `3dfv-project/3dfv` folder:
```bash
npm install
```

### 3. Start Expo
```bash
npx expo start
```
Scan the QR code with the **Expo Go** app on your phone, or press `a` to open the Android emulator.

---

## 🧪 Testing Flows

### Customer Testing Flow
1. Open the app and create a new account via the **Register** screen.
2. Sign in with the new credentials.
3. Browse the dynamic categories on the Home Screen.
4. Add items to your cart, specifying portions and quantities.
5. Tap the Cart icon, review your total, and proceed to Checkout.
6. Enter a phone number, select **Cash on Counter**, and place your order.
7. You should see a "Thanks" screen. Tapping "Back to Home" resets the cart and payment state.

### Admin Testing Flow
1. Sign out of your customer account (using the profile icon or restarting app state).
2. Login with the seeded Super Admin credentials:
   * **Email:** `admin@3dfv.pk`
   * **Password:** `Admin@1234`
3. The app will automatically route you to the **Admin Panel**.
4. **Add a menu item**: Navigate to "Add menu item", create a new product, and verify it shows up on the Customer App.
5. **View Orders**: Navigate to "View order history" to see real-time incoming orders.
6. **Sign Out**: Use the red Sign Out button to safely clear your session.

---

## 🚨 Common Troubleshooting

1. **"FATAL: password authentication failed for user postgres"**
   * **Fix:** You left the placeholder password in `Backend/.env`. Change it to your actual PostgreSQL installation password.
2. **Network Error / Expo cannot connect to Backend**
   * **Fix:** You are likely using `localhost` in `app.config.js` while testing on a physical iPhone/Android. Change `localhost` to your computer's LAN IP address (e.g., `192.168.x.x`). Ensure both devices are on the exact same Wi-Fi network.
3. **Database not created**
   * **Fix:** If Alembic throws an error that `ar_menu` does not exist, open pgAdmin and run `CREATE DATABASE ar_menu;` manually.
4. **CORS Issues**
   * **Fix:** Ensure the frontend URL/IP is listed in `BACKEND_CORS_ORIGINS` in your `Backend/.env`. By default, `0.0.0.0` or standard local network ranges are permitted.
