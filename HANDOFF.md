# RAAHAT — Backend Handoff

**Project:** RAAHAT — AI-enabled Real-Time Stress and Trauma Assessment Module
**Problem statement:** Smart India Hackathon — Department of Social Justice & Empowerment, National Helpline Against Atrocities (NHAA 14566)
**Frontend status:** Complete, working prototype. React + Vite. All data is currently local mock data.

This document is the contract between the frontend and the backend. Every endpoint below is marked in the source with an `// API:` comment at the exact point it is called.

---

## 1. Read this first — the non-negotiables

These are not style preferences. Breaking any of them breaks the problem statement.

**1. The SVI engine stays rule-based. Do not replace it with an LLM call.**
The scoring function is deterministic: the same input always produces the same score, and every point is traceable to a matched keyword or answer. This is what makes the decision auditable for a government workflow. An LLM cannot be audited this way. Use an LLM for wording a summary if you like — never for producing the score.

**2. Safety override forces Critical unconditionally.**
It is not additive scoring. If the citizen answers "No" to *Are you safe right now?*, or the transcript matches a suicidal-ideation keyword, the case becomes Critical regardless of total points, and `safetyOverride: true` is returned. Critical cases sort first in the officer queue.

**3. The citizen-facing endpoint never returns the numeric score or the tier name.**
`GET /v1/case/{caseId}/status` must return status, timeline, and verification only. No `sviScore`, no `svi`, no indicators, no officer notes. The citizen sees calm guidance; the officer sees the assessment.

**4. The audit log is append-only.**
Every status change, referral, assignment, and note appends an immutable entry `{ at, actor, role, action }`. Entries are never edited or deleted.

**5. Verification never blocks help.**
Name, caste certificate, and ID are collected *after* support has begun. No endpoint should reject an intake for missing verification. `verification` is a status field (`Unverified` / `Pending documents` / `Verified`), not a gate.

**6. Speech prosody is currently mocked and is yours to build.**
The frontend generates placeholder prosody values and labels them as simulated in the UI. Real pitch, pause, and tremor extraction must happen server-side. This is the biggest single piece of backend work in the project.

---

## 2. Endpoints

### 2.1 Core assessment — build these first

These two are the problem statement. Everything else is supporting infrastructure.

```
POST /v1/intake/statement
```
The single call that creates a case. Triggers NLP indicator extraction and speech analytics server-side, returns the fully scored case.

Request:
```json
{
  "transcript": "string",
  "language": "Hindi",
  "guidedAnswers": { "safe": "No", "needType": "feel unsafe", "contact": "Yes" },
  "audioRef": "string | null",
  "district": "Patna",
  "consent": { "shareVoice": true, "receiveUpdates": true, "shareLocation": false },
  "contactPreference": "Yes"
}
```

Response:
```json
{
  "caseId": "RAH-2026-001249",
  "sviScore": 88,
  "svi": "Critical",
  "safetyOverride": true,
  "textIndicators": ["fear", "threats to family", "suicidal ideation"],
  "speechSignals": [
    { "label": "Pause frequency", "value": "High", "flagged": true }
  ],
  "summary": "string — 2-3 sentences for the officer",
  "recommendations": ["string"]
}
```

```
POST /v1/speech/analyse
```
Prosody extraction. Currently mocked in the frontend.

Request: audio blob or a reference to stored audio, plus language.

Response:
```json
{
  "transcript": "string",
  "language": "hi-IN",
  "prosody": {
    "pauseFrequency": "High",
    "pitchVariation": "Very low (flat affect)",
    "speakingRate": "Slow, halting",
    "tremor": "Detected",
    "longSilences": "3 silences over 4s"
  }
}
```

```
GET /v1/case/{caseId}/speech-analysis
```
Response:
```json
{
  "pitchVariance": 0.0,
  "pauseRatio": 0.0,
  "tremorIndex": 0.0,
  "flaggedSignals": ["string"]
}
```

### 2.2 Citizen — case and identity

