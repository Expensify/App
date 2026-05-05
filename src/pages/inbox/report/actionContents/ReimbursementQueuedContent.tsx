import {isUserValidatedSelector} from '@selectors/Account';
import {tierNameSelector} from '@selectors/UserWallet';
import React, {useContext} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import KYCWall from '@components/KYCWall';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getOriginalMessage} from '@libs/ReportActionsUtils';
import {getIndicatedMissingPaymentMethod, isChatThread} from '@libs/ReportUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import {openPersonalBankAccountSetupView} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetailsList, Report, ReportAction} from '@src/types/onyx';

type ReimbursementQueuedContentProps = {
    /** The reimbursement queued action */
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED>;

    /** The chat report this action belongs to */
    report: OnyxEntry<Report>;

    /** The IOU/Expense report we are paying */
    iouReport: OnyxEntry<Report>;

    /** Personal details list for resolving the submitter's display name */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

function ReimbursementQueuedContent({action, report, iouReport, personalDetails}: ReimbursementQueuedContentProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const kycWallRef = useContext(KYCWallContext);

    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [userWalletTierName] = useOnyx(ONYXKEYS.USER_WALLET, {selector: tierNameSelector});
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});

    const targetReport = isChatThread(report) ? parentReport : report;
    const submitterDisplayName = formatPhoneNumber(getDisplayNameOrDefault(personalDetails?.[targetReport?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID]));
    const paymentType = getOriginalMessage(action)?.paymentType ?? '';
    const missingPaymentMethod = getIndicatedMissingPaymentMethod(userWalletTierName, targetReport?.reportID, action, bankAccountList);

    return (
        <ReportActionItemBasicMessage message={translate(paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY ? 'iou.waitingOnEnabledWallet' : 'iou.waitingOnBankAccount', submitterDisplayName)}>
            <>
                {missingPaymentMethod === 'bankAccount' && (
                    <Button
                        success
                        style={[styles.w100, styles.requestPreviewBox]}
                        text={translate('bankAccount.addBankAccount')}
                        onPress={() => openPersonalBankAccountSetupView({exitReportID: Navigation.getTopmostReportId() ?? targetReport?.reportID, isUserValidated})}
                        pressOnEnter
                        large
                    />
                )}
                {missingPaymentMethod === 'wallet' && (
                    <KYCWall
                        ref={kycWallRef}
                        onSuccessfulKYC={() => Navigation.navigate(ROUTES.ENABLE_PAYMENTS)}
                        enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                        addBankAccountRoute={ROUTES.BANK_ACCOUNT_PERSONAL}
                        addDebitCardRoute={ROUTES.SETTINGS_ADD_DEBIT_CARD}
                        chatReportID={targetReport?.reportID}
                        iouReport={iouReport}
                    >
                        {(triggerKYCFlow, buttonRef) => (
                            <Button
                                ref={buttonRef}
                                success
                                large
                                style={[styles.w100, styles.requestPreviewBox]}
                                text={translate('iou.enableWallet')}
                                onPress={(event) => {
                                    triggerKYCFlow({event});
                                }}
                            />
                        )}
                    </KYCWall>
                )}
            </>
        </ReportActionItemBasicMessage>
    );
}

export default ReimbursementQueuedContent;
