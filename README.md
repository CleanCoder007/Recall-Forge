# Recall Forge

A configurable, browser-local study workspace created for Bongie's Senior Java Backend interview preparation. The canonical 154-day plan and all 3,278 question texts/IDs are included. Optional AWS and Kafka tracks draw topic ideas from the supplied reference website without inserting additional work into the plan.

## Run and edit

Serve `dist/` with any ordinary static HTTP server. There is no dependency installation or build step. The production static directory is declared in `.openai/hosting.json`.

- `dist/curriculum.json`: 154 original day records, exact backend tasks and DSA assignments, budgets, questions, draft reference answers, track catalogue and request-flow content.
- `dist/app.mjs`: views and interactions, focus timer, audio, notes, JSON/TSV transfer, Anki UI.
- `dist/core.mjs`: review scheduling, progress, streaks, XP and import validation.
- `dist/anki.mjs`: API v6 transport, loopback-only endpoint validation, bounded request timeout and response errors.
- `curriculum-integrity.json`: fingerprints checked after an initial direct comparison against the preparation-plan source. Adding optional tracks does not change these baseline fingerprints.

## Add a track for any subject

Use Learning tracks → Add a track for a title and lesson list. For detailed prompts, answers and resource links, download/import the JSON template. Track and lesson IDs must be unique and stable. A track is an object with `id`, `title`, `description`, optional `icon`/`color`, and a nonempty `lessons` array. Lessons use `id`, `title`, `summary`, `minutes`, `prompt`, `answer`, and an optional HTTP(S) `resource`. You can also edit the built-in `tracks` array in curriculum.json. Supported visual colors: mint, blue, violet, amber, pink.

## Learning model

Completion is explicit attempted effort, not proof of mastery. R records accurate unaided recall, A needs a separate implementation/test/trace/diagnosis proof, and G records assistance. A scheduled review can retain R while marking application G and retrying tomorrow. XP is not a readiness score. Repeating a completion or assessment does not repeatedly grant its unique XP award.

Default manual-card targets: +1, +3, +7, +14, +30 calendar days from actual learning. The original plan's core days use this cycle. Non-core working-day automatic cards use +1, +7, +14, +30; weekly/consolidation days remain visible in the original plan. This adapts the printed queue to actual completion, rather than pretending a skipped calendar day was learned. Failed/guided work retries tomorrow without advancing the stage. Late recall advances one stage and avoids scheduling a second same-day review. After the final target the finite baseline cycle is complete; queue/practice again as needed.

At most two scheduled cards per local day, with 8 minutes each plus 4 minutes correcting/logging. Excess remains visible; it is never silently completed. The R/A/G assessment is self-reported, not automatic evaluation of free text or code. Answers are concise draft references recovered from the answer-book work; Java implementations and production integration claims are not certified by their presence in the app.

Preserved allocations: weekdays 55 backend + 45 DSA + 20 review; Saturday 140 lab + 20 correction + 20 review; Sunday 25 assessment + 15 planning + 20 review. To fit Pomodoro breaks into the same elapsed-time cap, breaks consume practice allocation and never the protected review. This explicitly reduces active practice time rather than adding unbudgeted hours. Timer defaults are 25/5/15; after four focus sessions it suggests a longer break. User starts each next mode deliberately. Timer completion rewards and minutes are based on elapsed countdown sessions, not page visits; timers cannot verify attention or produce audio while the browser is closed.

## Sound

An original short rising chime is synthesized with Web Audio. The provided YouTube video was identified as Microsoft To Do task-done sound variations; its media was not downloaded or bundled. Settings lets the user upload a short audio file (under 2 MB). Browser audio requires user interaction and can be muted/blocked by device policy. Reduced motion and volume controls are included.

## AnkiConnect

Anki Desktop and AnkiConnect must run on the same computer as the visitor's browser. Connect explicitly from Settings. The transport uses API version 6, `requestPermission`, `version`, `deckNames`, `modelNames`, `modelFieldNames`, `createDeck`, `findNotes`, `addNote`, `findCards` and `guiDeckReview`. Export requires a Basic note model with Front/Back. Stable question-ID tags suppress repeated exports, and each request handles error envelopes and timeout. Up to 100 selected notes per send. This sends selected cards only; it does not upload the whole bank automatically or overwrite Anki scheduling.

