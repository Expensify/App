import type {ReactNode} from 'react';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import ImportedStateIndicator from '@components/ImportedStateIndicator';
import OfflineIndicator from '@components/OfflineIndicator';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useNetwork from '@hooks/useNetwork';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type ScreenWrapperOfflineIndicatorsProps = {
    /** Styles for the offline indicator */
    offlineIndicatorStyle?: StyleProp<ViewStyle>;

    /** Whether to show offline indicator */
    shouldShowOfflineIndicator?: boolean;

    /** Whether to show offline indicator on wide screens */
    shouldShowOfflineIndicatorInWideScreen?: boolean;

    /** Whether to use a sticky mobile offline indicator. */
    shouldMobileOfflineIndicatorStickToBottom?: boolean;

    /** Whether the offline indicator should be translucent. */
    isOfflineIndicatorTranslucent?: boolean;

    /** The extra content to display. */
    extraContent?: ReactNode;

    /** Whether to add bottom safe area padding to the mobile offline indicator. */
    addBottomSafeAreaPadding?: boolean;

    /** Whether to add bottom safe area padding to the wide screen mobile offline indicator. */
    addWideScreenBottomSafeAreaPadding?: boolean;
};

function ScreenWrapperOfflineIndicators({
    offlineIndicatorStyle,
    shouldShowOfflineIndicator = true,
    shouldShowOfflineIndicatorInWideScreen = false,
    shouldMobileOfflineIndicatorStickToBottom = true,
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
     * This style applies the background color of the mobile offline indicator.
     * When there is not bottom content, and the device either has soft keys or is offline,
     * the background style is applied.
     * By default, the background color of the mobile offline indicator is translucent.
     * If `isOfflineIndicatorTranslucent` is set to true, an opaque background color is applied.
     */
    const mobileOfflineIndicatorBackgroundStyle = useMemo(() => {
        const showOfflineIndicatorBackground = !extraContent && (isSoftKeyNavigation || isOffline);
        if (!showOfflineIndicatorBackground) {
            return undefined;
        }
        return isOfflineIndicatorTranslucent ? styles.navigationBarBG : styles.appBG;
    }, [extraContent, isOffline, isOfflineIndicatorTranslucent, isSoftKeyNavigation, styles.appBG, styles.navigationBarBG]);

    /**
     * This style includes the bottom safe area padding for the mobile offline indicator.
     * If the device has soft keys, the mobile offline indicator will stick to the navigation bar (bottom of the screen)
     * The mobile offline indicator container will have a translucent background. Therefore, we want to offset it
     * by the bottom safe area padding rather than adding padding to the container, so that there are not
     * two overlapping layers of translucent background.
     * If the device does not have soft keys, the bottom safe area padding is applied as `paddingBottom`.
     */
    const mobileOfflineIndicatorBottomSafeAreaStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding,
        styleProperty: isSoftKeyNavigation ? 'bottom' : 'paddingBottom',
    });

    /**
     * This style includes all styles applied to the container of the mobile offline indicator.
     * It always applies the bottom safe area padding as well as the background style, if the device has soft keys.
     * In this case, we want the whole container (including the bottom safe area padding) to have translucent/opaque background.
     */
    const mobileOfflineIndicatorContainerStyle = useMemo(
        () => [mobileOfflineIndicatorBottomSafeAreaStyle, shouldMobileOfflineIndicatorStickToBottom && styles.stickToBottom, !isSoftKeyNavigation && mobileOfflineIndicatorBackgroundStyle],
        [mobileOfflineIndicatorBottomSafeAreaStyle, shouldMobileOfflineIndicatorStickToBottom, styles.stickToBottom, isSoftKeyNavigation, mobileOfflineIndicatorBackgroundStyle],
    );

    /**
     * This style includes the styles applied to the mobile offline indicator component.
     * If the device has soft keys, we only want to apply the background style to the mobile offline indicator component,
     * rather than the whole container, because otherwise the navigation bar would be extra opaque, since it already has a translucent background.
     */
    const mobileOfflineIndicatorStyle = useMemo(
        () => [styles.pl5, isSoftKeyNavigation && mobileOfflineIndicatorBackgroundStyle, offlineIndicatorStyle],
        [isSoftKeyNavigation, mobileOfflineIndicatorBackgroundStyle, offlineIndicatorStyle, styles.pl5],
    );

    return (
        <>
            {shouldShowOfflineIndicator && (
                <>
                    {isOffline && (
                        <View style={[mobileOfflineIndicatorContainerStyle]}>
                            <OfflineIndicator style={mobileOfflineIndicatorStyle} />
                            {/* Since import state is tightly coupled to the offline state, it is safe to display it when showing offline indicator */}
                        </View>
                    )}
                    <ImportedStateIndicator />
                </>
            )}
            {shouldShowOfflineIndicatorInWideScreen && (
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
ScreenWrapperOfflineIndicators.displayName = 'ScreenWrapperOfflineIndicators';

export default ScreenWrapperOfflineIndicators;
export type {ScreenWrapperOfflineIndicatorsProps};
