import Checkbox from '@components/Checkbox';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import UserPill from '@components/UserPill';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import {useDerivedReportNameByReportID} from '@hooks/useReportAttributes';
import useThemeStyles from '@hooks/useThemeStyles';

import {getDisplayNameForParticipant, isResolvedSupportTicket} from '@libs/ReportUtils';

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
    const {translate, formatPhoneNumber} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const styles = useThemeStyles();
    const personalDetails = usePersonalDetails();
    const isResolved = isResolvedSupportTicket(report, action);
    const supportRepPersonalDetails = personalDetails?.[report?.managerID ?? CONST.DEFAULT_NUMBER_ID];
    const supportRepName = supportRepPersonalDetails?.displayName ? (supportRepPersonalDetails.firstName ?? supportRepPersonalDetails.displayName) : (supportRepPersonalDetails?.login ?? '');
    const assigneeDisplayName = report?.managerID
        ? getDisplayNameForParticipant({
              accountID: report.managerID,
              personalDetailsData: personalDetails,
              formatPhoneNumber,
              hiddenTranslation: translate('common.hidden'),
          })
        : '';
    const derivedSupportTicketName = useDerivedReportNameByReportID(report?.reportID);
    const supportTicketName = derivedSupportTicketName ?? report?.reportName ?? translate('supportTicket.fallbackTitle');

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
            <>
                <View style={[styles.ph5, styles.pv2]}>
                    <View style={[styles.flexRow, styles.alignItemsStart]}>
                        <Tooltip text={translate('supportTicket.checkboxTooltip')}>
                            <View>
                                <Checkbox
                                    isChecked={isResolved}
                                    onPress={showCheckboxInfo}
                                    style={styles.cursorDisabled}
                                    shouldSelectOnPressEnter
                                    accessibilityLabel={translate('supportTicket.checkboxTooltip')}
                                    sentryLabel={CONST.SENTRY_LABEL.SUPPORT_TICKET.VIEW_CHECKBOX}
                                />
                            </View>
                        </Tooltip>
                        <View style={[styles.ml3, styles.flex1]}>
                            <Text style={styles.taskTitleMenuItem}>{supportTicketName}</Text>
                            <Text style={[styles.taskTitleDescription, styles.mt3]}>{translate('task.description')}</Text>
                            <Text>{translate('supportTicket.description', {supportRep: supportRepName})}</Text>
                        </View>
                    </View>
                </View>
                {!!report?.managerID && (
                    <MenuItem
                        label={translate('task.assignee')}
                        accessibilityLabel={`${translate('task.assignee')}, ${assigneeDisplayName}`}
                        titleComponent={
                            <UserPill
                                avatar={supportRepPersonalDetails?.avatar}
                                displayName={assigneeDisplayName}
                                accountID={report.managerID}
                                email={supportRepPersonalDetails?.login}
                                style={styles.userPillStandalone}
                            />
                        }
                        shouldShowRightIcon={false}
                        wrapperStyle={[styles.pv2]}
                        shouldGreyOutWhenDisabled={false}
                        interactive={false}
                    />
                )}
            </>
        </OfflineWithFeedback>
    );
}

export default SupportTicketView;
