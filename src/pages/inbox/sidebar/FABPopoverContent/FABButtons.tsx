import React from 'react';
import type {RefObject} from 'react';
import {View} from 'react-native';
import FloatingActionButton from '@components/FloatingActionButton';
import FloatingReceiptButton from '@components/FloatingReceiptButton';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import useScanActions from './useScanActions';

type FABButtonsProps = {
    isActive: boolean;
    fabRef: RefObject<HTMLDivElement | View | null>;
    onPress: () => void;
};

function FABButtons({isActive, fabRef, onPress}: FABButtonsProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {startScan, startQuickScan} = useScanActions();
    const theme = useTheme();
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Plus']);

    if (!shouldUseNarrowLayout) {
        return (
            <PressableWithFeedback
                ref={fabRef as RefObject<View | null>}
                accessibilityLabel={translate('common.create')}
                role={CONST.ROLE.BUTTON}
                onPress={onPress}
                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.FLOATING_ACTION_BUTTON}
                style={({hovered, pressed}) => [
                    styles.alignItemsCenter,
                    styles.justifyContentCenter,
                    {
                        width: 32,
                        height: 32,
                        borderRadius: variables.buttonBorderRadius,
                        backgroundColor: pressed ? theme.successPressed : hovered || isActive ? theme.successHover : theme.success,
                    },
                ]}
            >
                <Icon
                    src={expensifyIcons.Plus}
                    fill={theme.buttonSuccessText}
                    width={variables.iconSizeSmall}
                    height={variables.iconSizeSmall}
                />
            </PressableWithFeedback>
        );
    }

    return (
        <>
            <FloatingReceiptButton
                accessibilityLabel={translate('sidebarScreen.fabScanReceiptExplained')}
                role={CONST.ROLE.BUTTON}
                onPress={startQuickScan}
                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.FLOATING_RECEIPT_BUTTON}
            />
            <FloatingActionButton
                accessibilityLabel={translate('accessibilityHints.openActionsMenu')}
                role={CONST.ROLE.BUTTON}
                isActive={isActive}
                ref={fabRef as RefObject<HTMLDivElement | null>}
                onPress={onPress}
                onLongPress={startScan}
                sentryLabel={CONST.SENTRY_LABEL.NAVIGATION_TAB_BAR.FLOATING_ACTION_BUTTON}
            />
        </>
    );
}

export default FABButtons;
