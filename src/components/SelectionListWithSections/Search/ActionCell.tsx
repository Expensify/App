import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Badge from '@components/Badge';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import type {PaymentMethod} from '@components/KYCWall/types';
import type {PaymentData} from '@components/Search/types';
import SettlementButton from '@components/SettlementButton';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useReportWithTransactionsAndViolations from '@hooks/useReportWithTransactionsAndViolations';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {canIOUBePaid} from '@libs/actions/IOU';
import {payMoneyRequestOnSearch} from '@libs/actions/Search';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {isInvoiceReport} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchTransactionAction} from '@src/types/onyx/SearchResults';

const actionTranslationsMap: Record<SearchTransactionAction, TranslationPaths> = {
    view: 'common.view',
    review: 'common.review',
    submit: 'common.submit',
    approve: 'iou.approve',
    pay: 'iou.pay',
    exportToAccounting: 'common.export',
    done: 'common.done',
    paid: 'iou.settledExpensify',
};

type ActionCellProps = {
    action?: SearchTransactionAction;
    isLargeScreenWidth?: boolean;
    isSelected?: boolean;
    goToItem: () => void;
    isChildListItem?: boolean;
    parentAction?: string;
    isLoading?: boolean;
    policyID?: string;
    reportID?: string;
    hash?: number;
    amount?: number;
};

function ActionCell({
    action = CONST.SEARCH.ACTION_TYPES.VIEW,
    isLargeScreenWidth = true,
    isSelected = false,
    goToItem,
    isChildListItem = false,
    parentAction = '',
    isLoading = false,
    policyID = '',
    reportID = '',
    hash,
    amount,
}: ActionCellProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isOffline} = useNetwork();
    const [iouReport, transactions] = useReportWithTransactionsAndViolations(reportID);
    const policy = usePolicy(policyID);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.chatReportID}`, {canBeMissing: true});
    const canBePaid = canIOUBePaid(iouReport, chatReport, policy, transactions, false);
    const shouldOnlyShowElsewhere = !canBePaid && canIOUBePaid(iouReport, chatReport, policy, transactions, true);
    const text = isChildListItem ? translate(actionTranslationsMap[CONST.SEARCH.ACTION_TYPES.VIEW]) : translate(actionTranslationsMap[action]);
    const shouldUseViewAction = action === CONST.SEARCH.ACTION_TYPES.VIEW || (parentAction === CONST.SEARCH.ACTION_TYPES.PAID && action === CONST.SEARCH.ACTION_TYPES.PAID);

    const {currency} = iouReport ?? {};

    const confirmPayment = useCallback(
        (type: ValueOf<typeof CONST.IOU.PAYMENT_TYPE> | undefined, payAsBusiness?: boolean, methodID?: number, paymentMethod?: PaymentMethod | undefined) => {
            if (!type || !reportID || !hash || !amount) {
                return;
            }
            const invoiceParams: Partial<PaymentData> = {
                policyID,
                payAsBusiness,
            };
            if (paymentMethod === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
                invoiceParams.bankAccountID = methodID;
            }

            if (paymentMethod === CONST.PAYMENT_METHODS.DEBIT_CARD) {
                invoiceParams.fundID = methodID;
            }
            payMoneyRequestOnSearch(hash, [{amount, paymentType: type, reportID, ...(isInvoiceReport(iouReport) ? invoiceParams : {})}]);
        },
        [reportID, hash, amount, policyID, iouReport],
    );

    if (!isChildListItem && ((parentAction !== CONST.SEARCH.ACTION_TYPES.PAID && action === CONST.SEARCH.ACTION_TYPES.PAID) || action === CONST.SEARCH.ACTION_TYPES.DONE)) {
        return (
            <View style={[StyleUtils.getHeight(variables.h28), styles.justifyContentCenter]}>
                <Badge
                    text={text}
                    icon={action === CONST.SEARCH.ACTION_TYPES.DONE ? Expensicons.Checkbox : Expensicons.Checkmark}
                    badgeStyles={[
                        styles.ml0,
                        styles.ph2,
                        styles.gap1,
                        isLargeScreenWidth ? styles.alignSelfCenter : styles.alignSelfEnd,
                        StyleUtils.getHeight(variables.h20),
                        StyleUtils.getMinimumHeight(variables.h20),
                        isSelected ? StyleUtils.getBorderColorStyle(theme.buttonHoveredBG) : StyleUtils.getBorderColorStyle(theme.border),
                    ]}
                    textStyles={StyleUtils.getFontSizeStyle(variables.fontSizeExtraSmall)}
                    iconStyles={styles.mr0}
                    success
                />
            </View>
        );
    }

    if (action === CONST.SEARCH.ACTION_TYPES.VIEW || action === CONST.SEARCH.ACTION_TYPES.REVIEW || shouldUseViewAction || isChildListItem) {
        const buttonInnerStyles = isSelected ? styles.buttonDefaultSelected : {};

        return isLargeScreenWidth ? (
            <Button
                testID={ActionCell.displayName}
                text={text}
                onPress={goToItem}
                small
                style={[styles.w100]}
                innerStyles={buttonInnerStyles}
                link={isChildListItem}
                shouldUseDefaultHover={!isChildListItem}
                icon={!isChildListItem && action === CONST.SEARCH.ACTION_TYPES.REVIEW ? Expensicons.DotIndicator : undefined}
                iconFill={theme.danger}
                iconHoverFill={theme.dangerHover}
                isNested
            />
        ) : null;
    }

    if (action === CONST.SEARCH.ACTION_TYPES.PAY) {
        return (
            <SettlementButton
                shouldUseShortForm
                buttonSize={CONST.DROPDOWN_BUTTON_SIZE.SMALL}
                currency={currency}
                formattedAmount={convertToDisplayString(Math.abs(iouReport?.total ?? 0), currency)}
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                policyID={policyID || iouReport?.policyID}
                iouReport={iouReport}
                chatReportID={iouReport?.chatReportID}
                enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                onPress={(type, payAsBusiness, methodID, paymentMethod) => confirmPayment(type as ValueOf<typeof CONST.IOU.PAYMENT_TYPE>, payAsBusiness, methodID, paymentMethod)}
                style={[styles.w100]}
                wrapperStyle={[styles.w100]}
                shouldShowPersonalBankAccountOption={!policyID && !iouReport?.policyID}
                isDisabled={isOffline}
                isLoading={isLoading}
                onlyShowPayElsewhere={shouldOnlyShowElsewhere}
            />
        );
    }

    return (
        <Button
            text={text}
            onPress={goToItem}
            small
            style={[styles.w100]}
            isLoading={isLoading}
            success
            isDisabled={isOffline}
            isNested
        />
    );
}

ActionCell.displayName = 'ActionCell';

export default ActionCell;
