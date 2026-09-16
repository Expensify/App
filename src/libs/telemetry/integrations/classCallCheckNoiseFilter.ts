import type {Event, Integration} from '@sentry/core';

/** Message Babel's `_classCallCheck` throws when a transpiled class is called without `new`, from inside the class, never the caller. */
const CLASS_CALL_CHECK_MESSAGE = 'Cannot call a class as a function';

/** Tag `thirdPartyErrorFilterIntegration` sets on events whose every frame is foreign to our bundle. */
const THIRD_PARTY_CODE_TAG = 'third_party_code';

/**
 * Filenames that mean "this frame has no URL".
 *
 * `app:///` is the spelling this noise arrives with: `createReactNativeRewriteFrames` produces it from any URL
 * with no basename, most notably `webkit-masked-url://hidden/` (WebKit's stand-in for a URL it withholds).
 * `''` is a frame the parser gave no filename. `[native code]`/`native` are native markers the rewrite leaves
 * untouched. The bare `<anonymous>` and `webkit-masked-url://hidden/` entries are guards in case the SDK ever
 * stops rewriting frames - today the rewrite always runs first, so neither can match.
 */
const ANONYMOUS_FILENAMES = new Set(['app:///', '', '[native code]', 'native', 'app:///<anonymous>', '<anonymous>', 'webkit-masked-url://hidden/']);

/**
 * True for the `TypeError: Cannot call a class as a function` noise tracked in
 * https://github.com/Expensify/App/issues/93837 (Sentry APP-CN8, APP-JY0, APP-7WS, APP-8FN, APP-H5V).
 *
 * Three conditions must hold together, and App code cannot satisfy all three:
 *
 * 1. Babel's `_classCallCheck` message. That helper runs inside the class being called, so the throwing frame
 *    belongs to whoever *owns* the class - which is why the frames alone attribute the error.
 * 2. Every frame anonymous. App code only ships in named hashed chunks (`app:///76-f662df2d477d1a4f.bundle.js`)
 *    and `src/` has no `eval(`/`new Function(`, so we cannot produce a frame with no URL. A URL-bearing third
 *    party keeps its basename through the rewrite, so an empty basename means the code genuinely had no URL.
 * 3. `thirdPartyErrorFilterIntegration` found no frame carrying our bundle key. On an all-anonymous stack this
 *    follows from 2, but requiring the tag proves the bundler plugin stamped the build (so the missing key is
 *    real, not an unstamped release) and makes this filter inert where that integration is not installed.
 *
 * The Sentry evidence - tag distribution per release, browser/platform split, and why every `_classCallCheck`
 * we ship fails condition 2 - is written up in GH #93837.
 *
 * Deliberately narrow: anything with a named frame is kept, including third-party bugs we can still act on
 * (APP-J2J is a genuine Convert-experiment bug).
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
 * Drops the GH #93837 noise the way the SDK's own `inboundFiltersIntegration` drops `ignoreErrors` matches: an
 * event processor, so the decision sits next to `thirdPartyErrorFilterIntegration` whose tag it consumes. It
 * must run after `createReactNativeRewriteFrames`, which deletes `abs_path` and strips the scheme from
 * `filename`. Default integrations are set up before ours, so no `webkit-masked-url://` scheme is left by then.
 *
 * Drops leave no trace, same as `ignoreErrors`. To check the predicate has not gone inert, watch total
 * `third_party_code:True` volume per release (Discover query in GH #93837): zero means the tag or the frame
 * rewriting changed and this filter is dropping nothing.
 */
const classCallCheckNoiseFilterIntegration: Integration = {
    name: 'ClassCallCheckNoiseFilter',
    processEvent: (event) => (isClassCallCheckNoise(event) ? null : event),
};

export default classCallCheckNoiseFilterIntegration;
export {isClassCallCheckNoise, CLASS_CALL_CHECK_MESSAGE, THIRD_PARTY_CODE_TAG};
