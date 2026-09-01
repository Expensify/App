import useAccessibilityAnnouncement from '@hooks/useAccessibilityAnnouncement';
import useDialogContainerFocus from '@hooks/useDialogContainerFocus';
import useDialogLabelRegistration from '@hooks/useDialogLabelRegistration';
import useLocalize from '@hooks/useLocalize';

/**
 * Registers `dialogTitle` as the RHP's dialog name and announces it to screen readers.
 * Pass an empty string to opt out (only `HeaderWithBackButton`'s screen-level `Header` should register a
 * dialog title — every other `Header` usage must pass `''`, or a second dialog label/announcement would fire
 * for the same screen).
 */
function useHeaderDialogAnnouncement(dialogTitle: string, shouldSkipFocusAfterTransition: boolean) {
    const {translate} = useLocalize();

    const dialogAnnouncement = dialogTitle ? `${dialogTitle}, ${translate('common.dialogOpened')}` : '';
    const {isTransitionReady, claimInitialFocus, containerRef} = useDialogLabelRegistration(dialogTitle);
    useDialogContainerFocus(containerRef, isTransitionReady, claimInitialFocus, shouldSkipFocusAfterTransition);

    // Polite so JAWS can finish the tab-title "(1) …" (left paren…) before "{title}, dialog" — assertive was cutting it off at "lef".
    // Keep announcing even when shouldSkipFocusAfterTransition is set — that flag only skips focus moves (e.g. New Task / IOU confirmation).
    // Web-only: iOS VoiceOver must not speak this (index.ios honors shouldAnnounceOnNative; default would announce).
    useAccessibilityAnnouncement(dialogAnnouncement, isTransitionReady && !!dialogTitle, {
        shouldAnnounceOnWeb: true,
        shouldAnnounceOnNative: false,
        politeness: 'polite',
    });
}

export default useHeaderDialogAnnouncement;
