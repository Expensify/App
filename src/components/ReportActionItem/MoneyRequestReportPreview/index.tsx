import React from 'react';
import {View} from 'react-native';
import type {ListRenderItem, StyleProp, ViewStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Text from '@components/Text';
import useDelegateUserDetails from '@hooks/useDelegateUserDetails';
import usePolicy from '@hooks/usePolicy';
import useReportWithTransactionsAndViolations from '@hooks/useReportWithTransactionsAndViolations';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import type {ContextMenuAnchor} from '@pages/home/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Policy, Report, ReportAction, Transaction, TransactionViolation, TransactionViolations} from '@src/types/onyx';
import MoneyRequestReportPreviewContent from './MoneyRequestReportPreviewContent';

type MoneyRequestReportPreviewProps = {
    /** The report's policyID, used for Onyx subscription */
    policyID: string | undefined;

    /** All the data of the action */
    action: ReportAction;

    /** The associated chatReport */
    chatReportID: string | undefined;

    /** The active IOUReport, used for Onyx subscription */
    iouReportID: string | undefined;

    /** Extra styles to pass to View wrapper */
    containerStyles?: StyleProp<ViewStyle>;

    /** Popover context menu anchor, used for showing context menu */
    contextMenuAnchor?: ContextMenuAnchor;

    /** Callback for updating context menu active state, used for showing context menu */
    checkIfContextMenuActive?: () => void;

    /** Callback when the payment options popover is shown */
    onPaymentOptionsShow?: () => void;

    /** Callback when the payment options popover is closed */
    onPaymentOptionsHide?: () => void;

    /** Whether a message is a whisper */
    isWhisper?: boolean;

    /** Whether the corresponding report action item is hovered */
    isHovered?: boolean;
};

type MoneyRequestReportPreviewContentOnyxProps = {
    chatReport: OnyxEntry<Report>;
    invoiceReceiverPolicy: OnyxEntry<Policy>;
    iouReport: OnyxEntry<Report>;
    transactions: Transaction[];
    violations: OnyxCollection<TransactionViolation[]>;
    policy: OnyxEntry<Policy>;
    invoiceReceiverPersonalDetail: OnyxEntry<PersonalDetails>;
    lastTransactionViolations: TransactionViolations;
    isDelegateAccessRestricted: boolean;
};

type MoneyRequestReportPreviewContentProps = MoneyRequestReportPreviewContentOnyxProps & MoneyRequestReportPreviewProps & {renderItem: ListRenderItem<Transaction> | null | undefined};

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
    const styles = useThemeStyles();

    const renderItem: ListRenderItem<Transaction> = ({item}) => (
        <View style={[{backgroundColor: 'red', height: 100, marginRight: 8, borderWidth: 1, borderBlockColor: 'black'}, styles.moneyRequestPreviewBox]}>
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
export type {MoneyRequestReportPreviewProps, MoneyRequestReportPreviewContentProps};
