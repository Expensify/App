import type {ReactNode} from 'react';
import React, {useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import Animated from 'react-native-reanimated';
import ImportedStateIndicator from '@components/ImportedStateIndicator';
import OfflineIndicator from '@components/OfflineIndicator';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useNetwork from '@hooks/useNetwork';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import useOfflineIndicatorKeyboardHandlingStyles from './useOfflineIndicatorKeyboardHandlingStyles';

type ScreenWrapperOfflineIndicatorsProps = {
    /** Styles for the offline indicator */
    offlineIndicatorStyle?: StyleProp<ViewStyle>;

    /** Whether to show offline indicator on small screens */
    shouldShowOfflineIndicator?: boolean;

    /** Whether to show offline indicator on wide screens */
    shouldShowOfflineIndicatorInWideScreen?: boolean;

    /** Whether to use a sticky small screen offline indicator. */
    shouldMobileOfflineIndicatorStickToBottom?: boolean;

    /** Whether the offline indicator should be translucent. */
    isOfflineIndicatorTranslucent?: boolean;

    /** The extra content to display. */
    extraContent?: ReactNode;

    /** Whether to add bottom safe area padding to the small screen offline indicator. */
    addBottomSafeAreaPadding?: boolean;

    /** Whether to add bottom safe area padding to the wide screen small screen offline indicator. */
    addWideScreenBottomSafeAreaPadding?: boolean;
};

function ScreenWrapperOfflineIndicators({
    offlineIndicatorStyle,
    shouldShowOfflineIndicator: shouldShowSmallScreenOfflineIndicator = true,
    shouldShowOfflineIndicatorInWideScreen: shouldShowWideScreenOfflineIndicator = false,
    shouldMobileOfflineIndicatorStickToBottom: shouldSmallScreenOfflineIndicatorStickToBottom = true,
    isOfflineIndicatorTranslucent = false,
    extraContent,
    addBottomSafeAreaPadding = true,
    addWideScreenBottomSafeAreaPadding = !!extraContent,
}: ScreenWrapperOfflineIndicatorsProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isOffline} = useNetwork();

    const {insets} = useSafeAreaPaddings(true);
    const navigationBarType = useMemo(() => StyleUtils.getNavigationBarType(insets), [StyleUtils, insets]);
    const isSoftKeyNavigation = navigationBarType === CONST.NAVIGATION_BAR_TYPE.SOFT_KEYS;

    /**
     * This style applies the background color of the small screen offline indicator.
     * When there is not bottom content, and the device either has soft keys or is offline,
     * the background style is applied.
     * By default, the background color of the small screen offline indicator is translucent.
     * If `isOfflineIndicatorTranslucent` is set to true, an opaque background color is applied.
     */
    const smallScreenBackgroundStyle = useMemo(() => {
        const showOfflineIndicatorBackground = !extraContent && (isSoftKeyNavigation || isOffline);
        if (!showOfflineIndicatorBackground) {
            return undefined;
        }
        return isOfflineIndicatorTranslucent ? styles.translucentNavigationBarBG : styles.appBG;
    }, [extraContent, isOffline, isOfflineIndicatorTranslucent, isSoftKeyNavigation, styles.appBG, styles.translucentNavigationBarBG]);

    /**
     * This style includes the bottom safe area padding for the small screen offline indicator.
     * If the device has soft keys, the small screen offline indicator will stick to the navigation bar (bottom of the screen)
     * The small screen offline indicator container will have a translucent background. Therefore, we want to offset it
     * by the bottom safe area padding rather than adding padding to the container, so that there are not
     * two overlapping layers of translucent background.
     * If the device does not have soft keys, the bottom safe area padding is applied as `paddingBottom`.
     */
    const smallScreenBottomSafeAreaStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding,
        addOfflineIndicatorBottomSafeAreaPadding: false,
        styleProperty: isSoftKeyNavigation ? 'bottom' : 'paddingBottom',
    });

    /**
     * This style includes all styles applied to the container of the small screen offline indicator.
     * It always applies the bottom safe area padding as well as the background style, if the device has soft keys.
     * In this case, we want the whole container (including the bottom safe area padding) to have translucent/opaque background.
     */
    const smallScreenContainerStyle = useMemo(
        () => [smallScreenBottomSafeAreaStyle, shouldSmallScreenOfflineIndicatorStickToBottom && styles.stickToBottom, !isSoftKeyNavigation && smallScreenBackgroundStyle],
        [smallScreenBottomSafeAreaStyle, shouldSmallScreenOfflineIndicatorStickToBottom, styles.stickToBottom, isSoftKeyNavigation, smallScreenBackgroundStyle],
    );

    /**
     * This style includes the styles applied to the small screen offline indicator component.
     * If the device has soft keys, we only want to apply the background style to the small screen offline indicator component,
     * rather than the whole container, because otherwise the navigation bar would be extra opaque, since it already has a translucent background.
     */
    const smallScreenStyle = useMemo(
        () => [styles.pl5, isSoftKeyNavigation && smallScreenBackgroundStyle, offlineIndicatorStyle],
        [isSoftKeyNavigation, smallScreenBackgroundStyle, offlineIndicatorStyle, styles.pl5],
    );

    /**
     * This style includes the styles applied to the small screen offline indicator component when the keyboard is interacted with.
     */
    const keyboardHandlingStyles = useOfflineIndicatorKeyboardHandlingStyles();

    return (
        <>
            {shouldShowSmallScreenOfflineIndicator && (
                <>
                    {isOffline && (
                        <Animated.View style={[smallScreenContainerStyle, keyboardHandlingStyles]}>
                            <OfflineIndicator style={smallScreenStyle} />
                            {/* Since import state is tightly coupled to the offline state, it is safe to display it when showing offline indicator */}
                        </Animated.View>
                    )}
                    <ImportedStateIndicator />
                </>
            )}
            {shouldShowWideScreenOfflineIndicator && (
                <>
                    <OfflineIndicator
                        style={[styles.pl5, offlineIndicatorStyle]}
                        addBottomSafeAreaPadding={addWideScreenBottomSafeAreaPadding}
                    />
                    {/* Since import state is tightly coupled to the offline state, it is safe to display it when showing offline indicator */}
                    <ImportedStateIndicator />
                </>
            )}
        </>
    );
}

export default ScreenWrapperOfflineIndicators;
export type {ScreenWrapperOfflineIndicatorsProps};
