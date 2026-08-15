# Errors Log

## 2026-08-15 — Worktree dev server silently served the primary checkout's code

**What didn't work:** After editing files in a git worktree
(`.claude/worktrees/<name>`) and running `npm run dev` from inside it, the
browser kept showing stale/wrong behavior (an old 19-cell board shape
instead of the just-edited 23-cell one) even after killing and restarting
the dev server multiple times, rebuilding, and confirming via `pwd` that
the shell's cwd was genuinely the worktree.

**Root cause:** The worktree never had its own `node_modules` (nobody ran
`npm install` there — only `Edit`/`Write`/`Read` and `npm run build` had
been used, and `build` doesn't require a local `node_modules` for a
workspace package to already be linked correctly if binaries resolve via
a parent directory). Since `.claude/worktrees/<name>` lives *inside* the
primary checkout's own directory tree, Node's module resolution for
`@splendor/shared` walked up past the worktree (no local
`node_modules/@splendor/shared` symlink) and found the *primary
checkout's* `node_modules/@splendor/shared` symlink instead — which
points at the primary checkout's `shared/` directory, not the worktree's
edited copy. `ps aux` + `lsof -p <pid> | grep cwd` on the actual listening
process confirmed this: the running `vite`/`tsx watch` processes had
`cwd` set to the *primary* checkout's `client`/`server` directories, not
the worktree's, even though the `npm run dev` command itself had been
invoked with the worktree as cwd.

**What worked instead:** Run `npm install` inside the worktree once, to
materialize its own `node_modules` (including the `@splendor/shared ->
../../shared` symlink pointing at *its own* `shared/` copy). After that,
`lsof -p <pid> | grep cwd` confirmed the dev server processes' cwd was
correctly the worktree's `client`/`server` directories, and edits were
picked up immediately.

**Note for next time:** Before trusting a dev server's output while
working in a worktree, verify isolation with `lsof -p <pid> | grep cwd`
on whatever process is actually bound to the port in question (`lsof
-iTCP:<port> -sTCP:LISTEN`) — not just `pwd` in the shell that launched
it. If a worktree has no local `node_modules`, run `npm install` there
before starting any dev server or trusting a build; don't assume
`npm run build` succeeding once earlier means the environment is fully
isolated.