```
POST /v1/otp/send            -> { otpId, expiresInSec }
POST /v1/otp/verify          -> { verified: boolean }
POST /v1/case                -> { caseId, status }
```
`POST /v1/case` is called automatically when a statement queued offline is flushed on reconnect. Must be idempotent — the client may retry.

```
GET /v1/case/{caseId}/status -> { status, timeline, verification }
```
Citizen-facing. See non-negotiable #3 — no score, no tier, no indicators.

`timeline` is an ordered array of `{ stage, at, done }` across the five fixed stages: `Received`, `Human Review`, `Support Recommended`, `Referral / Follow-up`, `Resolved`.

```
POST /v1/case/{caseId}/documents     -> { documentId, fileName, status }
POST /v1/case/{caseId}/verification  -> { verificationId, status }
```
Caste certificate and ID upload. Post-support, never blocking.

### 2.3 Support discovery

```
GET /v1/counsellors/search?language=&mode=&district=
    -> { counsellors: [ { id, name, languages[], modes[], availability, specialNeed, district } ] }

GET /v1/support/centres?category={category}&district={district}
    -> { centres: [ { category, type, name, address, timings, phone, distanceKm } ] }

GET /v1/support/nearby?lat={lat}&lng={lng}
    -> { centres: [...] }

POST /v1/urgent/request
    -> { requestId, dispatchedTo, ackAt }
```
`category` is one of: `medical`, `legal`, `sakhi`, `welfare`, `police`.
`modes` is a subset of: `Call`, `Chat`, `Video`.

### 2.4 Officer / admin

```
POST /v1/auth/officer-login  -> { token, role, officerId }
```
`role` is one of: `officer`, `counsellor`, `district_admin`, `welfare_partner`, `sys_admin`.

**RBAC requirement:** `welfare_partner` must not be able to change case status. The frontend hides the control; the backend must also reject the call. Do not rely on the UI for this.

```
GET   /v1/admin/cases?tier=&district=&search=&page= -> { cases: [...], total }
GET   /v1/admin/cases/{caseId}                      -> full case object
PATCH /v1/admin/cases/{caseId}/status               -> { status, updatedAt }
POST  /v1/case/{caseId}/referral                    -> { referralId, type, status }
POST  /v1/case/{caseId}/followup                    -> { followupId, status }
```

`PATCH .../status` accepts: `Human Review`, `Support Recommended`, `Referral / Follow-up`, `Resolved`. Every call appends an audit entry.

`referral.type` is one of: `counselling`, `legal`, `medical`, `sakhi`, `welfare`, `police`, `witness_protection`, `emergency`.

The default `GET /v1/admin/cases` sort is by tier (Critical → Low), then by `sviScore` descending.

---

## 3. The scoring engine

Port this logic exactly. Reference implementation is `assess()` in `src/App.jsx`.

### 3.1 Indicator keyword table

| Indicator | Points | Trigger phrases (substring match, lowercased) |
|---|---|---|
| suicidal ideation | **40** | don't want to live, end my life, kill myself, not want to go on, not want to live, suicide, hurt myself |
| sexual violence | 20 | raped, sexually assaulted, molested, sexual violence |
| physical violence | 16 | beaten, hit me, assaulted, attacked, physically hurt |
| social boycott | 14 | boycott, stopped talking to us, excluded from the village, won't let us |
| threats to family | 14 | threatening our family, threaten my family, harm my children, hurt my family |
| intimidation | 10 | threaten, threatening, intimidate, warned me, warned us |
| extreme vulnerability | 10 | disabled, elderly, child alone, no family left, vulnerable |
| displacement | 10 | had to leave our home, displaced, fled our village, forced out |
| trauma | 8 | trauma, traumatic, haunts me, can't forget, nightmare |
| fear | 8 | afraid, scared, fear, frightened, terrified |
| depression | 8 | hopeless, no point, empty inside, depressed, worthless |
| anxiety | 6 | anxious, anxiety, panic, worried all the time, can't breathe |
| social isolation | 6 | no one talks to, alone, isolated, no one to turn to |
| prolonged legal proceedings | 6 | case has been going on, years in court, no hearing date, still waiting for justice |

