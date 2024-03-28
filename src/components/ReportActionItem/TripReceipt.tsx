import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Button from '@components/Button';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithoutFeedback} from '@components/Pressable';
import {showContextMenuForReport} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {ContextMenuAnchor} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import ROUTES from '@src/ROUTES';
import type {ReportAction} from '@src/types/onyx';
import MoneyRequestAction from './MoneyRequestAction';

type TripReceiptProps = {
    /** All the data of the action */
    action: ReportAction;

    /** The associated chatReport */
    chatReportID: string;

    /** The active IOUReport, used for Onyx subscription */
    iouReportID: string;

    /** Extra styles to pass to View wrapper */
    containerStyles?: StyleProp<ViewStyle>;

    /** Popover context menu anchor, used for showing context menu */
    contextMenuAnchor?: ContextMenuAnchor;

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive?: () => void;

    /** Whether a message is a whisper */
    isWhisper?: boolean;

    /** Whether the corresponding report action item is hovered */
    isHovered?: boolean;
};

function TripReceipt({action, chatReportID, iouReportID, containerStyles, contextMenuAnchor, isHovered = false, isWhisper = false, checkIfContextMenuActive = () => {}}: TripReceiptProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const getDisplayAmount = (): string => {
        // If iouReport is not available, get amount from the action message (Ex: "Domain20821's Workspace owes $33.00" or "paid ₫60" or "paid -₫60 elsewhere")
        let displayAmount = '';
        const actionMessage = action.message?.[0]?.text ?? '';
        const splits = actionMessage.split(' ');

        splits.forEach((split) => {
            if (!/\d/.test(split)) {
                return;
            }

            displayAmount = split;
        });

        return displayAmount;
    };

    return (
        <OfflineWithFeedback
            shouldDisableOpacity={!!(action.pendingAction ?? action.isOptimisticAction)}
            needsOffscreenAlphaCompositing
        >
            <View style={[styles.chatItemMessage, containerStyles]}>
                <PressableWithoutFeedback
                    onPressIn={() => DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                    onPressOut={() => ControlSelection.unblock()}
                    onLongPress={(event) => showContextMenuForReport(event, contextMenuAnchor, chatReportID, action, checkIfContextMenuActive)}
                    shouldUseHapticsOnLongPress
                    style={[styles.flexRow, styles.justifyContentBetween, styles.reportPreviewBox, styles.cursorDefault]}
                    role="button"
                    accessibilityLabel={translate('iou.viewDetails')}
                >
                    <MoneyRequestAction
                        chatReportID={chatReportID}
                        requestReportID={iouReportID}
                        action={action}
                        isHovered={isHovered}
                        style={styles.mt2}
                        isWhisper={isWhisper}
                        reportID={chatReportID}
                        isMostRecentIOUReportAction={false}
                    />
                    <View style={[styles.moneyRequestPreviewBox, styles.p4, styles.gap5, isHovered || isWhisper ? styles.reportPreviewBoxHoverBorder : undefined]}>
                        <View style={styles.expenseAndReportPreviewTextContainer}>
                            <View style={styles.reportPreviewAmountSubtitleContainer}>
                                <View style={styles.flexRow}>
                                    <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                                        <Text style={styles.textHeadlineH2}>{getDisplayAmount()}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <Button
                            medium
                            success
                            text={translate('travel.viewTrip')}
                            onPress={() => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(iouReportID))}
                        />
                    </View>
                </PressableWithoutFeedback>
            </View>
        </OfflineWithFeedback>
    );
}

TripReceipt.displayName = 'TripReceipt';

export default TripReceipt;
