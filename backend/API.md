# LifeStream API Reference

Base URL: `https://<your-backend-host>/api` (local: `http://localhost:4000/api`)

All bodies are JSON. Errors look like `{ "error": "message", "field": "email" }` (`field` is present when one input caused it).

## Authentication

| Kind | How | Used by |
|---|---|---|
| User session | `Authorization: Bearer <token>` from `/auth/login` or `/auth/register` | Website, mobile apps |
| Partner API key | `x-api-key: ls_live_...` (created in Admin → API Keys) | Hospitals, blood banks, third-party apps (`/api/v1/*`) |

Passwords need 8+ characters with an uppercase letter, a lowercase letter, a number and a special character.

Rate limits: 300 requests/min per IP overall; 20 per 15 min on login/register/password reset; 10 blood requests per hour per IP. Partner keys have their own daily limit (default 1,000/day; headers `X-RateLimit-Limit` / `X-RateLimit-Remaining`).

---

## Partner API (`/api/v1`)

Every call needs `x-api-key`. Donor phone/email are masked unless an admin enabled "contacts visible" for the key.

| Method | Path | Description |
|---|---|---|
| GET | `/v1` | Check the key works |
| GET | `/v1/donors` | Search donors (same filters as `/donors` below) |
| GET | `/v1/donors/:id` | One donor |
| GET | `/v1/availability?lat=&lng=&radius=` | Available donors per blood group |
| GET | `/v1/requests?bloodType=` | Open blood requests |
| POST | `/v1/requests` | Create a request; compatible donors within 50 km are alerted |
| GET | `/v1/requests/:id` | Request status |
| GET | `/v1/inventory` | Blood stock by group |
| GET | `/v1/blood-banks?city=&state=` or `?lat=&lng=&radius=` | Blood banks nearby |
| GET | `/v1/compatibility?bloodType=O-` | Who can give to / receive from a group |

```bash
curl -H "x-api-key: ls_live_XXXX" "https://api.example.com/api/v1/donors?compatibleWith=A%2B&lat=30.73&lng=76.78&radius=25&available=true"
```

---

## Public endpoints (no login)

| Method | Path | Notes |
|---|---|---|
| GET | `/donors` | Query: `q`, `bloodType`, `compatibleWith`, `city`, `state`, `available`, `verified`, `lat`, `lng`, `radius` (km), `near` (place name), `sort=distance\|recent\|donations`, `page`, `limit`. Contacts masked. |
| GET | `/donors/:id` | Public donor profile |
| GET | `/requests` | Open requests: `bloodType`, `city`, `urgency` |
| GET | `/requests/:id` | One request |
| POST | `/requests` | `patientName*`, `bloodType*`, `hospital*`, `city*`, `contactName*`, `contactPhone*`, `contactEmail`, `units`, `urgency`, `neededBy`, `notes`. Returns `matchedDonors`. |
| GET | `/stats` | Live totals |
| GET | `/inventory` | Blood stock |
| GET | `/blood-banks` | See partner API |
| GET | `/compatibility` | Full chart |
| POST | `/contact` | `name*`, `email*`, `message*`, `phone`, `subject`, `inquiryType` |

## Auth

| Method | Path | Body |
|---|---|---|
| POST | `/auth/register` | `firstName*`, `lastName`, `email*`, `password*`, `confirmPassword`, `phone*`, `bloodType*`, `city*`, `state`, `address`, `zipCode`, `dateOfBirth` (18–65), `gender`, `weight` (≥45), `lastDonationDate`, `medicalConditions[]`, `medications`, `allergies`, `emergencyName`, `emergencyRelation`, `emergencyPhone`, `termsAccepted*`, `privacyAccepted*` |
| POST | `/auth/login` | `email`, `password`, optional `portal: "admin"`, `adminCode` |
| GET | `/auth/me` | Current session |
| POST | `/auth/forgot-password` | `email` — emails a 1-hour reset link |
| POST | `/auth/reset-password` | `token`, `password`, `confirmPassword` — signs out all devices |

## Signed-in user

| Method | Path | Description |
|---|---|---|
| GET / PATCH | `/me` | Profile (name, email, phone, donor fields) |
| POST | `/me/donor` | Add a donor profile to an existing account |
| PATCH | `/me/settings` | `isAvailable`, `notifyRequests`, `notifyEmail` |
| POST | `/me/change-password` | `currentPassword`, `newPassword`, `confirmPassword` |
| DELETE | `/me` | Delete account (`password`) |
| GET / POST | `/me/donations` | History / log a donation |
| DELETE | `/me/donations/:id` | Remove unverified donation |
| GET | `/requests/matches` | Requests this donor can help with |
| GET | `/requests/mine` | Requests I created + responders |
| POST | `/requests/:id/respond` | Offer to donate; returns requester contact |
| PATCH | `/requests/:id/status` | Creator marks `completed` / `cancelled` |
| POST | `/donors/:id/contact` | Reveal donor contact (donor is notified) |
| GET | `/notifications`, `/notifications/unread-count` | List / badge |
| PATCH | `/notifications/:id/read`, `/notifications/read-all` | Mark read |
| DELETE | `/notifications/:id`, `/notifications` | Delete |

## Admin

| Method | Path | Description |
|---|---|---|
| GET | `/admin/stats` | Totals + 7-day activity |
| GET / POST | `/admin/donors` | List / add walk-in donor |
| PATCH / DELETE | `/admin/donors/:id` | Edit, verify, reject, delete |
| GET / POST | `/admin/donors/:id/donations` | Record verified donation |
| GET / POST | `/admin/requests` | List / create |
| PATCH | `/admin/requests/:id` | `status`, `urgency`, `assignedDonorId` |
| POST | `/admin/requests/:id/rebroadcast` | Re-alert donors |
| GET / PUT | `/admin/inventory` | `{ items: [{ bloodType, units }] }` |
| GET / POST / PATCH / DELETE | `/admin/users[/:id]` | Users, roles, disable |
| GET / PATCH / DELETE | `/admin/messages[/:id]` | Contact inbox |
| GET / POST / PATCH / DELETE | `/admin/api-keys[/:id]` | Partner keys (full key shown once) |

`GET /health` → `{ "ok": true, "db": "up" }`

## External services

- **OpenStreetMap Nominatim** – city/address → coordinates (free, no key).
- **OpenStreetMap Nominatim** – blood banks near a point, with phone, email, hours and government/private type where listed (free, no key, max 1 request/second; results cached 6 hours).
- **data.gov.in** – Government of India blood bank directory, used first when its key and resource id are set.
- **SMTP** – password reset and alert emails.
