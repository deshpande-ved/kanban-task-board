# Kanban Task Board

A Kanban board built for the Next Play Games SDE intern assessment. You can create tasks, drag them between columns (To Do / In Progress / In Review / Done), tag them with labels, set priorities and due dates, and search/filter the board.

**Live demo:** _coming soon — deploying to Cloudflare Pages_
**Repo:** https://github.com/deshpande-ved/kanban-task-board

## Features

- Four-column Kanban board with drag-and-drop between columns and reordering inside a column. Position and status are saved to the database.
- Anonymous sign-in through Supabase. Each guest gets their own row in `auth.users` and only sees their own tasks (enforced by RLS).
- Task fields: title, description, priority (low / normal / high), due date, status, position.
- Labels: create your own with custom colors and assign them to tasks. Tasks ↔ labels is many-to-many through a junction table.
- Due-date badges on cards: red if overdue, orange if due today, yellow if due in the next 3 days.
- Sidebar with stats (Total / In flight / Done / Overdue) and label filters.
- Search by title or description, filter by priority, filter by labels.
- Dark theme, responsive layout (sidebar stacks above the board on mobile, columns scroll horizontally).

## Tech Stack

- React + TypeScript + Vite
- `@hello-pangea/dnd` for drag-and-drop
- Supabase (Postgres + RLS + Anonymous Auth)
- Cloudflare Pages for hosting

No separate backend — the React app calls Supabase directly.

## Running locally

1. Clone and install:
   ```bash
   git clone https://github.com/deshpande-ved/kanban-task-board.git
   cd kanban-task-board
   npm install
   ```
2. In your Supabase project:
   - Authentication → Providers → enable **Anonymous Sign-Ins**.
   - SQL Editor → run the contents of `supabase/schema.sql`.
3. Copy `.env.local.example` to `.env.local` and fill in your project URL and anon key.
4. Start the dev server:
   ```bash
   npm run dev
   ```

## Database

Three tables, all with row-level security so users only see their own data.

- `tasks` — id, title, description, status, priority, due_date, position, user_id, created_at
- `labels` — id, name, color, user_id, created_at
- `task_labels` — task_id, label_id (composite primary key)

Status is constrained to `todo | in_progress | in_review | done`. Priority is `low | normal | high`. The `user_id` defaults to `auth.uid()` so the current signed-in user is automatically the owner.

Full SQL is in `supabase/schema.sql`.

## Project layout

```
src/
├── lib/
│   ├── supabase.ts        Supabase client setup
│   └── dueDate.ts         Helpers for due-date state and labels
├── types/
│   └── database.ts        TypeScript types matching the tables
├── hooks/
│   ├── useAuth.ts         Anonymous sign-in
│   ├── useTasks.ts        Load and modify tasks
│   └── useLabels.ts       Load and modify labels + task-label links
├── components/
│   ├── Board.tsx          Main page — sidebar + columns + modals
│   ├── Sidebar.tsx        Stats and label filters
│   ├── Column.tsx         Droppable column
│   ├── TaskCard.tsx       Draggable card
│   ├── TaskModal.tsx      Create/edit task
│   ├── LabelManager.tsx   Create/delete labels
│   ├── Modal.tsx          Shared modal wrapper
│   └── SearchBar.tsx      Filter types and constants
├── App.tsx
└── main.tsx
```

## Notes

- I disabled drag-and-drop while filters are active so the position values don't get out of sync (the visible index doesn't always match the real index in the database).
- After a task move, I just reload the tasks instead of trying to keep local state perfectly in sync. It's a little slower but it's much harder to get wrong.
- Modal styling is mostly inline. With more time I'd pull it into CSS modules.

## Scripts

```bash
npm run dev      # dev server
npm run build    # production build
npm run preview  # serve the production build locally
npm run lint     # eslint
```
