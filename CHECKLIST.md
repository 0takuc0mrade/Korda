# Korda — Validation Checklist

Run these commands to verify the build is clean before submission.

## Backend

### Syntax Check

```bash
python3 -m py_compile backend/app.py
python3 -m py_compile backend/graph_diff.py
```

### Unit Tests

```bash
python3 -m unittest discover backend
```

> **Note:** `pytest` is not installed in the backend venv. Tests run via `python -m unittest`. If you want pytest, add it to a dev requirements file:
>
> ```bash
> pip install pytest
> pytest backend/
> ```

### Expected Result

```
..
----------------------------------------------------------------------
Ran 2 tests in 0.001s

OK
```

## Frontend

### Build

```bash
cd web
npm run build
```

### Expected Result

```
✓ Compiled successfully
✓ Finished TypeScript
✓ Generating static pages (7/7)

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /dashboard
├ ○ /demo
├ ƒ /runs/[id]
└ ○ /sdk
```

## TypeScript SDK

### Build

```bash
cd sdk/typescript
npm install
npm run build
```

### Package Check

```bash
npm pack --dry-run --ignore-scripts
```

### Expected Result

```
📦  @korda/sdk@0.1.0
Tarball Contents:
  LICENSE
  README.md
  dist/index.d.ts
  dist/index.d.ts.map
  dist/index.js
  dist/index.js.map
  package.json
total files: 7
```

## Forbidden Frontend Terms

Scan for terms that should not appear in user-facing frontend source:

```bash
cd web/src
grep -rn "AUTH_API_V1\|AUTH_API_V2\|legacy API\|scoped service\|proof harness\|mock mode\|fallback mode" . || echo "Clean"
```

### Expected Result

```
Clean
```

## Last Verified

| Check | Result | Date |
| --- | --- | --- |
| Backend syntax | ✅ OK | 2026-07-04 |
| Backend unittest (2 tests) | ✅ OK | 2026-07-04 |
| Frontend build | ✅ OK | 2026-07-04 |
| SDK build | ✅ OK | 2026-07-04 |
| SDK pack dry-run (7 files) | ✅ OK | 2026-07-04 |
| Forbidden terms scan | ✅ Clean | 2026-07-04 |
