/** Stack-pop or re-attach can take up to this many `requestAnimationFrame` ticks before we give up and `Log.warn`. */
const MAX_RESTORE_FRAMES = 5;

/** Late-mounted screen headers (skeleton → real header, Suspense, conditional render) may attach after the transition; retry budget for `useScreenInitialFocus`. */
const MAX_INITIAL_FOCUS_FRAMES = 5;

/** Trigger map FIFO cap (web + native). Forward-only PUSH_PARAMS sessions can otherwise pin detached DOM nodes indefinitely. */
const TRIGGER_MAP_MAX = 64;

/** A click long before a timer-triggered nav must not be captured as that nav's trigger (web mouse modality). */
const MOUSE_TRIGGER_TTL_MS = 3_000;

/** Same window on native — the press that started a forward nav is consumed within this many ms. */
const PRESS_TRIGGER_TTL_MS = 3_000;

/** Grace window after a successful RETURN restore: vetoes in-flight AUTO/INITIAL so the restored target isn't trampled by the next screen's autofocus. */
const RETURN_HOLD_MS = 500;

/** Popover/modal launcher entry lives in the LauncherStack this long after `markActivePopoverLauncherDeactivated`; covers click→state-listener→capture latency. */
const LAUNCHER_CLEAR_DELAY_MS = 1_000;

/** Soft cap on the LauncherStack; warned once-per-session if exceeded (signals a pathological trap loop). */
const LAUNCHER_STACK_MAX = 8;

export {MAX_RESTORE_FRAMES, MAX_INITIAL_FOCUS_FRAMES, TRIGGER_MAP_MAX, MOUSE_TRIGGER_TTL_MS, PRESS_TRIGGER_TTL_MS, RETURN_HOLD_MS, LAUNCHER_CLEAR_DELAY_MS, LAUNCHER_STACK_MAX};
