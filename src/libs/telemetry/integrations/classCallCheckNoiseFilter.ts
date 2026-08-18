import type {Event, Integration} from '@sentry/core';

/**
 * Message Babel's `_classCallCheck` helper throws when a transpiled class is invoked without `new`.
 * It is emitted by the class being called, never by the caller.
 */
const CLASS_CALL_CHECK_MESSAGE = 'Cannot call a class as a function';

/** Tag `thirdPartyErrorFilterIntegration` sets on events whose every frame is foreign to our bundle. */
const THIRD_PARTY_CODE_TAG = 'third_party_code';

/**
 * Filenames that mean "this frame has no URL".
 *
 * `app:///` is the spelling this noise actually arrives with: `createReactNativeRewriteFrames` produces
 * it from any URL with no basename - most notably `webkit-masked-url://hidden/`, which is what WebKit
 * reports for a script whose URL it withholds. `''` covers a frame the stack parser gave no filename at
 * all. `[native code]` and `native` are the native-frame markers, which the rewrite iteratee returns
 * unchanged, so those are the spellings that reach us.
 *
 * `app:///<anonymous>` is the rewritten form of the `<anonymous>` marker. The bare `<anonymous>` and
 * `webkit-masked-url://hidden/` entries are guards in case the SDK ever stops rewriting frames; today the
 * rewrite always runs first (see the note on the integration below), so neither can match.
 */
const ANONYMOUS_FILENAMES = new Set(['app:///', '', '[native code]', 'native', 'app:///<anonymous>', '<anonymous>', 'webkit-masked-url://hidden/']);

/**
 * True for the `TypeError: Cannot call a class as a function` noise tracked in
 * https://github.com/Expensify/App/issues/93837 (Sentry APP-CN8, APP-JY0, APP-7WS, APP-8FN, APP-H5V).
 *
 * Why this is safe - three conditions must hold together, and App code cannot satisfy all three:
 *
 * 1. The message is Babel's `_classCallCheck`. That helper runs inside the class being called, so the
 *    throwing frame always belongs to whoever *owns* the class, not to whoever called it, which is why
 *    the frames alone are enough to attribute the error.
 * 2. Every frame is anonymous. App code only ever ships in named, hashed chunks
 *    (`app:///76-f662df2d477d1a4f.bundle.js`), and there is no `eval(` or `new Function(` anywhere in
 *    `src/`, so we cannot produce a frame with no URL. The only non-chunk scripts we serve are the
 *    third-party snippets inlined in `web/index.html` (Ketch, Convert, GTM), which we equally cannot act
 *    on. A URL-bearing third party keeps its basename through the rewrite (the password-manager extension
 *    in APP-J1W arrives as `app:///<extension-name>-script.js`), so an empty basename means the code
 *    genuinely had no URL - injected inline, or served from a URL WebKit withholds.
 * 3. `thirdPartyErrorFilterIntegration` found no frame carrying our bundle key. On an all-anonymous stack
 *    this follows from condition 2 rather than testing anything new, but it is still worth requiring: the
 *    tag can only be set when the bundler plugin stamped that build, so its presence proves the absence of
 *    our key is real and not an artifact of an unstamped release. It also makes this filter inert wherever
 *    `thirdPartyErrorFilterIntegration` is not installed.
 *
 * The Sentry evidence behind conditions 1-3 - the tag distribution per release, the browser and platform
 * split against our own error volume, and why any `_classCallCheck` we ship fails condition 2 (all of them
 * come from dependencies that land in named chunks) - is written up in GH #93837.
 *
 * Deliberately narrow: anything with a named frame is kept, including real third-party bugs we can still
 * act on (APP-J2J is a genuine Convert-experiment bug). If this signature ever reappears with an
 * attributable frame, it reaches Sentry normally.
 */
function isClassCallCheckNoise(event: Event): boolean {
    if (event.tags?.[THIRD_PARTY_CODE_TAG] !== true) {
        return false;
    }

    const values = event.exception?.values ?? [];
    const isSignature = values.length > 0 && values.every((value) => value.value === CLASS_CALL_CHECK_MESSAGE);
    if (!isSignature) {
        return false;
    }

    const frames = values.flatMap((value) => value.stacktrace?.frames ?? []);
    return frames.length > 0 && frames.every((frame) => ANONYMOUS_FILENAMES.has(frame.filename ?? ''));
}

/**
 * Drops the GH #93837 noise, mirroring how the SDK's own `inboundFiltersIntegration` drops `ignoreErrors`
 * and `denyUrls` matches: an event processor, so the decision lives next to `thirdPartyErrorFilterIntegration`
 * whose tag it consumes.
 *
 * The check has to see the rewritten filename rather than the original URL scheme. `createReactNativeRewriteFrames`
 * deletes `abs_path` and strips the scheme from `filename`, and default integrations are set up before ours,
 * so by the time this runs no `webkit-masked-url://`-style scheme is left.
 *
 * Drops leave no trace, deliberately - same as `ignoreErrors`. To re-verify the predicate still matches
 * rather than having gone inert, watch the mechanism it depends on rather than any single issue: total
 * `third_party_code:True` volume per release (Discover query in GH #93837) must stay non-zero. If that
 * goes to zero, the tag or the frame rewriting changed and this filter is dropping nothing.
 */
const classCallCheckNoiseFilterIntegration: Integration = {
    name: 'ClassCallCheckNoiseFilter',
    processEvent: (event) => (isClassCallCheckNoise(event) ? null : event),
};

export default classCallCheckNoiseFilterIntegration;
export {isClassCallCheckNoise, CLASS_CALL_CHECK_MESSAGE, THIRD_PARTY_CODE_TAG};
