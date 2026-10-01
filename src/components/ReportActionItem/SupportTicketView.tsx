import Checkbox from '@components/Checkbox';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {isResolvedSupportTicket} from '@libs/ReportUtils';

import {dismissFailedSupportTicket} from '@userActions/Report';

import CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';

type SupportTicketViewProps = {
    report: OnyxEntry<Report>;
    action: OnyxEntry<ReportAction>;
};

function SupportTicketView({report, action}: SupportTicketViewProps) {
    const {translate} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const styles = useThemeStyles();
    const personalDetails = usePersonalDetails();
    const isResolved = isResolvedSupportTicket(report, action);
    const supportRepFirstName = personalDetails?.[report?.managerID ?? CONST.DEFAULT_NUMBER_ID]?.firstName ?? '';

    const dismissSupportTicket = () => {
        if (!report?.reportID || !report.parentReportID || !report.parentReportActionID) {
            return;
        }
        dismissFailedSupportTicket(report.reportID, report.parentReportID, report.parentReportActionID);
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
            errors={report?.errorFields?.createReport}
            onClose={dismissSupportTicket}
        >
            <View style={[styles.ph5, styles.pv3]}>
                <View style={[styles.flexRow, styles.alignItemsCenter]}>
                    <Tooltip text={translate('supportTicket.checkboxTooltip')}>
                        <View>
                            <Checkbox
                                isChecked={isResolved}
                                onPress={showCheckboxInfo}
                                shouldSelectOnPressEnter
                                accessibilityLabel={translate('supportTicket.checkboxTooltip')}
                                sentryLabel={CONST.SENTRY_LABEL.SUPPORT_TICKET.VIEW_CHECKBOX}
                            />
                        </View>
                    </Tooltip>
                    <Text style={[styles.ml3, styles.flex1]}>{translate('supportTicket.description', {supportRep: supportRepFirstName})}</Text>
                </View>
            </View>
        </OfflineWithFeedback>
    );
}

export default SupportTicketView;
