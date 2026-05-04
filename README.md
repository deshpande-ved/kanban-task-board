# Kanban Task Board

A polished, single-page Kanban board with drag-and-drop, anonymous auth, and per-user data isolation. Built for the Next Play Games SDE assessment.

**Live demo:** _(coming soon — Cloudflare Pages)_
**Repo:** https://github.com/deshpande-ved/kanban-task-board

---

## Features

- Four-column board (To Do, In Progress, In Review, Done) with drag-and-drop between columns and reordering within a column. Position and status persist to Supabase on every drop.
- Anonymous sign-in via Supabase auth. Each guest session is a real `auth.users` row, gated by RLS so users only see and modify their own data.
- Tasks: title, description, priority (low/normal/high), due date, status, ordered position.
- Labels: user-created with a name and color, many-to-many with tasks via a junction table. Manage from a dedicated modal.
- Due-date badges color-coded as overdue / today / due soon (≤ 3 days) / later, with relative labels ("3d overdue", "Due in 2d").
- Search and filter: text search across title and description, priority filter, multi-label filter (ANDed). Drag-and-drop pauses while filters are active to avoid corrupting positions.
- Loading skeletons, error banners, empty-state hints.
- Responsive layout — at ≤ 900px the columns become a horizontal-scroll row.

---

## Tech Stack

- **Frontend:** React 19 + TypeScript, Vite 8
- **Drag & Drop:** `@hello-pangea/dnd`
- **Backend / Auth / DB:** Supabase (Postgres + RLS + Anonymous Sign-Ins)
- **Hosting:** Cloudflare Pages
- **Styling:** plain CSS variables + inline styles. No CSS framework.

No separate backend service — the app calls Supabase directly from the browser using the anon key.

---

## Local Setup

1. Clone and install:
   ```bash
   git clone https://github.com/deshpande-ved/kanban-task-board.git
   cd kanban-task-board
   npm install
   ```
2. Create a Supabase project, then in the dashboard:
   - **Authentication → Providers → Anonymous Sign-Ins** → enable.
   - **SQL Editor** → run the contents of [`supabase/schema.sql`](supabase/schema.sql).
3. Copy `.env.local.example` to `.env.local` and fill in your project URL and anon key:
   ```
   VITE_SUPABASE_URL=https://<project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon key>
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```

---

## Database Schema

Three tables, all with RLS enforcing per-user ownership.

```sql
tasks       (id, title, description, status, priority, due_date, position, user_id, created_at)
labels      (id, name, color, user_id, created_at)
task_labels (task_id, label_id)   -- composite PK, junction
```

`status` is a `CHECK`-constrained enum (`todo | in_progress | in_review | done`); `priority` is `low | normal | high`. `user_id` defaults to `auth.uid()` and references `auth.users` with `ON DELETE CASCADE`. Full SQL with policies and indexes lives in [`supabase/schema.sql`](supabase/schema.sql).

---

## Project Structure

```
src/
├── lib/
│   ├── supabase.ts        Supabase client (env-var validated)
│   └── dueDate.ts         Pure helpers: dueState, dueLabel, dueColor
├── types/
│   └── database.ts        Task / Label / TaskLabel types + variants
├── hooks/
│   ├── useAuth.ts         Auto anonymous sign-in, session-aware
│   ├── useTasks.ts        Task CRUD + grouped-by-status + moveTask
│   └── useLabels.ts       Label CRUD + junction-table sync (diffed)
├── components/
│   ├── Board.tsx          DragDropContext, columns, modals, filters
│   ├── Column.tsx         Droppable column with status header
│   ├── TaskCard.tsx       Draggable card with priority + due badge
│   ├── TaskModal.tsx      Create / edit / delete a task
│   ├── LabelManager.tsx   Manage labels (also exports ModalShell)
│   └── SearchBar.tsx      Search + priority + label filter
├── App.tsx                Auth gate → Board
└── main.tsx
```

---

## Design Decisions

- **No separate backend.** Supabase handles auth, RLS, and storage. The browser is the only client. This keeps the surface small and matches the assessment scope.
- **Anonymous auth as the only flow.** Email/OAuth would add friction without changing the demo. RLS gives each anonymous user a clean, isolated workspace.
- **Position-based ordering, not linked list.** Each task has an integer `position` within its column. On drop, both source and destination columns are recomputed locally and only the rows whose `(status, position)` actually changed are sent to Supabase, in parallel. Optimistic local update first; the server is the persistence layer, not the source of truth during drag.
- **Filters pause drag-and-drop.** When the visible list is filtered, the destination index from `@hello-pangea/dnd` doesn't map to the real `position` value. Rather than build a fragile mapping, the app shows a banner and ignores drops while filters are active.
- **Labels diffed on save.** When the user toggles labels in the task modal, `setTaskLabelIds` computes only the additions and removals against the current set, instead of wiping and re-inserting. Cheaper, and avoids spurious `task_labels` churn.
- **Plain CSS variables, no framework.** Tokens (`--accent`, `--surface`, `--radius`, etc.) live in `index.css`; components use them inline. Keeps the bundle small and the styling boundary obvious.

---

## Tradeoffs

- **Optimistic updates without rollback.** If a Supabase update fails mid-drag, the UI shows the new state but the DB doesn't reflect it. A reload reconciles. For a real app I'd add retry + visible error toasts; for this scope a console error and the banner suffice.
- **No realtime subscription.** The hooks fetch once and update locally. A second tab won't see changes from the first until a refresh. Supabase realtime is straightforward to bolt on later.
- **No undo.** Deletes are confirmed via `confirm()`; no soft delete or undo stack.
- **Inline styles over CSS modules.** Faster to iterate alone; less ergonomic in a team. With more components I'd move to CSS modules or a token-driven utility layer.

---

## Scripts

```bash
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build
npm run preview  # serve the production build locally
npm run lint     # eslint
```
