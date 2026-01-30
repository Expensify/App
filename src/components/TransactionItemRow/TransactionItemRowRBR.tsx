import React from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {DotIndicator} from '@components/Icon/Expensicons';
import RenderHTML from '@components/RenderHTML';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {isSettled} from '@libs/ReportUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report, TransactionViolation} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';

type TransactionItemRowRBRProps = {
    /** Transaction item */
    transaction: Transaction;

    /** Transaction violations */
    violations?: TransactionViolation[];

    /** Report item */
    report?: Report;

    /** Styles for the RBR messages container */
    containerStyles?: ViewStyle[];

    /** Error message for missing required fields in the transaction */
    missingFieldError?: string;
};

function TransactionItemRowRBR({transaction, violations, report, containerStyles, missingFieldError}: TransactionItemRowRBRProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const {environmentURL} = useEnvironment();
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction.reportID}`, {
        canBeMissing: true,
    });
    const companyCardPageURL = `${environmentURL}/${ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(report?.policyID)}`;
    // TODO add correct link to card page in wallet settings
    const connectionLink = `${environmentURL}/${ROUTES.SETTINGS_WALLET}`;
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${report?.policyID}`, {canBeMissing: true});
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const transactionThreadId = reportActions ? getIOUActionForTransactionID(Object.values(reportActions ?? {}), transaction.transactionID)?.childReportID : undefined;
    const [transactionThreadActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadId}`, {
        canBeMissing: true,
    });

    const RBRMessages = ViolationsUtils.getRBRMessages(
        transaction,
        isSettled(report) ? [] : (violations ?? []),
        translate,
        missingFieldError,
        Object.values(transactionThreadActions ?? {}),
        policyTags,
        companyCardPageURL,
        connectionLink,
        cardList,
    );

    return (
        RBRMessages.length > 0 && (
            <View
                style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, containerStyles]}
                testID="TransactionItemRowRBR"
            >
                <Icon
                    src={DotIndicator}
                    fill={theme.danger}
                    height={variables.iconSizeExtraSmall}
                    width={variables.iconSizeExtraSmall}
                />
                <View style={[styles.pre, styles.flexShrink1, {color: theme.danger}]}>
                    <RenderHTML html={`<rbr shouldShowEllipsis="1" issmall >${RBRMessages}</rbr>`} />
                </View>
            </View>
        )
    );
}

export default TransactionItemRowRBR;
