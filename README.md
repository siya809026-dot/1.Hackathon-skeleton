# GenHire – AI Content Creator Marketplace

```
cd backend
npm install
cp .env.example .env      # set MONGODB_URI
npm run seed              # loads 8 demo creators (clears existing data)
npm run dev               # http://localhost:5000  (serves API + frontend)
```
API: GET /api/creators, /api/creators/:id, /api/meta · POST /api/briefs, /api/briefs/build · GET /api/briefs, /api/briefs/:id/matches · DELETE /api/briefs/:id · GET/POST /api/engagements · PATCH /api/engagements/:id/advance | /revise
