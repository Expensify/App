import Button from '@components/ButtonComposed';
import KYCWall from '@components/KYCWall';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import {getOriginalMessage} from '@libs/ReportActionsUtils';
import {getIndicatedMissingPaymentMethod, isChatThread} from '@libs/ReportUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import {openPersonalBankAccountSetupView} from '@userActions/BankAccounts';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {isUserValidatedSelector} from '@selectors/Account';
import {personalDetailsDisplayNameSelector} from '@selectors/PersonalDetails';
import {tierNameSelector} from '@selectors/UserWallet';
import React, {useContext} from 'react';

type ReimbursementQueuedContentProps = {
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED>;

    /** The chat report this action belongs to */
    report: OnyxEntry<Report>;

    /** The IOU/Expense report we are paying */
    iouReport: OnyxEntry<Report>;
};

function ReimbursementQueuedContent({action, report, iouReport}: ReimbursementQueuedContentProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const kycWallRef = useContext(KYCWallContext);

    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.parentReportID)}`);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [userWalletTierName] = useOnyx(ONYXKEYS.USER_WALLET, {selector: tierNameSelector});
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});

    const targetReport = isChatThread(report) ? parentReport : report;
    const [ownerDisplayName] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: personalDetailsDisplayNameSelector(targetReport?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID, translate, formatPhoneNumber),
    });
    const submitterDisplayName = ownerDisplayName ?? '';
    const paymentType = getOriginalMessage(action)?.paymentType ?? '';
    const missingPaymentMethod = getIndicatedMissingPaymentMethod(userWalletTierName, targetReport?.reportID, action, bankAccountList);

    return (
        <ReportActionItemBasicMessage message={translate(paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY ? 'iou.waitingOnEnabledWallet' : 'iou.waitingOnBankAccount', submitterDisplayName)}>
            <>
                {missingPaymentMethod === CONST.MISSING_PAYMENT_METHODS.BANK_ACCOUNT && (
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        style={[styles.w100, styles.requestPreviewBox]}
                        onPress={() => openPersonalBankAccountSetupView({exitReportID: Navigation.getTopmostReportId() ?? targetReport?.reportID, isUserValidated})}
                        size={CONST.BUTTON_SIZE.LARGE}
                    >
                        <Button.KeyboardShortcut />
                        <Button.Text>{translate('bankAccount.addBankAccount')}</Button.Text>
                    </Button>
                )}
                {missingPaymentMethod === CONST.MISSING_PAYMENT_METHODS.WALLET && (
                    <KYCWall
                        ref={kycWallRef}
                        onSuccessfulKYC={() => Navigation.navigate(ROUTES.ENABLE_PAYMENTS)}
                        enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                        addBankAccountRoute={ROUTES.BANK_ACCOUNT_PERSONAL.getRoute()}
                        addDebitCardRoute={ROUTES.SETTINGS_ADD_DEBIT_CARD}
                        chatReportID={targetReport?.reportID}
                        iouReport={iouReport}
                    >
                        {(triggerKYCFlow, buttonRef) => (
                            <Button
                                ref={buttonRef}
                                variant={CONST.BUTTON_VARIANT.SUCCESS}
                                size={CONST.BUTTON_SIZE.LARGE}
                                style={[styles.w100, styles.requestPreviewBox]}
                                onPress={(event) => {
                                    triggerKYCFlow({event});
                                }}
                            >
                                <Button.Text>{translate('iou.enableWallet')}</Button.Text>
                            </Button>
                        )}
                    </KYCWall>
                )}
            </>
        </ReportActionItemBasicMessage>
    );
}

export default ReimbursementQueuedContent;
