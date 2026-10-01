import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';

/**
 * Whether the app is running on a mobile browser in landscape — the one layout where vertical space is scarce enough
 * that the chrome has to give some of it up. Every treatment below is gated on this single flag and they all switch
 * together with the orientation:
 *
 * - the navigation tab bar becomes a pill floating in the bottom-left corner instead of a full-width bar;
 * - the navigation tab screens' header (TopBar plus any rows below it) scrolls away with the content instead of
 *   staying pinned;
 * - the report screen's chrome (header and compose row) uses its compact variant, and the header scrolls away;
 * - HeaderWithBackButton shrinks to the intrinsic height of its back button and title.
 *
 * `isInLandscapeMode` is already false on desktop browsers and tablets (see @libs/isInLandscapeMode), so this is
 * effectively "mobile web phone, in landscape". Native has its own implementation that is always false: it isn't
 * competing with the browser's URL bar for vertical space and keeps its full-size chrome in landscape.
 *
 * This reads `useIsInLandscapeMode` rather than `useResponsiveLayout` on purpose: the flag is consumed by leaf
 * components, and `useResponsiveLayout` additionally subscribes to the modal and navigation contexts, which a
 * boolean gate has no business depending on.
 */
function useIsMobileWebLandscape(): boolean {
    return useIsInLandscapeMode();
}

export default useIsMobileWebLandscape;
