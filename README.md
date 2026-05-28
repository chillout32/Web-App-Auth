# Auth Demo — JWT, bcrypt & RBAC

En utbildningsdemo som visar JWT-autentisering, bcrypt-lösenordslagring och rollbaserad auktorisering (RBAC) i praktiken.

## Projektstruktur

```
auth-demo/
├── backend/          # Node.js + Express
│   ├── src/
│   │   ├── index.js              # Entry point
│   │   ├── userStore.js          # In-memory users med bcrypt-hash
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT-verifiering + requireRole()
│   │   └── routes/
│   │       ├── auth.js           # POST /login, GET /me, POST /hash-demo
│   │       └── protected.js      # RBAC-skyddade endpoints
│   └── package.json
└── frontend/         # React + Vite
    ├── src/
    │   ├── App.jsx               # Routing
    │   ├── AuthContext.jsx       # Global JWT-state + apiFetch()
    │   ├── components/
    │   │   └── Layout.jsx        # Sidebar + navigation
    │   └── pages/
    │       ├── LoginPage.jsx     # Inloggning med demo-knappar
    │       ├── DashboardPage.jsx # API Explorer — testa endpoints
    │       ├── JwtPage.jsx       # JWT-inspektion med klickbara delar
    │       ├── PasswordPage.jsx  # bcrypt-demo mot riktig backend
    │       └── RbacPage.jsx      # Behörighetsmatris
    └── package.json
```

## Kom igång

### Backend

```bash
cd backend
npm install
cp .env.example .env    # Justera JWT_SECRET vid behov
npm run dev             # Startar på http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev             # Startar på http://localhost:5173
```

Öppna sedan http://localhost:5173 i webbläsaren.

## Demo-användare

| Användarnamn | Lösenord    | Roll   |
|--------------|-------------|--------|
| alice        | password123 | admin  |
| bob          | secret456   | editor |
| carol        | viewer789   | viewer |

## Viktiga koncept

### JWT-flödet
1. `POST /api/auth/login` → server validerar lösenord med `bcrypt.compare()`
2. Server skapar JWT signerat med `JWT_SECRET` och returnerar det
3. Frontend lagrar token och skickar `Authorization: Bearer <token>` vid varje request
4. `authenticateToken`-middleware verifierar signaturen och sätter `req.user`
5. `requireRole()`-middleware kontrollerar att rollen har rätt behörighet

### bcrypt
- Passwords hashas med `saltRounds: 10` — aldrig klartext i databasen
- Varje hash är unik tack vare automatiskt salt
- Verifiering: `bcrypt.compare(password, hash)` — hashen kan inte reverseras

### RBAC
Roller definieras i JWT-payloaden och kontrolleras per endpoint:
- **viewer**: GET /api/content
- **editor**: + POST /api/content, PUT /api/content/:id
- **admin**: + DELETE /api/content/:id, GET /api/admin/dashboard
