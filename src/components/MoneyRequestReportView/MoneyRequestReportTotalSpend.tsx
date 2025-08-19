import {useIsFocused} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import type * as OnyxTypes from '@src/types/onyx';

type MoneyRequestReportTotalSpendProps = {
    /** Report for which the total spend is being displayed */
    report: OnyxTypes.Report;

    /** Whether the report has any comments */
    hasComments: boolean;

    /** Whether the report is loading report actions */
    isLoadingReportActions: boolean;

    /** Whether the report has any transactions */
    isEmptyTransactions: boolean;

    /** The total display spend of the report */
    totalDisplaySpend: number;

    /** Whether the report has any pending actions */
    hasPendingAction: boolean;
};

function MoneyRequestReportTotalSpend({hasComments, isLoadingReportActions, isEmptyTransactions, totalDisplaySpend, report, hasPendingAction}: MoneyRequestReportTotalSpendProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isFocused = useIsFocused();

    return (
        <View style={[styles.dFlex, styles.flexRow, styles.ph5, styles.justifyContentBetween, styles.mb2]}>
            <Animated.Text
                style={[styles.textLabelSupporting]}
                entering={hasComments ? undefined : FadeIn}
                exiting={isFocused ? FadeOut : undefined}
            >
                {hasComments || isLoadingReportActions ? translate('common.comments') : ''}
            </Animated.Text>
            {!isEmptyTransactions && (
                <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.pr3]}>
                    <Text style={[styles.mr3, styles.textLabelSupporting]}>{translate('common.total')}</Text>
                    <Text style={[shouldUseNarrowLayout ? styles.mnw64p : styles.mnw100p, styles.textAlignRight, styles.textBold, hasPendingAction && styles.opacitySemiTransparent]}>
                        {convertToDisplayString(totalDisplaySpend, report?.currency)}
                    </Text>
                </View>
            )}
        </View>
    );
}

MoneyRequestReportTotalSpend.displayName = 'MoneyRequestReportTotalSpend';

export default MoneyRequestReportTotalSpend;