**These phrases are English-only and are a prototype stand-in.** Production needs multilingual indicator extraction across all seven supported languages — IndicBERT or MuRIL rather than substring matching. The indicator *vocabulary* above is the contract; the matching method is yours to improve.

### 3.2 Guided answer points

| Answer to "What kind of help do you need?" | Points |
|---|---|
| feel unsafe | 16 |
| stressed or scared | 6 |
| medical | 4 |
| legal | 4 |
| not sure | 2 |

### 3.3 Tier thresholds

Score is clamped to 0–100.

| Score | Tier |
|---|---|
| 70–100 | Critical |
| 45–69 | High |
| 20–44 | Moderate |
| 0–19 | Low |

### 3.4 Safety override

```
if (guidedAnswers.safe === "No")                    -> safetyOverride = true
if (textIndicators includes "suicidal ideation")    -> safetyOverride = true

if (safetyOverride) {
  svi = "Critical"                  // unconditional, regardless of score
  sviScore = max(sviScore, 85)
}
```

---

## 4. Data models

**Case**
```
id                string    "RAH-2026-001249"
name              string
district          string
language          string
supportType       string
svi               "Low" | "Moderate" | "High" | "Critical"
sviScore          number    0-100, officer-only
safetyOverride    boolean
status            "Human Review" | "Support Recommended" | "Referral / Follow-up" | "Resolved"
verification      "Unverified" | "Pending documents" | "Verified"
createdAt         ISO 8601
assignedOfficer   string
transcript        string
textIndicators    string[]
speechSignals     [{ label, value, flagged }]
summary           string
consent           { shareVoice, receiveUpdates, shareLocation }
timeline          [{ stage, at, done }]
auditLog          [{ at, actor, role, action }]   // append-only, newest first
```

**Counsellor**
```
id, name, languages[], modes[], availability, specialNeed, district
```

**SupportCentre**
```
category, type, name, address, timings, phone, distanceKm
```

**AuditEntry**
```
at (ISO 8601), actor, role, action
```

---

## 5. Proposed production stack

For reference — adjust as you see fit, except where it touches a non-negotiable above.

- **ASR:** Whisper or IndicWhisper, multilingual
- **Prosody:** openSMILE or librosa — pitch variance, pause ratio, speaking rate, tremor
- **NLP indicators:** IndicBERT or MuRIL, fine-tuned on the indicator vocabulary in §3.1
- **SVI:** rule engine, deterministic, versioned (see §6)
- **API:** FastAPI, RBAC per the five roles
- **Data:** PostgreSQL; audit log as an append-only table with no UPDATE or DELETE grants
- **Telephony:** IVRS on 14566 for feature-phone intake; SMS gateway for case updates
- **Security:** encryption at rest and in transit, consent-gated retention

---

## 6. Open questions for the backend team

1. **Audio retention.** How long is the original voice recording kept, and under what consent? The citizen consents to sharing a voice statement — that consent needs an expiry.
2. **Rule versioning.** When the keyword table changes, historical cases must remain explainable against the version that scored them. Store `sviEngineVersion` on every case.
3. **Multilingual indicators.** §3.1 is English-only. Which model, and who validates the translated indicator sets?
4. **IVRS mapping.** The guided questions map to press-key inputs cleanly, but free-form voice statements over a phone line need the same ASR path. Same pipeline or separate?
5. **De-duplication.** A distressed person may submit multiple times across channels. Is there a merge strategy?

---

## 7. Frontend notes

- Voice capture uses the browser Web Speech API. It requires a secure context and a real browser tab — it does not work inside sandboxed iframes.
- The `Use sample statement` button loads a fixed realistic statement so a demo never depends on microphone permissions.
- `Demo: simulate risk level` is a prototype affordance for demonstrations. Remove it before any real deployment.
- Offline statements are held in component state and flushed on reconnect. Production should use a service worker with IndexedDB.
- All mock data lives at the top of `src/App.jsx` and can be deleted once endpoints are live.
