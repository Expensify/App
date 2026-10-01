import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';

import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {useDerivedReportNameByReportID} from '@hooks/useReportAttributes';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import getButtonState from '@libs/getButtonState';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getReportRouteForCurrentContext from '@libs/Navigation/helpers/getReportRouteForCurrentContext';
import Navigation from '@libs/Navigation/Navigation';
import {isResolvedSupportTicket} from '@libs/ReportUtils';

import {dismissFailedSupportTicket} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

type SupportTicketPreviewProps = {
    action: OnyxEntry<ReportAction>;
    isHovered: boolean;
    style: StyleProp<ViewStyle>;
};

function SupportTicketPreview({action, isHovered, style}: SupportTicketPreviewProps) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const [supportTicket] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(action?.childReportID)}`);
    const supportTicketReportID = supportTicket?.reportID ?? action?.childReportID;
    const derivedSupportTicketName = useDerivedReportNameByReportID(supportTicketReportID);
    const isResolved = isResolvedSupportTicket(supportTicket, action);
    const errors = typeof action?.errors === 'object' ? action.errors : undefined;
    const createReportErrors = typeof errors?.createReport === 'object' ? errors.createReport : undefined;
    const supportTicketName = derivedSupportTicketName ?? supportTicket?.reportName ?? action?.childReportName ?? translate('supportTicket.fallbackTitle');

    const dismissSupportTicket = () => {
        if (!supportTicketReportID || !action?.parentReportID || !action?.reportActionID) {
            return;
        }
        dismissFailedSupportTicket(supportTicketReportID, action.parentReportID, action.reportActionID);
    };

    const showCheckboxInfo = () => {
        showConfirmModal({
            title: translate('workspace.common.readOnlyActionTitle'),
            prompt: translate('supportTicket.checkboxTooltip'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

    return (
        <OfflineWithFeedback
            shouldShowErrorMessages
            errors={createReportErrors}
            onClose={dismissSupportTicket}
        >
            <View style={styles.chatItemMessage}>
                <PressableWithoutFeedback
                    onPress={() => Navigation.navigate(getReportRouteForCurrentContext({reportID: supportTicketReportID}))}
                    style={[styles.flexRow, styles.alignItemsCenter, style]}
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={supportTicketName}
                    sentryLabel={CONST.SENTRY_LABEL.SUPPORT_TICKET.PREVIEW_CARD}
                >
                    <Tooltip text={translate('supportTicket.checkboxTooltip')}>
                        <View>
                            <Checkbox
                                isChecked={isResolved}
                                onPress={(event) => {
                                    event?.stopPropagation();
                                    showCheckboxInfo();
                                }}
                                shouldStopMouseDownPropagation
                                shouldSelectOnPressEnter
                                accessibilityLabel={translate('supportTicket.checkboxTooltip')}
                                sentryLabel={CONST.SENTRY_LABEL.SUPPORT_TICKET.PREVIEW_CHECKBOX}
                            />
                        </View>
                    </Tooltip>
                    <Text style={[styles.ml3, styles.flex1]}>{supportTicketName}</Text>
                    <Icon
                        src={icons.ArrowRight}
                        fill={StyleUtils.getIconFillColor({buttonState: getButtonState({isActive: isHovered})})}
                    />
                </PressableWithoutFeedback>
            </View>
        </OfflineWithFeedback>
    );
}

export default SupportTicketPreview;
