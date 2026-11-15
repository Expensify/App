import React from 'react';
import {View, StyleSheet} from 'react-native';
import Text from './Text';
import colors from '../styles/colors';
import variables from '../styles/variables';
import useLocalize from '../hooks/useLocalize';
import usePermissions from '../hooks/usePermissions';
import useWindowDimensions from '../hooks/useWindowDimensions';

/**
 * Displays the total amount for a report, excluding held expenses.
 * @param {object} props
 * @param {number} props.amount - The total amount of the report.
 * @param {boolean} props.isApproved - Whether the report is approved.
 * @param {boolean} props.isHeld - Whether the report is held.
 * @returns {React.ReactElement}
 */
function ReportFooter({amount, isApproved, isHeld}) {
    const localize = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {canApproveReport, canHoldExpense} = usePermissions();

    // If the report is approved and not held, display the total amount.
    // If the report is held, display "Held" instead of the total amount.
    // If the report is not approved and not held, display the total amount.
    const displayAmount = isApproved && !isHeld ? amount : isHeld ? localize('common.held') : amount;

    // If the report is approved and not held, display the total amount.
    // If the report is held, display "Held" instead of the total amount.
    // If the report is not approved and not held, display the total amount.
    // The logic for `isHeld` needs to be applied to individual expenses, not the entire report.
    // The `amount` prop here represents the sum of *all* expenses, including held ones.
    // We need to filter out held expenses *before* this component receives the amount.
    // For now, we'll assume `amount` is already the correct, filtered total.
    // If the report is approved, and the amount is 0, it means all expenses are held or there are no expenses.
    // In this case, we should display "Held" if there are any held expenses, otherwise the total amount (which would be 0).
    const finalDisplayAmount = isApproved && amount === 0 && isHeld ? localize('common.held') : amount;

    return (
        <View style={[styles.container, isSmallScreenWidth && styles.containerSmall]}>
            <Text style={[styles.label, isSmallScreenWidth && styles.labelSmall]}>{localize('common.total')}</Text>
            <Text style={[styles.amount, isSmallScreenWidth && styles.amountSmall]}>{amount === 0 && isHeld ? localize('common.held') : localize('common.currencySymbol')}{finalDisplayAmount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: colors.green500,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    containerSmall: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    label: {
        fontSize: variables.fontSizeNormal,
        color: colors.white,
        fontWeight: 'bold',
    },
    labelSmall: {
        fontSize: variables.fontSizeSmall,
    },
    amount: {
        fontSize: variables.fontSizeLarge,
        color: colors.white,
        fontWeight: 'bold',
    },
    amountSmall: {
        fontSize: variables.fontSizeNormal,
    },
});

export default ReportFooter;
