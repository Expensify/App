# `howler` patches

### [howler+2.2.4+001+catch-audio-context-resume-rejection.patch](howler+2.2.4+001+catch-audio-context-resume-rejection.patch)

- Reason:

    ```
    Howler calls `AudioContext.resume()` in the audio unlock handler and in `_autoResume()` without handling a rejected promise.
    iOS Safari rejects it with `InvalidStateError: Failed to start the audio device` when it can't start the audio session
    (for example, during a phone call or while another app holds the audio session), which surfaces as an unhandled promise rejection.
    This patch adds no-op rejection handlers. Howler only sets its state to 'running' after a successful resume, so the next play() still retries.
    ```

- Upstream PR/issue: https://github.com/goldfire/howler.js/issues/1743, https://github.com/goldfire/howler.js/pull/1764
- E/App issue: https://github.com/Expensify/App/issues/102744
- PR introducing patch: https://github.com/Expensify/App/pull/102795
