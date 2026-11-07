---
name: military-news-video
description: House style for our vertical military/geopolitics news update videos with a Tunisian-dialect voice-over. Mixes two reference styles - "Paper Desk" (beige paper collage with photo cards, yellow highlighter titles) and "Sat-Map" (animated satellite map with icons, strikes and routes). Use when writing a script, a shot list, captions, or animating a video for this channel.
---

# Military News Video — House Style

Two reference videos (TikTok, @mahm0udallam, Egyptian dialect) were analysed at
2 fps (every caption change and every animation step). This file stores both
styles, the script structure, and the rules for mixing them in Tunisian.

- `reference/style_A.jpg`, `reference/style_A_sequence.jpg` — Style A, Paper Desk
- `reference/style_B.jpg`, `reference/style_B_sequence.jpg` — Style B, Sat-Map
- `reference/script_A.md`, `reference/script_B.md` — the two scripts, rebuilt from the captions, with timings

## 0. Shared format (both videos)

| Item | Value |
|---|---|
| Canvas | 9:16 vertical, 1080x1920, 30 fps (references are 576x1024 TikTok re-encodes) |
| Length | A = 2:53 + 3 s end card; B = 1:14 (excerpt). Target: 60–120 s |
| Hard cuts | Almost none. Everything is one continuous animated "camera"; shots change by slide, wipe, zoom |
| Visual beat | A new visual event every 1–2 s (a card enters, a circle draws, a label pops, a zoom) |
| Captions | Always on. 2–5 words per caption, ~1 caption per second, burned in |
| Caption box | Near-black `#131313` (~90% opacity), rounded corners ~8 px, white bold Arabic sans, centred, at ~73% of height (B) or overlapping the bottom of the main photo card (A) |
| Logo | Calligraphic signature in a thin white square outline, top-right, always on |
| Audio | Voice-led, very dense (~2.3–2.6 words/s), short breath pauses only at "..." beats. Loudness ~-21 LUFS (A), LRA < 3 LU = compressed, steady delivery. Music bed is low/minimal; voice carries the video |
| End | A: "شير الفيديو وعرف الناس..." then a 3 s platform end card |

Caption writing rule: captions are the voice-over split into chunks, word-for-word,
with "..." where the narrator pauses for suspense. A chunk can end mid-phrase
(e.g. "مع بعض دلوقتي... إيران") to pull the viewer into the next caption.

## 1. Style A — "Paper Desk" (politics, people, numbers, documents)

Look: a top-down desk/board.
- Background: textured beige paper `#ccc3b4`, soft vignette.
- Main element: one **photo card** — white border (~3%), slight drop shadow, sometimes rotated 2–4°, sitting on a stack of **typed-document sheets** (`#f8f4ec`, grey line "text").
- **Title highlighter**: big bold black Arabic word(s) above the photo; a yellow marker stroke `#f6cd40` wipes in behind it right-to-left (0.4 s). Used for the 1–3 key words of a section: "أسوأ كابوس", "بداية نهايته", "الصدمة الحقيقية", "حرب إيران", "في ليلة واحدة", "محفظة الدولة".
- **Hand-drawn annotations** (draw-on, 0.3–0.5 s): yellow ellipse around a face/object, thin black or yellow arrows, dashed curved arrows, red underline under a name, red X / strike-through over a word ("الانتخابات اتسرقت" crossed out), red horizontal rule lines.
- **Small label tags**: white rectangular tags with thin black outline and connector lines (bracket style) naming people/places: "جيمس تالاريكو", "كين باكستون", "واشنطن", "مجلس الشيوخ / مجلس النواب". Relationship tags with lines: "أخت", "حليف ترامب".
- **Stickers**: party logos, flags (small, white border), crossed-out logo for a loss.
- **Data graphics in paper style**: big counter numbers with tally marks (0 → 38 سنة), percentage + waffle grid filling square by square (0% → 74%), day counters (8 → 60 يوم), seismograph line that spikes for "الزلزال", hemicycle of dots for a parliament, calendar with check boxes ("يومين").
- **Map inside a card**: satellite map with a flag overlay, region outline circled in yellow, flag tags — the bridge to Style B.
- **Dark title card**: for the big pivot ("بس الصدمة الحقيقية") the paper turns into a dark slate `#17181d → #2a2d34` gradient with centred white title + yellow highlighter + red underline.
- **Black & white photo** for the "fallen/defeated" person (Trump in Oval Office "مشلول", deceased senator).
- Transitions: a new card slides in from the side over the old one; page-turn wipe with a thin yellow diagonal line; zoom-out to show two cards side by side (before/after, cause/effect: gas price card + rally card).

