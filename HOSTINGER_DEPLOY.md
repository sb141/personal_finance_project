# 🚀 Deployment Guide for xyz.com/pf/

This guide is for deploying the app into a **subdirectory** (`/pf/`) of your main website.

*   **URL**: `https://xyz.com/pf/`
*   **Infrastructure**: Hostinger Shared Hosting (inside `public_html`)

## 📁 1. Folder Structure
Inside your main `public_html` folder (where your WordPress site lives), you will create a `pf` folder.

```
public_html/
│   ... (WordPress files like wp-admin, wp-content, etc.)
│
└── pf/                   <-- Create this folder!
    ├── api/              <-- Subfolder for Backend
    │   ├── config.php
    │   ├── api.php
    │   └── .htaccess
    │
    ├── assets/           <-- from frontend build
    ├── index.html        <-- from frontend build
    └── .htaccess         <-- for frontend routing
```

## 🛠️ 2. Step-by-Step Instructions

### Step A: Backend Setup
1.  Inside `public_html/pf`, create a folder named `api`.
2.  Upload the contents of `backend_php` to `public_html/pf/api`.
    *   **Edit `config.php`** on the server if needed (check DB credentials).

### Step B: Build Frontend
1.  We have updated specific configurations for this path:
    *   `vite.config.js`: `base` set to `/pf/`.
    *   `.env.production`: `VITE_API_URL` set to `https://xyz.com/pf/api`.
2.  Run the build command:
    ```bash
    cd frontend
    npm run build
    ```

### Step C: Upload Frontend
1.  Upload the **contents** of the `frontend/dist` folder directly into `public_html/pf/`.

### Step D: Frontend Routing Fix
1.  Create a `.htaccess` file inside `public_html/pf/` with this content:
    ```apache
    <IfModule mod_rewrite.c>
      RewriteEngine On
      RewriteBase /pf/
      RewriteRule ^index\.html$ - [L]
      RewriteCond %{REQUEST_FILENAME} !-f
      RewriteCond %{REQUEST_FILENAME} !-d
      RewriteCond %{REQUEST_FILENAME} !-l
      RewriteRule . /pf/index.html [L]
    </IfModule>
    ```
