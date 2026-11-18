import useKeyboardState from '@hooks/useKeyboardState';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

/**
 * Whether the popover content should apply bottom safe area padding itself.
 * `<BaseContent>` runs in edge-to-edge mode, so the modal no longer pads the bottom inset.
 * The padding only belongs on the content when the popover is bottom-docked (small screens),
 * and it must be dropped while the keyboard is up, otherwise a gap appears above the keyboard.
 */
function useShouldAddBottomSafeAreaPadding(): boolean {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- must match PopoverWithMeasuredContent's dock decision (bottom-docked only when isSmallScreenWidth)
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isKeyboardActive} = useKeyboardState();

    return isSmallScreenWidth && !isKeyboardActive;
}

export default useShouldAddBottomSafeAreaPadding;
