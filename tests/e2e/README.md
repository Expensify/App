# Browser composer tests

Start the web development server with `npm run web`, then run:

```sh
npx playwright test
```

Set `PLAYWRIGHT_BASE_URL` to test a server on another port. These tests use installed Google Chrome and an isolated browser context with fake local Onyx data. They block requests outside the development server and never send a message or use a real account.

The replacement tests use Chrome's editing engine to replace a DOM range before the selection change event is delivered. They cover the stale-selection failure behind emoji replacement, not the macOS on-screen keyboard itself. Verify the original keyboard steps separately on macOS.
