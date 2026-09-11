import useAccessibilityAnnouncement from '@hooks/useAccessibilityAnnouncement';
import useDialogContainerFocus from '@hooks/useDialogContainerFocus';
import useDialogLabelRegistration from '@hooks/useDialogLabelRegistration';
import useLocalize from '@hooks/useLocalize';

/**
 * Announces `dialogTitle` to screen readers as the RHP's dialog name, and moves focus into the dialog
 * after its transition finishes (`shouldSkipFocusAfterTransition`) — the focus-steal applies to every
 * dialog-shaped `HeaderTitle` usage, regardless of title.
 *
 * The title registration/announcement half is opt-in: only the ONE `HeaderTitle` that represents the
 * actual RHP screen title should pass a real `dialogTitle`. Any other `HeaderTitle` inside the same
 * dialog must pass '' (default) — otherwise a second dialog name/announcement fires for the same screen.
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
