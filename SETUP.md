# V-Bridge AI Lab Setup Guide

## Requirements

Ubuntu 24.04

Python 3.12

NodeJS 22+

PostgreSQL

Apache2

Git

---

# Clone

```bash
git clone https://github.com/<username>/vbridge-ai-lab.git

cd vbridge-ai-lab
```

---

# Frontend

```bash
npm install
```

Development

```bash
npm run dev
```

Production

```bash
npm run build

npm run start
```

---

# Backend

Create virtual environment

```bash
python3 -m venv venv
```

Activate

```bash
source venv/bin/activate
```

Install

```bash
pip install -r requirements.txt
```

---

# PostgreSQL

Create database

```sql
CREATE DATABASE vbridge;
```

Create user

```sql
CREATE USER vbridge_user WITH PASSWORD 'password';
```

Grant

```sql
GRANT ALL PRIVILEGES ON DATABASE vbridge TO vbridge_user;
```

---

# Environment Variables

```
OPENAI_API_KEY=

DATABASE_URL=

APOLLO_API_KEY=

APP_ENV=production
```

---

# Run Backend

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

# Apache Reverse Proxy

```
ProxyPass /

ProxyPassReverse /
```

---

# Systemd

```
sudo systemctl enable vbridge

sudo systemctl restart vbridge
```

---

# Verify

```
https://test.ads-ai.in
```
