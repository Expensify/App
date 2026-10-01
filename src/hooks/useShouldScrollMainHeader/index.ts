import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';

/**
 * Whether the navigation tab screens' header (the TopBar plus any secondary rows below it) should scroll away with the
 * content instead of staying pinned. Vertical space is scarce on mobile web in landscape, so the entire header becomes
 * part of the scrollable content there. `isInLandscapeMode` is already false on desktop browsers and tablets
 * (see @libs/isInLandscapeMode), so this is effectively "mobile web phone, in landscape".
 *
 * This reads `useIsInLandscapeMode` rather than `useResponsiveLayout` on purpose: the flag is consumed by leaf
 * components such as LHNOptionsList, and `useResponsiveLayout` additionally subscribes to the modal and navigation
 * contexts, which a boolean gate has no business depending on.
 */
function useShouldScrollMainHeader(): boolean {
    return useIsInLandscapeMode();
}

export default useShouldScrollMainHeader;
