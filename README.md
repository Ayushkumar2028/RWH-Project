# Live Link - https://rwh-frontend.onrender.com 
# 🌧️ RWH Assess — Rooftop Rainwater Harvesting Assessment Tool

**RWH Assess** is a full-stack web application designed to help users determine the potential for rooftop rainwater harvesting on any building. By drawing a polygon over a rooftop on an interactive map, users get an AI-powered assessment of their annual water-saving potential based on local hydrology, terrain, and soil data in India.

## 🚀 Features

- **Interactive Map Search**: Search for any location using OpenStreetMap integration.
- **Rooftop Drawing Tool**: Precisely draw a polygon outlining your rooftop to calculate the exact area in sq. meters. 
- **AI-Powered Analysis**: A custom-trained Random Forest ML model running on the backend takes the geographic centroid, area, and environmental data to predict water-saving capabilities.
- **Detailed PDF Reports**: Instantly generates a downloadable PDF containing a full site engineering breakdown, terrain analysis, and AI suggestions.
- **Modern UI**: Polished, responsive user interface designed with React, Tailwind CSS, and optimized for speed and clarity.

## 🛠️ Tech Stack

**Frontend (`rwh-frontend/`)**
- React 19 + Vite
- Tailwind CSS v4
- React Router DOM
- Leaflet + Geoman (for map rendering and polygon drawing)
- Turf.js (for area calculations)
- Axios

**Backend (`rwh-backend/`)**
- Django + Django REST Framework
- Scikit-Learn, Pandas, NumPy (for ML model predictions)
- ReportLab (for generating rigorous engineering PDF reports)
- WhiteNoise (for static file serving in production)
- SQLite (Development) / PostgreSQL (Optional for Production)

---

## ⚙️ Running the Project Locally

### 1. Clone the repository
```bash
git clone https://github.com/Ayushkumar2028/RWH-Project.git
cd RWH-Project
```

### 2. Set up the Backend (Django + ML)
Open a new terminal and navigate to the backend folder:
```bash
cd rwh-backend

# Create a virtual environment and activate it
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Start the Django development server (runs on port 8000)
python manage.py runserver
```

### 3. Set up the Frontend (React + Vite)
Open a second terminal and navigate to the frontend folder:
```bash
cd rwh-frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
The app will now be available locally (usually at http://localhost:5173).

---

## 🌐 Production Deployment (Render)

This project has been fully configured for deployment on [Render](https://render.com). It comes with a `render.yaml` blueprint that automatically spins up both the frontend and backend.

### Deploying via Blueprint
1. Go to Render.com and create a **New Blueprint Instance**.
2. Connect this repository.
3. Render will read the `render.yaml` file and automatically provision:
   - A **Web Service** for the Django backend.
   - A **Static Site** for the React frontend.
4. Once both are live, copy your Django backend URL (e.g., `https://rwh-backend.onrender.com`).
5. Go to your frontend service on Render, choose **Environment**, and set `VITE_API_URL` to point to your backend:
   - Key: `VITE_API_URL` 
   - Value: `https://rwh-backend.onrender.com/api`
6. Go to your backend service on Render, choose **Environment**, and set `CORS_ALLOWED_ORIGINS` to point to your frontend:
   - Key: `CORS_ALLOWED_ORIGINS`
   - Value: `https://rwh-frontend.onrender.com`
7. Finally, **trigger a manual deploy** of the frontend, since `VITE_API_URL` gets statically compiled at build time.

---

## 📷 Screenshots


### Landing Page
A polished landing page with Indian water conservation statistics.
*<img width="1427" height="823" alt="image" src="https://github.com/user-attachments/assets/fc977ff0-7f02-4765-b0e7-9f00fe99a785" />*

### Interactive Map Interface
Users pinpoint their home and easily draw rooftop constraints.
*<img width="1407" height="851" alt="image" src="https://github.com/user-attachments/assets/71bec89e-7110-46ec-bad0-53e5dd7d8e98" />*

### Detailed Report (Result view + PDF)
Users receive an itemized prediction covering estimated tank sizes, hydrology zoning, and annual harvest potential.
*<img width="1282" height="787" alt="image" src="https://github.com/user-attachments/assets/e5bc271a-06d3-4dc5-af58-dae2f0a7395c" />*
*<img width="909" height="729" alt="image" src="https://github.com/user-attachments/assets/f8134f4c-dd7c-4d83-9515-16e619fd02d8" />*

---