Motion: slow constant push-in (Ken Burns ~3%/5 s) on the active card, cards drop in with a small overshoot + shadow, annotations always *draw* (never just appear).

## 2. Style B — "Sat-Map" (geography, military moves, strikes)

Look: realistic satellite imagery (Esri World Imagery style, attribution "Esri, Vantor, Earthstar Geographics" bottom-left), warm desert tones, deep teal sea `#0f3a45`.
- **Camera**: continuous zooms and pans between locations (region → country → mountain → back out). Country highlight = green tint over the country (Iran) with a white circle that pulses/zooms.
- **Site markers**: yellow radiation icon in a dashed yellow circle; red pin + white label with Latin + Arabic name ("Pickaxe / جبل الفأس"); city labels in small white Arabic text (أصفهان، بوشهر، مضيق هرمز، خليج عُمان).
- **Radius zones**: soft semi-transparent yellow discs that grow around sites.
- **Routes / cables / tracks**: thin cream lines drawn along the sea (internet cables), dotted white line for a ship track, small circular ship icons that blink and disappear (= "AIS off").
- **Radar**: translucent green radar cone sweeping.
- **Cutaway illustration**: flat 2D cross-section (mountain over rock layers with tunnel halls), pops up above a pin with two thin leader lines to the point; then flips to top-down tunnel schematic (yellow tunnel lines with nodes).
- **Strike sequence**: red dashed target ring + crosshair locks on → flat bomb illustration (olive green, yellow band) drops vertically → shockwave rings (white/red) expand → glow.
- **Explainer icons** (flat, slight 3D, white outline): blister of pills with "sparkle" dashes, thyroid organ + blue shield with check, connected to the site by a dotted line.
- Everything pops with a scale-overshoot (0 → 110% → 100%, ~0.25 s); icons have a subtle idle bob or pulse.

## 3. Script structure (shared by both)

1. **Cold-open hook (0–8 s)** — the most alarming facts, stacked, present tense, no intro, no greeting. B: "في كام خبر يقلق بيحصلوا مع بعض دلوقتي... [fact 1]... وفي نفس الوقت [fact 2]". A: "[person] بيعيش النهارده أسوأ كابوس في تاريخه... كله في ليلة واحدة".
2. **Stakes line (8–20 s)** — what this means / where it leads ("ودي غالبا هتكون بداية نهايته...").
3. **Pivot question** — always a spoken question: "طب إيه اللي بيحصل بالظبط؟" / "طب إزاي الزلزال ده حصل؟". Then "القصة بتبدأ / الحكاية بدأت..."
4. **Backstory + geography** — zoom to the place, name it, explain what is there and why it matters ("الجبل ده إيران مخبية جواه...").
5. **The new development** — "لكن من كام ساعة... فجأة..." + concrete details (names, places, numbers).
6. **Explain the detail** — why it matters in one simple line (pills → protect thyroid from radiation).
7. **Second thread / escalation** — "والمشكلة إن ده مكانش الخبر الوحيد..." or "بس الصدمة الحقيقية مكانتش هنا...". Repeat 4–6 for this thread.
8. **Counter-point** — "هو آه لسه... بس بحسب الخبراء..." (balance, shows both sides).
9. **Payoff / circle back** — call back to the opening image (A: "الترابيزة اتقلبت" opens and closes the video; "في ليلة واحدة" too).
10. **CTA** — "شير الفيديو وعرف الناس بالتطورات دي".

