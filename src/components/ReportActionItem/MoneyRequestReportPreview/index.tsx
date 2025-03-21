import React from 'react';
import {View} from 'react-native';
import type {ListRenderItem, StyleProp, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Text from '@components/Text';
import useDelegateUserDetails from '@hooks/useDelegateUserDetails';
import usePolicy from '@hooks/usePolicy';
import useReportWithTransactionsAndViolations from '@hooks/useReportWithTransactionsAndViolations';
import useTransactionViolations from '@hooks/useTransactionViolations';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import MoneyRequestReportPreviewContent from './MoneyRequestReportPreviewContent';
import type {MoneyRequestReportPreviewProps} from './types';

function MoneyRequestReportPreview({
    iouReportID,
    policyID,
    chatReportID,
    action,
    containerStyles,
    contextMenuAnchor,
    isHovered = false,
    isWhisper = false,
    checkIfContextMenuActive = () => {},
    onPaymentOptionsShow,
    onPaymentOptionsHide,
}: MoneyRequestReportPreviewProps) {
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`);
    const [invoiceReceiverPolicy] = useOnyx(
        `${ONYXKEYS.COLLECTION.POLICY}${chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : CONST.DEFAULT_NUMBER_ID}`,
    );
    const [invoiceReceiverPersonalDetail] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        selector: (personalDetails) =>
            personalDetails?.[chatReport?.invoiceReceiver && 'accountID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.accountID : CONST.DEFAULT_NUMBER_ID],
    });
    const [iouReport, transactions, violations] = useReportWithTransactionsAndViolations(iouReportID);
    const policy = usePolicy(policyID);
    const lastTransaction = transactions?.at(0);
    const lastTransactionViolations = useTransactionViolations(lastTransaction?.transactionID);
    const {isDelegateAccessRestricted} = useDelegateUserDetails();

    const moneyRequestPreviewBox: StyleProp<ViewStyle> = {
        backgroundColor: 'transparent',
        borderRadius: variables.componentBorderRadiusLarge,
        maxWidth: variables.reportPreviewMaxWidth,
        height: 280,
        width: 300,
        borderWidth: 1,
        borderBlockColor: 'black',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    };

    // for now, it is yet to be conencted with 'TransactionPreview'
    const renderItem: ListRenderItem<Transaction> = ({item}) => (
        <View style={moneyRequestPreviewBox}>
            <Text>
                This is a TransactionPreview for {item.amount} {item.currency}
            </Text>
        </View>
    );

    return (
        <MoneyRequestReportPreviewContent
            containerStyles={containerStyles}
            contextMenuAnchor={contextMenuAnchor}
            isHovered={isHovered}
            isWhisper={isWhisper}
            checkIfContextMenuActive={checkIfContextMenuActive}
            onPaymentOptionsShow={onPaymentOptionsShow}
            onPaymentOptionsHide={onPaymentOptionsHide}
            action={action}
            chatReportID={chatReportID}
            iouReportID={iouReportID}
            policyID={undefined}
            iouReport={iouReport}
            transactions={transactions}
            violations={violations}
            chatReport={chatReport}
            policy={policy}
            invoiceReceiverPersonalDetail={invoiceReceiverPersonalDetail}
            invoiceReceiverPolicy={invoiceReceiverPolicy}
            lastTransactionViolations={lastTransactionViolations}
            isDelegateAccessRestricted={isDelegateAccessRestricted}
            renderItem={renderItem}
        />
    );
}

MoneyRequestReportPreview.displayName = 'MoneyRequestReportPreview';

export default MoneyRequestReportPreview;
