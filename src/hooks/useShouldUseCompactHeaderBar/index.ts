import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';

/**
 * Whether HeaderWithBackButton should use its compact height: the intrinsic height of a back button and a title row,
 * instead of padding them out to the full `contentHeaderHeight`. Vertical space is scarce on mobile web in landscape,
 * where the slack around the title is a tenth of the viewport that could be showing content instead.
 * `isInLandscapeMode` is already false on desktop browsers and tablets (see @libs/isInLandscapeMode), so this is
 * effectively "mobile web phone, in landscape".
 *
 * Like useShouldScrollMainHeader, this reads `useIsInLandscapeMode` rather than `useResponsiveLayout`: the flag is
 * consumed by a leaf component, and `useResponsiveLayout` additionally subscribes to the modal and navigation
 * contexts, which a boolean gate has no business depending on.
 */
function useShouldUseCompactHeaderBar(): boolean {
    return useIsInLandscapeMode();
}

export default useShouldUseCompactHeaderBar;
