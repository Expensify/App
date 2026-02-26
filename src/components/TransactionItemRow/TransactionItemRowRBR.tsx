import React from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import Icon from '@components/Icon';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {isMarkAsCashActionForTransaction} from '@libs/ReportPrimaryActionUtils';
import {isSettled} from '@libs/ReportUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report, TransactionViolation} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';

const HTML_TAG_PATTERN = /<\/?[a-z][^>]*>/i;

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
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction.reportID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const companyCardPageURL = `${environmentURL}/${ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(report?.policyID)}`;
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${report?.policyID}`);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator'] as const);
    const transactionThreadId = reportActions ? getIOUActionForTransactionID(Object.values(reportActions ?? {}), transaction.transactionID)?.childReportID : undefined;
    const [transactionThreadActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadId}`);
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const isMarkAsCash = parentReport && currentUserLogin && violations ? isMarkAsCashActionForTransaction(currentUserLogin, parentReport, violations, policy) : false;

    const RBRMessages = ViolationsUtils.getRBRMessages(
        transaction,
        isSettled(report) ? [] : (violations ?? []),
        translate,
        missingFieldError,
        Object.values(transactionThreadActions ?? {}),
        policyTags,
        companyCardPageURL,
        undefined,
        cardList,
        isMarkAsCash,
    );
    const hasHTMLTags = HTML_TAG_PATTERN.test(RBRMessages);

    return (
        RBRMessages.length > 0 && (
            <View
                style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, containerStyles]}
                testID="TransactionItemRowRBR"
            >
                <Icon
                    src={icons.DotIndicator}
                    fill={theme.danger}
                    height={variables.iconSizeExtraSmall}
                    width={variables.iconSizeExtraSmall}
                />
                <View style={[styles.pre, styles.flexShrink1, {color: theme.danger}]}>
                    {hasHTMLTags ? (
                        <RenderHTML html={`<rbr shouldShowEllipsis="1" issmall >${RBRMessages}</rbr>`} />
                    ) : (
                        <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={[styles.textLabelError, styles.textMicro]}
                        >
                            {RBRMessages}
                        </Text>
                    )}
                </View>
            </View>
        )
    );
}

export default TransactionItemRowRBR;
