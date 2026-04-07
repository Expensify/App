import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getLinkedTransactionID, getOriginalMessage, isActionOfType} from '@libs/ReportActionsUtils';
import {getIOUReportActionDisplayMessage, hasMissingInvoiceBankAccount, isSettled} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ReportAction} from '@src/types/onyx';
import ReportActionMessageContent from './ReportActionMessageContent';

type IouReportActionMessageProps = {
    /** The report action */
    action: ReportAction;

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: boolean;

    /** Additional styles to add after local styles. */
    style?: StyleProp<ViewStyle & TextStyle>;

    /** Whether or not the message is hidden by moderation */
    isHidden: boolean;

    /** The ID of the report */
    reportID: string | undefined;
};

function IouReportActionMessage({action, displayAsGroup, reportID, style, isHidden}: IouReportActionMessageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(getLinkedTransactionID(action))}`);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);

    let iouMessage: string | undefined;
    const originalMessage = isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.IOU) ? getOriginalMessage(action) : null;
    const iouReportID = originalMessage?.IOUReportID;
    if (iouReportID) {
        iouMessage = getIOUReportActionDisplayMessage(translate, action, transaction, report, bankAccountList);
    }

    const openWorkspaceInvoicesPage = () => {
        const policyID = report?.policyID;
        if (!policyID) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_INVOICES.getRoute(policyID));
    };

    const shouldShowAddBankAccountButton = action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU && hasMissingInvoiceBankAccount(reportID) && !isSettled(reportID);

    return (
        <ReportActionMessageContent
            action={action}
            displayAsGroup={displayAsGroup}
            reportID={reportID}
            style={style}
            isHidden={isHidden}
            iouMessage={iouMessage}
        >
            {shouldShowAddBankAccountButton && (
                <Button
                    style={[styles.mt2, styles.alignSelfStart]}
                    success
                    text={translate('bankAccount.addBankAccount')}
                    onPress={openWorkspaceInvoicesPage}
                    sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_ITEM_MESSAGE_ADD_BANK_ACCOUNT}
                />
            )}
        </ReportActionMessageContent>
    );
}

export default IouReportActionMessage;
