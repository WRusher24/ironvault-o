# IronVault — User Guide

Welcome to **IronVault** (آيرون فالت) — your private vault for tracking progressive overload and personal records. This guide walks you through everything the app can do.

---

## 1. Creating Your Account

1. Open the app and tap **إنشاء حساب مجاناً** (Create a free account).
2. Fill in:
   - **الاسم** — your name or gym nickname.
   - **البريد الإلكتروني** *or* **رقم الجوال** — at least one is required.
   - **كلمة المرور** — 8 characters or more.
3. Tap **إنشاء الحساب والبدث** — you are signed in **instantly**. No admin approval, no waiting.

> Your account is a 100% private data container. Nobody else can see your exercises, logs, or PRs.

---

## 2. Logging a Personal Record

The fastest way to log a lift:

1. Tap the green floating button **+ تسجيل رقم قياسي جديد** (available on every screen), or the **تسجيل رقم قياسي** button on an exercise's page.
2. Pick your exercise — type in the search box to filter by Arabic or English name.
3. Enter:
   - **الوزن (كجم)** — weight in kilograms (e.g. `82.5`).
   - **التكرارات** — reps performed at that weight.
   - **ملاحظة** (optional) — e.g. `بار + 30 كجم` or `Inside Hamsters`.
   - **التاريخ** — defaults to today; you can backdate it.
4. Tap **حفظ الرقم القياسي**.

### PR Celebration

If the weight you entered is higher than your previous best for that exercise, a full-screen celebration fires: confetti, a glowing star badge, and your new record. The entry is also marked **رقم قياسي** in the timeline.

---

## 3. Managing Exercises

### Adding an exercise

1. From the dashboard, tap **إضافة تمرين**.
2. Fill in the Arabic name (required), English name (optional), category, and notes.
3. **Upload a photo** — tap the image area to attach a machine setup, grip reference, or form cue (JPEG/PNG/WebP/GIF, max 5 MB). Photos are stored securely in Vercel Blob.
4. Tap **إضافة التمرين**.

### Editing or deleting

Open any exercise from the dashboard list. Use the pencil icon to edit (including replacing the photo) or the trash icon to delete the exercise and all of its history.

### Categories

Tap **إدارة التصنيفات** on the dashboard to add custom muscle groups (e.g. **الجذع** / Core), change their color and icon, rename them, or delete them. A category that still contains exercises cannot be deleted — move or delete those exercises first.

---

## 4. Viewing Your Progress

Open any exercise to see:

- **Current PR banner** — your best weight and reps.
- **Progress graph** — weight over time. Points marked with a gold **PR** star are record-breaking lifts. Hover or tap a point to see exact weight, reps, and date.
- **Chronological timeline** — every entry with weight, reps, date, and notes. Use the pencil icon to edit any entry or the trash icon to delete it.

---

## 5. The Dashboard

- **Header stats** — total PRs broken, consecutive training weeks, PRs from the last 7 days, and a featured exercise highlight.
- **Motivational line** — changes based on your recent activity.
- **Search bar** — instantly filters exercises across all categories by Arabic or English name.
- **Muscle group grid** — tap any category card to filter the exercise list to that group.

---

## 6. Exporting Your Data (CSV)

1. Open **تصدير البيانات** from the bottom navigation.
2. Tap **تحميل الملف الآن**.
3. A CSV file downloads with all your history: exercise names (Arabic + English), categories, weights, reps, notes, and dates.

The file includes a UTF-8 BOM, so it opens with correct Arabic text in **Excel** and **Google Sheets**. You can back it up, import it into a spreadsheet, or keep it forever — your data is yours.

---

## 7. Account & Privacy

- **حسابي** shows your profile info and membership date.
- Your data is strictly isolated per account — enforced at the database query level, not just the UI.
- Tap **تسجيل الخروج** to end your session. Sessions expire automatically after 7 days.

---

## Tips

- Log your lifts **right after your set** — the app is designed for one-thumb entry between heavy sets.
- Backdate entries if you forget to log at the gym.
- Use notes to track equipment (`بار + 20 كجم`) or gym location — they appear in your CSV export.
