import React from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import RadioButton from '@components/RadioButton';
import DateCell from '@components/Search/SearchList/ListItem/DateCell';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import DeferredChatBubbleCell from './DataCells/DeferredChatBubbleCell';
import MerchantOrDescriptionCell from './DataCells/MerchantCell';
import ReceiptCell from './DataCells/ReceiptCell';
import TotalCell from './DataCells/TotalCell';
import TypeCell from './DataCells/TypeCell';
import DeferredTransactionItemRowRBR from './DeferredTransactionItemRowRBR';
import type {TransactionItemRowNarrowComputedData, TransactionItemRowProps} from './types';

type TransactionItemRowNarrowProps = Pick<
    TransactionItemRowProps,
    | 'transactionItem'
    | 'report'
    | 'isSelected'
    | 'shouldShowTooltip'
    | 'onCheckboxPress'
    | 'shouldShowCheckbox'
    | 'style'
    | 'isInSingleTransactionReport'
    | 'shouldShowRadioButton'
    | 'onRadioButtonPress'
    | 'shouldShowErrors'
    | 'isDisabled'
    | 'violations'
    | 'shouldShowBottomBorder'
    | 'onArrowRightPress'
    | 'shouldShowArrowRightOnNarrowLayout'
    | 'checkboxSentryLabel'
> &
    TransactionItemRowNarrowComputedData;

function TransactionItemRowNarrow({
    transactionItem,
    report,
    isSelected,
    shouldShowTooltip,
    onCheckboxPress = () => {},
    shouldShowCheckbox = false,
    style,
    isInSingleTransactionReport = false,
    shouldShowRadioButton = false,
    onRadioButtonPress = () => {},
    shouldShowErrors = true,
    isDisabled = false,
    violations,
    shouldShowBottomBorder,
    onArrowRightPress,
    shouldShowArrowRightOnNarrowLayout,
    checkboxSentryLabel,
    bgActiveStyles,
    merchant,
    merchantOrDescription,
    missingFieldError,
    transactionThreadReportID,
    categoryForDisplay,
    createdAt,
    shouldRenderChatBubbleCell,
}: TransactionItemRowNarrowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const expensicons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    return (
        <>
            <View
                style={[styles.expenseWidgetRadius, styles.overflowHidden, bgActiveStyles, styles.justifyContentEvenly, style]}
                testID="transaction-item-row"
            >
                <View style={[styles.flexRow]}>
                    {shouldShowCheckbox && (
                        <Checkbox
                            disabled={isDisabled}
                            onPress={() => {
                                onCheckboxPress(transactionItem.transactionID);
                            }}
                            accessibilityLabel={CONST.ROLE.CHECKBOX}
                            isChecked={isSelected}
                            style={styles.mr3}
                            containerStyle={styles.m0}
                            wrapperStyle={styles.justifyContentCenter}
                            sentryLabel={checkboxSentryLabel}
                        />
                    )}
                    <ReceiptCell
                        transactionItem={transactionItem}
                        isSelected={isSelected}
                        style={styles.mr3}
                        shouldUseNarrowLayout
                    />
                    <View style={[styles.flex2, styles.flexColumn, styles.gap1]}>
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap2]}>
                            {merchantOrDescription ? (
                                <MerchantOrDescriptionCell
                                    merchantOrDescription={merchantOrDescription}
                                    shouldShowTooltip={shouldShowTooltip}
                                    shouldUseNarrowLayout
                                    isDescription={!merchant}
                                />
                            ) : null}
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, !merchantOrDescription && styles.mlAuto]}>
                                {shouldRenderChatBubbleCell && (
                                    <DeferredChatBubbleCell
                                        transaction={transactionItem}
                                        isInSingleTransactionReport={isInSingleTransactionReport}
                                    />
                                )}
                                <TotalCell
                                    transactionItem={transactionItem}
                                    shouldShowTooltip={shouldShowTooltip}
                                    shouldUseNarrowLayout
                                />
                            </View>
                        </View>
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap2]}>
                            <DateCell
                                date={createdAt}
                                showTooltip={shouldShowTooltip}
                                isLargeScreenWidth={false}
                                suffixText={categoryForDisplay}
                            />
                            <TypeCell
                                transactionItem={transactionItem}
                                shouldShowTooltip={shouldShowTooltip}
                                shouldUseNarrowLayout
                            />
                        </View>
                    </View>
                    {!!shouldShowArrowRightOnNarrowLayout && !!onArrowRightPress && (
                        <View style={[styles.justifyContentEnd, styles.alignItemsEnd, styles.mbHalf, styles.ml3]}>
                            <Icon
                                src={expensicons.ArrowRight}
                                fill={theme.icon}
                                additionalStyles={styles.opacitySemiTransparent}
                                width={variables.iconSizeNormal}
                                height={variables.iconSizeNormal}
                            />
                        </View>
                    )}
                    {shouldShowRadioButton && (
                        <View style={[styles.ml3, styles.justifyContentCenter]}>
                            <RadioButton
                                isChecked={isSelected}
                                disabled={isDisabled}
                                onPress={() => onRadioButtonPress?.(transactionItem.transactionID)}
                                accessibilityLabel={CONST.ROLE.RADIO}
                            />
                        </View>
                    )}
                </View>
                {shouldShowErrors && (
                    <DeferredTransactionItemRowRBR
                        transaction={transactionItem}
                        violations={violations}
                        report={report}
                        containerStyles={[styles.mt3, styles.minHeight4]}
                        missingFieldError={missingFieldError}
                        transactionThreadReportID={transactionThreadReportID}
                        shouldUseNarrowLayout
                    />
                )}
            </View>
            {!!shouldShowBottomBorder && (
                <View style={bgActiveStyles}>
                    <View style={styles.ph3}>
                        <View style={[StyleUtils.getSelectedBorderBottomStyle(isSelected)]} />
                    </View>
                </View>
            )}
        </>
    );
}

export default TransactionItemRowNarrow;
