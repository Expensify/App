import useIsInSidePanel from './useIsInSidePanel';
import useResponsiveLayout from './useResponsiveLayout';

/** On a wide layout, threads and parent chats opened from the side panel open inside it instead of the Inbox. */
function useShouldKeepNavigationInSidePanel(): boolean {
    const isInSidePanel = useIsInSidePanel();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return isInSidePanel && !shouldUseNarrowLayout;
}

export default useShouldKeepNavigationInSidePanel;
