import type GetSwipeableRowAccessibilityProps from './types';

/**
 * Exposes a row's swipe actions to VoiceOver (Actions rotor) and TalkBack (Actions menu), so people who can't swipe
 * reach them in one step too. Pass only actions that work without a press event.
 */
const getSwipeableRowAccessibilityProps: GetSwipeableRowAccessibilityProps = (actions) => ({
    accessibilityActions: actions.map((action) => ({name: action.key, label: action.accessibilityLabel})),
    onAccessibilityAction: (event) => {
        actions.find((action) => action.key === event.nativeEvent.actionName)?.onPress();
    },
});

export default getSwipeableRowAccessibilityProps;