Writing devices used constantly:
- "..." suspense breaks before a key word.
- Precise specifics: names in quotes ("آدم حمودي"), numbers (74%، 38 سنة، 60 يوم), place names.
- Short clauses chained with و / وفي نفس الوقت / وتحديدا / لكن.
- Each new sentence = a new visual. Write with the visual in mind.

## 4. Mixing rule for our videos

| Content in the line | Style to use |
|---|---|
| Location, troop/ship move, base, strike, missile range, border, sea route | B — Sat-Map |
| Leader, statement, official, party, vote, sanction, budget, quote | A — Paper Desk photo card |
| Numbers, counts, %, durations, casualties | A data graphic (counter, waffle, tally) — can sit over a map |
| Weapon/system explanation | B flat cutaway illustration, can be framed as a Paper Desk card |
| Big reveal / pivot | A dark title card with yellow highlighter |

Bridges between the two: (1) a map that zooms out until it is a photo card lying on the paper desk; (2) a paper card that zooms in until the map fills the frame; (3) a Paper-Desk label tag / yellow ellipse drawn on top of the satellite map. Keep ONE caption box design across both so it feels like one channel. Keep the logo top-right.

## 5. Tunisian voice-over adaptation

The references are Egyptian. Our VO is Tunisian (Derja), same energy: fast,
confident, conversational, storyteller — not a formal news anchor. Captions follow the
spoken Tunisian exactly (MSA is fine for proper nouns and technical terms).

| Egyptian (reference) | Tunisian (ours) |
|---|---|
| دلوقتي | توّا |
| إيه؟ / إيه اللي بيحصل؟ | شنوّة؟ / شنوّة اللي قاعد يصير؟ |
| إزاي | كيفاش |
| ليه | علاش |
| عايز / عايزين | يحب / يحبّو |
| بتاع / بتاعه | متاع / متاعو |
| كده / زي كده | هكّا |
| كتير / جامد | برشا / ياسر |
| مش | موش / ما...ش |
| عشان | باش / على خاطر |
| لسه | مازال |
| برضو | زادة |
| جوّه | لداخل |
| بيعمل (progressive) | قاعد يعمل |
| هيعمل (future) | باش يعمل |
| طب... | أما... / يا خي... |
| بقالهم فترة | عندهم مدّة |
| حصل | صار |
| اللي فاتوا | اللي فاتو |
| شير الفيديو وعرّف الناس | بارتاجي الفيديو وخلّي الناس تعرف / شارك الفيديو |

Pivot lines in Tunisian:
- Hook: "فمّا برشا أخبار تخوّف قاعدة تصير في نفس الوقت توّا..."
- Question: "أما شنوّة اللي قاعد يصير بالضبط؟" / "كيفاش وصلنا لهنا؟"
- Start story: "الحكاية تبدا من..."
- Escalation: "والمشكل إنو هذا موش الخبر الوحيد..." / "أما الصدمة الحقيقية موش هوني..."
- New development: "أما من كم ساعة برك... فجأة..."
- Counter: "صحيح مازال عندو... أما حسب الخبراء..."
- CTA: "شارك الفيديو وخلّي الناس تعرف شنوّة قاعد يصير."

## 6. Script output format

When writing a script for this channel, deliver a table with one row per caption chunk:

| # | Time | VO (Tunisian) — the caption text | Style | Visual / animation |
|---|---|---|---|---|

Aim for 2–5 words per row, ~1 s per row, 60–120 rows for 1–2 min. Mark "..." pauses.
Every row must have a visual action. Check facts and give sources for each claim before production.
