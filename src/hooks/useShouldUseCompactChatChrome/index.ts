import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';

/**
 * Whether the report screen's chrome (the header above the report actions and the compose row below them) should use
 * its compact variant: a shorter header and a compose footer without the fixed-height secondary row. Vertical space is
 * scarce on mobile web in landscape, where the two together leave only a handful of messages visible.
 * `isInLandscapeMode` is already false on desktop browsers and tablets (see @libs/isInLandscapeMode), so this is
 * effectively "mobile web phone, in landscape".
 *
 * Like useShouldScrollMainHeader, this reads `useIsInLandscapeMode` rather than `useResponsiveLayout`: the flag is
 * consumed by leaf components, and `useResponsiveLayout` additionally subscribes to the modal and navigation contexts,
 * which a boolean gate has no business depending on.
 */
function useShouldUseCompactChatChrome(): boolean {
    return useIsInLandscapeMode();
}

export default useShouldUseCompactChatChrome;
