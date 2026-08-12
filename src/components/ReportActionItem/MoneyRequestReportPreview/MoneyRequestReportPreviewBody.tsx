import {getButtonRole} from '@components/Button/utils';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {showContextMenuForReport, useShowContextMenuActions, useShowContextMenuState} from '@components/ShowContextMenuContext';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import ControlSelection from '@libs/ControlSelection';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import {useReportPreviewData, useReportPreviewUIState} from './MoneyRequestReportPreviewContext';
import ReportPreviewActionButton from './ReportPreviewActionButton';
import ReportPreviewHeader from './ReportPreviewHeader';
import ReportPreviewHoldMenu from './ReportPreviewHoldMenu';
import ReportPreviewTotal from './ReportPreviewTotal';
import TransactionReportCarousel from './TransactionReportCarousel';

type MoneyRequestReportPreviewBodyProps = ForwardedFSClassProps & {
    /** Callback passed to the wrapper view's onLayout */
    onWrapperLayout: (e: LayoutChangeEvent) => void;

    /** Callback passed to the carousel-width-setter view's onLayout */
    onCarouselLayout: (e: LayoutChangeEvent) => void;

    /** Extra styles to pass to the carousel-width-setter view */
    containerStyles?: StyleProp<ViewStyle>;

    /** Called when the whole preview is pressed */
    onPress: () => void;

    /** Whether the corresponding report action item is hovered */
    isHovered?: boolean;

    /** Whether a message is a whisper */
    isWhisper?: boolean;

    /** Whether to show a border separating the chat item and the preview */
    shouldShowBorder?: boolean;
};

/**
 * The layout body of the money request report preview: the pressable card that composes the header, carousel, action
 * button + total, and the hold menu. It owns no data — everything comes from the context slices via `useX()` hooks,
 * except the pure layout wiring passed as props.
 */
function MoneyRequestReportPreviewBody({
    onWrapperLayout,
    onCarouselLayout,
    containerStyles,
    onPress,
    isHovered = false,
    isWhisper = false,
    shouldShowBorder = false,
    forwardedFSClass,
}: MoneyRequestReportPreviewBodyProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {anchor: contextMenuAnchorRef, shouldDisplayContextMenu = true, originalReportID} = useShowContextMenuState();
    const {checkIfContextMenuActive} = useShowContextMenuActions();

    const {action, iouReport, chatReportID} = useReportPreviewData();
    const {isTransitionPending, isScanning, reportPreviewStyles} = useReportPreviewUIState();

    const isReportDeleted = action?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const totalAmountStyle = shouldUseNarrowLayout ? [styles.flexColumnReverse, styles.alignItemsStretch] : [styles.flexRow, styles.alignItemsCenter];

    return (
        <View
            onLayout={onWrapperLayout}
            testID="MoneyRequestReportPreviewContent-wrapper"
            fsClass={forwardedFSClass}
        >
            <OfflineWithFeedback
                pendingAction={iouReport?.pendingFields?.preview}
                shouldDisableOpacity={!!(action.pendingAction ?? action.isOptimisticAction)}
                needsOffscreenAlphaCompositing
                style={styles.mt1}
            >
                <View
                    style={[styles.chatItemMessage, isReportDeleted && [styles.cursorDisabled, styles.pointerEventsAuto], containerStyles, isTransitionPending && styles.w100]}
                    onLayout={onCarouselLayout}
                    testID="carouselWidthSetter"
                >
                    <PressableWithoutFeedback
                        onPress={onPress}
                        onPressIn={() => canUseTouchScreen() && ControlSelection.block()}
                        onPressOut={() => ControlSelection.unblock()}
                        onLongPress={(event) => {
                            if (!shouldDisplayContextMenu) {
                                return;
                            }
                            showContextMenuForReport(event, contextMenuAnchorRef, chatReportID, action, checkIfContextMenuActive, originalReportID);
                        }}
                        shouldUseHapticsOnLongPress
                        style={[
                            styles.flexRow,
                            styles.justifyContentBetween,
                            StyleUtils.getBackgroundColorStyle(theme.cardBG),
                            shouldShowBorder ? styles.borderedContentCardLarge : styles.reportContainerBorderRadius,
                            isReportDeleted && styles.pointerEventsNone,
                        ]}
                        role={getButtonRole(true)}
                        isNested
                        accessibilityLabel={translate('iou.viewDetails')}
                        sentryLabel={CONST.SENTRY_LABEL.REPORT_PREVIEW.CARD}
                    >
                        <View
                            style={[
                                StyleUtils.getBackgroundColorStyle(theme.cardBG),
                                styles.reportContainerBorderRadius,
                                styles.w100,
                                (isHovered || isScanning || isWhisper) && styles.reportPreviewBoxHoverBorder,
                            ]}
                        >
                            <View style={[reportPreviewStyles.wrapperStyle]}>
                                <View style={[reportPreviewStyles.contentContainerStyle, styles.gap4]}>
                                    <ReportPreviewHeader />
                                    <TransactionReportCarousel />
                                    <View style={[styles.expenseAndReportPreviewTextContainer]}>
                                        <View style={[totalAmountStyle, styles.justifyContentBetween, styles.gap4, StyleUtils.getMinimumHeight(variables.h28)]}>
                                            <ReportPreviewActionButton />
                                            <ReportPreviewTotal />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </PressableWithoutFeedback>
                </View>
                <ReportPreviewHoldMenu />
            </OfflineWithFeedback>
        </View>
    );
}

export default MoneyRequestReportPreviewBody;
