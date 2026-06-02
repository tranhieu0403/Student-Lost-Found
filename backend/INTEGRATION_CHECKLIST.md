## Backend Integration Checklist

- [ ] `POST /api/auth/register` -> `201`
- [ ] `POST /api/auth/login` -> `200` + token
- [ ] `GET /api/auth/me` (Bearer token) -> `200`
- [ ] `POST /api/posts` (auth) -> `201`
- [ ] `GET /api/posts?type=lost` -> `200` + array
- [ ] `GET /api/matches/:postId` -> `200`
- [ ] `POST /api/messages` (auth) -> `201`
- [ ] `GET /api/admin/stats` (admin token) -> `200`
- [ ] `POST /api/upload` (auth, multipart form-data) -> `201` + `imageUrls`

After all checks pass:

- [ ] `docker compose logs` has no critical backend/database errors
- [ ] Seed data exists in local database
