# 🌍 Deployment Guide (Hostinger VPS / Ubuntu)

Yes, you can absolutely host this application on a Hostinger server!

However, the **type of hosting plan** matters significantly:
*   **VPS Hosting (Recommended)**: You have full control (root access) to install Python, Node.js, and run the FastAPI server continuously. This is the **best** option for this tech stack.
*   **Shared Hosting**: Hosting a **FastAPI** backend on shared hosting is difficult because it requires a long-running process (`uvicorn`) which most shared plans do not support or restrict heavily. Hosting the **Frontend** (React) on shared hosting is very easy.

This guide assumes you are using a **VPS** running **Ubuntu**.

---

## 🏗️ 1. Prepare the Frontend (React)

The frontend is a static site after building. You don't need Node.js running on the server to *serve* it, only to *build* it (which you can do locally).

1.  **Build locally:**
    ```bash
    cd frontend
    npm run build
    ```
    This creates a `dist/` folder containing your HTML, CSS, and JS files.

2.  **Upload:**
    You will upload the *contents* of the `dist/` folder to your server later (e.g., to `/var/www/personal_finance/html`).

---

## 🐍 2. Prepare the Backend (FastAPI)

1.  **Connect to your VPS** via SSH.
2.  **Update system:**
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```
3.  **Install Python & Pip:**
    ```bash
    sudo apt install python3 python3-pip python3-venv -y
    ```
4.  **Copy your project files** to the server (e.g., to `/var/www/personal_finance/backend`).
    *   *Tip: You might want to use git to pull the repo directly on the server.*

5.  **Setup Virtual Environment & Dependencies:**
    ```bash
    cd /var/www/personal_finance/backend
    python3 -m venv .venv
    source .venv/bin/activate
    pip install fastapi uvicorn sqlalchemy pydantic python-multipart
    ```

6.  **Create a Systemd Service** (to keep the app running in the background):
    Create a file `/etc/systemd/system/fastapi.service`:
    ```ini
    [Unit]
    Description=Gunicorn instance to serve FastAPI
    After=network.target

    [Service]
    User=root
    Group=www-data
    WorkingDirectory=/var/www/personal_finance/backend
    Environment="PATH=/var/www/personal_finance/backend/.venv/bin"
    ExecStart=/var/www/personal_finance/backend/.venv/bin/uvicorn main:app --workers 1 --host 127.0.0.1 --port 8000

    [Install]
    WantedBy=multi-user.target
    ```

7.  **Start the Service:**
    ```bash
    sudo systemctl start fastapi
    sudo systemctl enable fastapi
    ```

---

## 🌐 3. Configure Nginx (Reverse Proxy)

Nginx will serve your React frontend and forward API requests to your FastAPI backend.

1.  **Install Nginx:**
    ```bash
    sudo apt install nginx -y
    ```

2.  **Create Config:** `/etc/nginx/sites-available/finance_app`
    ```nginx
    server {
        listen 80;
        server_name your_domain.com;  # OR your server IP

        # Serve Frontend (Static Files)
        location / {
            root /var/www/personal_finance/html; # Your React 'dist' content
            index index.html;
            try_files $uri $uri/ /index.html;
        }

        # Proxy Backend API
        location /transactions {
            proxy_pass http://127.0.0.1:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        
        location /reports {
            proxy_pass http://127.0.0.1:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        
        location /docs {
            proxy_pass http://127.0.0.1:8000;
        }
        
        location /openapi.json {
             proxy_pass http://127.0.0.1:8000;
        }
    }
    ```

3.  **Enable Site & Restart:**
    ```bash
    sudo ln -s /etc/nginx/sites-available/finance_app /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

---

## ✅ Summary

1.  **Frontend**: Built locally, uploaded static files to `/var/www/.../html`.
2.  **Backend**: Python files uploaded, running via `systemctl` on port 8000.
3.  **Nginx**: Directs traffic—Users see React, React talks to Nginx, Nginx talks to FastAPI.
