# Memes, Illustration & Funny Motion — Study Notes for ChatNar

What the experts say, boiled down to rules we can use in ChatNar (live streams, chat, YES/NO predictions, coins).

---

## 1. Memes — why some spread and others die

**Expert: Limor Shifman, *Memes in Digital Culture* (MIT Press, 2014)**

- A meme is not one image. It is a **family** of posts that people copy, imitate and **change**.
- **Viral ≠ meme.** A viral clip is shared unchanged. A meme gets remixed. Remixing is the engine.
- What helps spread: a **simple message**, an **easy action to join in**, and a **strong feeling**.
- Memes compete for attention. Only ones that fit their community survive.

**From meme culture (Know Your Meme, creator guides):**
- Lifecycle: origin → template → peak remix → mainstream → dead. It is getting faster.
- A familiar template means the audience already knows the joke's shape. Your job is only **the twist**.
- Reaction images (a face cut from a clip) are the most reusable kind — they are emotions people can "speak" with.

**ChatNar takeaways**
- Give users **templates, not finished jokes**: reaction stickers, "caption this clip" moments, prediction-result cards they can remix and share.
- Make joining **one tap** (react, caption, share a result card).
- Let the community **create** emotes — memes that come from inside a community stick best.
- Expect formats to die. Rotate seasonal/limited stickers instead of fighting it.

---

## 2. Why things are funny

**Expert: Peter McGraw & Caleb Warren — Benign Violation Theory (Humor Research Lab)**

- Funny = something feels **wrong** (a violation) **and** **safe/okay** (benign) **at the same time**.
- Too safe = boring. Too wrong = offensive/hurtful. The sweet spot is in between.
- Note: popular, but scholars still debate it.

**Classic comedy structure: Rule of Three**
- Two beats set a pattern, the third **breaks** it. Keep it quick so people don't see it coming.
- Setup → build tension → payoff with a twist.

**ChatNar takeaways**
- Losing a prediction is a small "violation". Make it **benign**: a funny loss animation (coin rolls away, character faceplants) instead of a cold "You lost".
- Tease, never insult. Roast the *situation*, not the user.
- Use rule of three in onboarding / streaks: 2 normal celebrations, 3rd one goes over the top.

---

## 3. Illustration & cartooning

**Expert: Scott McCloud, *Understanding Comics* (1993)**

- **Amplification through simplification**: strip an image to its essence and the meaning gets **louder**.
- Simplifying is **choosing which details matter**, not just removing them.
- The simpler a face, the more people **see themselves** in it. That's why simple mascots feel personal.

**Emote design (Twitch creator guides — vendor sources, verify specs):**
- Design for the **smallest size first** (28×28 px is the real test), then scale up.
- No thin lines, no tiny details, **no text** at small size.
- Bold shapes, high contrast, **one focal point**, clear silhouette.

**ChatNar takeaways**
- Our mascot/stickers: big head, simple face, thick outlines, one strong color from the palette (orange `#FF3D00`, green `#53FC18`, gold `#FFD700`).
- Test every emote on black `#000` at 28px. If you can't read the emotion instantly, simplify.
- Exaggerate the expression — eyes and mouth do 90% of the work.

---

## 4. Funny motion design

**Experts: Frank Thomas & Ollie Johnston, *The Illusion of Life* (Disney's 12 principles)**
**Richard Williams, *The Animator's Survival Kit*** — the bible on timing & spacing.

The principles that make motion **funny**:

| Principle | What it does | In ChatNar UI |
|---|---|---|
| **Squash & stretch** | Gives weight, bounce, life | Buttons squash on press; coin stretches as it drops. Keep UI squash subtle (~2–5%), go big on characters |
| **Anticipation** | A wind-up before the action | Coin pulls back slightly before flying into the wallet |
| **Exaggeration** | Pushes the feeling past real | Big win = screen shake + confetti; mascot eyes pop |
| **Timing** | Fast vs slow sells the joke | Snappy in, short **hold**, then payoff |
| **Holds** | A pause lets the joke land | Freeze 200–400ms on the "uh-oh" face before the loss animation |
| **Overshoot / follow-through** | Things settle with a wobble | Badge pops in, overshoots, settles |
| **Secondary action** | Small extras add personality | Mascot blinks/idles while waiting |

**Studios to study (reels on their sites/Vimeo):**
- **Giant Ant** (Vancouver) — quirky, bouncy, story-driven.
- **BUCK** — huge range; mixes 2D characters with live action for surreal humor.
- **Oddfellows** — polished illustrated style, makes complex things easy.
- **Cub Studio** — known specifically for playful, humorous motion.

**Product example: Duolingo**
- Characters built in **Rive** with **state machines** (idle, celebrate, sad, talking + mouth shapes) instead of hundreds of video files.
- Humor and surprise keep repeated moments fresh.

**ChatNar takeaways**
- Use **Rive** (or Lottie) for the mascot with states: `idle`, `watching`, `bet-placed`, `win`, `lose`, `streak`.
- Our existing `coin-drop` animation (`tailwind.config.ts`) only fades/slides. Add anticipation + overshoot to make it feel alive:
  `cubic-bezier(0.34, 1.56, 0.64, 1)` (back-out / overshoot).
- Respect `prefers-reduced-motion` — turn shakes and big bounces off.

---

## 5. Reading list (from the experts)

1. *The Illusion of Life: Disney Animation* — Frank Thomas & Ollie Johnston
2. *The Animator's Survival Kit* — Richard Williams
3. *Understanding Comics* — Scott McCloud
4. *Memes in Digital Culture* — Limor Shifman
5. *The Humor Code* — Peter McGraw & Joel Warner
6. *Chuck Amuck* (1989) — Chuck Jones (Looney Tunes timing & gag rules)

## Sources
- https://popmatters.com/memes-digital-culture-limor-shifman
- https://academic.oup.com/jcmc/article-abstract/18/3/362/4067545
- https://leeds-faculty.colorado.edu/mcgrawp/pdf/mcgraw.warren.2010.pdf
- https://www.npr.org/sections/13.7/2016/04/25/475622815/hey-what-are-you-laughing-at
- https://en.wikipedia.org/wiki/Rule_of_three_(writing)
- https://www.supersummary.com/understanding-comics/introduction-chapter-2-summary
- https://cf-production.makeemoji.com/blog/twitch-emote-size-guide
- https://ixdf.org/literature/article/ui-animation-how-to-apply-disney-s-12-principles-of-animation-to-ui-design
- https://lottiefiles.com/blog/tips-and-tutorials/mastering-disney-12-principles-animation
- https://www.awn.com/print/animationworld/animators-survival-kit-most-valuable-how-animate-book-you-will-ever-want-own
- https://motionarray.com/blog/industry-spotlight-giant-ant
- https://motionarray.com/learn/motion-design/industry-spotlight-buck/
- https://motionarray.com/blog/industry-spotlight-oddfellows
- https://www.moonb.io/blog/best-motion-graphics-companies
- https://blog.duolingo.com/world-character-visemes