The API key exists in session memory only and is not in app state/backups. Keep Anki bound to 127.0.0.1 and approve only the exact deployed site origin. The guide does not advise wildcard CORS or exposing Anki to a LAN. Hosted HTTPS pages may encounter CORS, mixed-content or local-network permission restrictions. TSV export is the fallback. On Android, localhost is the phone, not the user's PC. Anki reviews are not automatically mirrored as application proofs or XP. Remote browser QA could not test a real desktop Anki instance; the request contract and error paths have automated mock tests.

## Persistence

Progress, custom tracks, notes, review state, awards and timer sessions live in localStorage on each origin/browser. There is no cloud sync or account-wide progress database. Export backups regularly and use the restore preview/confirmation. Restore downloads current progress first, then replaces local progress. Clearing site data or changing devices loses access to unsaved local progress. Source code is versioned separately from runtime progress.

## Reference audit (17 November 2026)

Observed: dashboard, resume/warmup controls, learning-track cards, topic progress, XP/levels/streaks, metrics, heatmap/readiness UI, daily question and answer reveal, notes interface, planner tasks with edit/delete controls, search/command-palette UI, theme toggle, sidebar controls and request-flow links. Track tabs: Java, Spring Boot, Microservices, Kafka, AWS, Interview Prep. Profile explicitly described local browser storage and exposed a clear-data control.

A Java Basics visit increased completion from 0 to 1: the new app deliberately requires explicit attempted work and separate evidence. The reference roadmap was labelled 45-day but displayed 43 sessions extending to Day 60. Settings did not change the inspected panel; notification badge and some controls were visible but their deeper behavior was not established. No spaced-repetition scheduler, Pomodoro timer or AnkiConnect integration was observed in the inspected sections. The app's Settings → Feature comparison distinguishes observations from additions; it does not claim a complete source-code audit of the reference.

Attention/memory suggestions were retrieved from the user's Improve Attention Memory conversation: close notes and recall first; +1/+3/+7/+14/+30 reviews with earlier failed retries; one measurable task, remove phone/notifications, 25/5 sessions with longer recovery after four, screen-free breaks, regular sleep/movement and tracking delayed recall/useful focus. The shared chat URL could not be fetched directly; prior-conversation retrieval supplied the suggestions. References: https://java-aws-kafka-mastery.vercel.app/ ; https://www.youtube.com/watch?v=dkw-k_mtHLE ; https://github.com/FooSoft/anki-connect (points to the maintained repository).

## Verification performed

`node --test test.mjs`: 11 passing tests cover calendar edges, interval anchoring, G priority/retries, late/mature cycles, duplicate XP/enrollment, streak/completion semantics, import validation, all 154 day/question fingerprints, R + guided application and mock Anki request/error handling. JS syntax checks pass.

Browser checks: global command search for Kafka across days/tracks/questions and task editing; dashboard rendering; explicit completion and XP; persistence after reload; attempt-before-answer gate; independent R without automatic A; creation of a non-programming track; focus countdown and completion; restored fixture with three overdue cards, R + application G and G retries due tomorrow, two-card cap with remaining card disabled; exact-ID search, TSV download, backup preview/restore and task creation. Fixed the file-picker DOM attachment defect found by restore QA. Real Anki and native phone hardware/audio output were not available for end-to-end verification. Responsive breakpoints are implemented; the browser environment did not expose viewport resizing for a native mobile-size test.


## Erase learning progress

Settings → Backup & portability → Start fresh → Erase learning progress opens a confirmation dialog. Cancel/close/Escape leaves progress untouched. The final **Download backup & erase progress** action starts a JSON backup download, returns the plan to Day 1, stops and clears the timer, and clears completed days/lessons, XP/levels/streaks, assessments, scheduled reviews, review history and focus sessions. It preserves preferences (including sound), notes, tasks, custom tracks and flashcard definitions. Anki decks and other browsers are unaffected. Recover the former state with Settings → Restore backup using the downloaded JSON file. No progress is erased merely by deploying this feature or opening the dialog.

Reset verification: a local browser fixture with completed work, 415 XP, assessments, reviews, custom study content and a running timer retained progress on Cancel. Confirming downloaded the pre-reset backup and reset progress/timer after reload. Exported post-reset state confirmed preserved study content/preferences and empty learning records. Restoring the downloaded pre-reset backup recovered Day 48 and 415 XP. No production progress was erased during QA.
