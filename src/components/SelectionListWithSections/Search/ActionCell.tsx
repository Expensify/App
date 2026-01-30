import React, {useCallback, useContext} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Badge from '@components/Badge';
import Button from '@components/Button';
import {DelegateNoAccessContext} from '@components/DelegateNoAccessModalProvider';
import type {PaymentMethod} from '@components/KYCWall/types';
import {SearchScopeProvider} from '@components/Search/SearchScopeProvider';
import SettlementButton from '@components/SettlementButton';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useReportWithTransactionsAndViolations from '@hooks/useReportWithTransactionsAndViolations';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {canIOUBePaid} from '@libs/actions/IOU';
import {getPayMoneyOnSearchInvoiceParams, payMoneyRequestOnSearch} from '@libs/actions/Search';
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
    extraSmall?: boolean;
    shouldDisablePointerEvents?: boolean;
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
    extraSmall = false,
    shouldDisablePointerEvents,
}: ActionCellProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isOffline} = useNetwork();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Checkmark', 'Checkbox']);
    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const [iouReport, transactions] = useReportWithTransactionsAndViolations(reportID);
    const policy = usePolicy(policyID);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.chatReportID}`, {canBeMissing: true});
    const canBePaid = canIOUBePaid(iouReport, chatReport, policy, bankAccountList, transactions, false);
    const shouldOnlyShowElsewhere = !canBePaid && canIOUBePaid(iouReport, chatReport, policy, bankAccountList, transactions, true);
    const text = isChildListItem ? translate(actionTranslationsMap[CONST.SEARCH.ACTION_TYPES.VIEW]) : translate(actionTranslationsMap[action]);
    const shouldUseViewAction = action === CONST.SEARCH.ACTION_TYPES.VIEW || (parentAction === CONST.SEARCH.ACTION_TYPES.PAID && action === CONST.SEARCH.ACTION_TYPES.PAID);

    const {currency} = iouReport ?? {};

    const confirmPayment = useCallback(
        (type: ValueOf<typeof CONST.IOU.PAYMENT_TYPE> | undefined, payAsBusiness?: boolean, methodID?: number, paymentMethod?: PaymentMethod | undefined) => {
            if (!type || !reportID || !hash || !amount) {
                return;
            }

            if (isDelegateAccessRestricted) {
                showDelegateNoAccessModal();
                return;
            }

            const invoiceParams = getPayMoneyOnSearchInvoiceParams(policyID, payAsBusiness, methodID, paymentMethod);
            payMoneyRequestOnSearch(hash, [{amount, paymentType: type, reportID, ...(isInvoiceReport(iouReport) ? invoiceParams : {})}]);
        },
        [reportID, hash, amount, policyID, iouReport, isDelegateAccessRestricted, showDelegateNoAccessModal],
    );

    if (!isChildListItem && ((parentAction !== CONST.SEARCH.ACTION_TYPES.PAID && action === CONST.SEARCH.ACTION_TYPES.PAID) || action === CONST.SEARCH.ACTION_TYPES.DONE)) {
        return (
            <View
                style={[StyleUtils.getHeight(variables.h20), styles.justifyContentCenter, shouldDisablePointerEvents && styles.pointerEventsNone]}
                accessible={!shouldDisablePointerEvents}
                accessibilityState={{disabled: shouldDisablePointerEvents}}
            >
                <Badge
                    text={text}
                    icon={action === CONST.SEARCH.ACTION_TYPES.DONE ? expensifyIcons.Checkbox : expensifyIcons.Checkmark}
                    badgeStyles={[
                        styles.ml0,
                        styles.ph2,
                        styles.gap1,
                        isLargeScreenWidth ? styles.alignSelfCenter : styles.alignSelfEnd,
                        StyleUtils.getHeight(variables.h20),
                        StyleUtils.getMinimumHeight(variables.h20),
                        isSelected ? StyleUtils.getBorderColorStyle(theme.buttonHoveredBG) : StyleUtils.getBorderColorStyle(theme.border),
                    ]}
                    textStyles={StyleUtils.getFontSizeStyle(extraSmall ? variables.fontSizeExtraSmall : variables.fontSizeSmall)}
                    iconStyles={styles.mr0}
                    success
                    shouldUseXXSmallIcon={extraSmall}
                />
            </View>
        );
    }

    if (action === CONST.SEARCH.ACTION_TYPES.VIEW || shouldUseViewAction || isChildListItem) {
        const buttonInnerStyles = isSelected ? styles.buttonDefaultSelected : {};

        return isLargeScreenWidth ? (
            <Button
                testID="ActionCell"
                text={text}
                onPress={goToItem}
                small={!extraSmall}
                extraSmall={extraSmall}
                style={[styles.w100, shouldDisablePointerEvents && styles.pointerEventsNone]}
                isDisabled={shouldDisablePointerEvents}
                shouldStayNormalOnDisable={shouldDisablePointerEvents}
                innerStyles={buttonInnerStyles}
                link={isChildListItem}
                shouldUseDefaultHover={!isChildListItem}
                isNested
            />
        ) : null;
    }

    if (action === CONST.SEARCH.ACTION_TYPES.PAY) {
        return (
            <SearchScopeProvider isOnSearch={false}>
                <SettlementButton
                    shouldUseShortForm
                    buttonSize={extraSmall ? CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL : CONST.DROPDOWN_BUTTON_SIZE.SMALL}
                    currency={currency}
                    formattedAmount={convertToDisplayString(Math.abs(iouReport?.total ?? 0), currency)}
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    policyID={policyID || iouReport?.policyID}
                    iouReport={iouReport}
                    chatReportID={iouReport?.chatReportID}
                    enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                    onPress={(type, payAsBusiness, methodID, paymentMethod) => confirmPayment(type as ValueOf<typeof CONST.IOU.PAYMENT_TYPE>, payAsBusiness, methodID, paymentMethod)}
                    style={[styles.w100, shouldDisablePointerEvents && styles.pointerEventsNone]}
                    wrapperStyle={[styles.w100]}
                    shouldShowPersonalBankAccountOption={!policyID && !iouReport?.policyID}
                    isDisabled={isOffline || shouldDisablePointerEvents}
                    shouldStayNormalOnDisable={shouldDisablePointerEvents}
                    isLoading={isLoading}
                    onlyShowPayElsewhere={shouldOnlyShowElsewhere}
                />
            </SearchScopeProvider>
        );
    }

    return (
        <Button
            text={text}
            onPress={goToItem}
            small={!extraSmall}
            extraSmall={extraSmall}
            style={[styles.w100, shouldDisablePointerEvents && styles.pointerEventsNone]}
            isLoading={isLoading}
            success
            isDisabled={isOffline || shouldDisablePointerEvents}
            shouldStayNormalOnDisable={shouldDisablePointerEvents}
            isNested
        />
    );
}

export default ActionCell;
