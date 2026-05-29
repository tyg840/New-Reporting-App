# Agent Instructions

## Project Commands

- Use Bun for dependency installation and scripts.
- Install dependencies with `bun install`.
- Run development with `bun run dev`.
- Run production builds with `bun run build`.
- Start the production server with `bun run start`.
- Run project checks with `bun run lint` when relevant.

## Development Data

- During development, store all user data in browser `localStorage`.
- Do not add a production database, backend persistence, or external storage service unless the user explicitly approves it first.
- Keep local development data easy to reset from the browser.

## Model API

- Use OpenAI for model API calls throughout the project.
- Keep server-side model calls behind local API routes so API keys are not exposed to the browser.
- Use `OPENAI_API_KEY` for live API access and `OPENAI_MODEL` for model overrides.

## Planning And Confirmation

- Before modifying files, present a plan and ask the user for confirmation.
- Exploratory, read-only commands do not require confirmation.
- For risky, destructive, dependency, security, or data-affecting changes, clearly call out the risk before asking for approval.

## Working Style

- Keep changes scoped to the requested task.
- Preserve existing user work and avoid reverting unrelated changes.
- Follow existing project patterns before introducing new abstractions.
- Verify documentation-only changes by checking the files exist and render as readable Markdown.
- Verify code changes with `bun run lint` and `bun run build` when relevant.
