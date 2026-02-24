# AI Live Avatar Frontend Prototype

Frontend-only Svelte + Vite prototype for a live avatar app with **automatic scripted animation** and **mock/WebSocket event input**.

## Run

```bash
npm install
npm run dev
```

Then open the local Vite URL.

## Avatar model (VRM / GLB) via env

Gunakan `.env` untuk menentukan model 3D:

```env
VITE_AVATAR_MODEL_URL=/avatar.vrm
```

- Mendukung `.vrm` dan `.glb`.
- Letakkan file model di folder `public/` (contoh `public/avatar.vrm` atau `public/cute.glb`).
- Jika gagal dimuat, aplikasi otomatis pakai placeholder mascot agar app tetap jalan.

## 6 background themes (ubah via env)

Secara default tersedia 6 tema:
1. Pastel Studio
2. Sunset Room
3. Neon Night
4. Cloud Cafe
5. Mint Park
6. Sakura Stage

Kamu bisa ganti daftar tema dan tema default dari `.env`:

```env
VITE_DEFAULT_THEME_ID=studio-pastel
VITE_BACKGROUND_THEMES=[{"id":"studio-pastel","name":"Pastel Studio","css":"radial-gradient(circle at top, #f9fbff 0%, #eef2ff 45%, #f8eaff 100%)"}]
```

`css` menerima string CSS background (gradient/image). UI menyediakan dropdown untuk switch tema saat runtime.

## Implemented features

- Fullscreen avatar canvas and soft pastel UI
- States: `IDLE`, `THINKING`, `BUBBLE_REPLY`, `VOICE_PREP`, `SPEAKING`, `COOLDOWN`
- Modes: `AUTO`, `VOICE`, `BUBBLE`
- Automatic idle sway + blinking + emotion changes + gestures
- Fake speaking mouth amplitude curve in speaking mode
- Subtitle bar (voice mode) and bubble panel (bubble mode)
- Queue processor with priority sorting and interrupt/clear controls
- Debug panel with scenario buttons for all requested test flows
- WebSocket client service with reconnect and JSON parser
- Mock event helpers for rapid queue and scripted sequence

## File structure

- `src/lib/avatar/AvatarEngine.ts` — Three.js + model loader (`vrm/glb`) + fallback mascot + animation engine
- `src/lib/state/avatarState.ts` — state machine + queue + event processing
- `src/lib/ws/wsClient.ts` — WebSocket service layer
- `src/lib/mock/mockEvents.ts` — mock test events
- `src/lib/config/env.ts` — env parser untuk model path + background themes
- `src/routes/+page.svelte` — main fullscreen UI composition
- `src/lib/components/*` — subtitle, bubble, badges, debug panel

## WebSocket event format

Incoming JSON examples:

```json
{"type":"reply","mode":"voice","text":"Halo semuanya, makasih udah datang!","emotion":"excited","gesture":"wave","priority":2}
{"type":"reply","mode":"bubble","text":"Wkwk iya bener juga 😄","emotion":"happy","gesture":"nod","duration_ms":3000,"priority":1}
{"type":"set_mode","value":"auto"}
{"type":"interrupt"}
{"type":"clear_queue"}
```

## Mock mode usage

- App works even when WS is disconnected.
- Use **Debug Panel** buttons:
  1. Bubble happy
  2. Voice excited
  3. Rapid queue
  4. Interrupt
  5. Mode switches AUTO/BUBBLE/VOICE
  6. Demo sequence (includes long subtitle wrapping)
  7. Bubble timeout checks
  8. Return to idle validation
