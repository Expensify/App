import type {ReactNode} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type MoneyReportHeaderActionsBarProps = {
    primaryAction: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | ValueOf<typeof CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS> | '';
    shouldDisplayNarrowMoreButton: boolean;
    shouldShowSelectedTransactionsButton: boolean;
    primaryActionElement: ReactNode;
    secondaryActionsElement: ReactNode;
    selectionDropdownElement: ReactNode;
};

function MoneyReportHeaderPrimaryActionSlot({
    primaryAction,
    children,
}: {
    primaryAction: MoneyReportHeaderActionsBarProps['primaryAction'];
    children: ReactNode;
}) {
    const styles = useThemeStyles();

    if (!primaryAction) {
        return null;
    }

    return <View style={[styles.flex1]}>{children}</View>;
}

/**
 * Lays out primary action, secondary (more) menu, and search selection dropdown
 * based on selection mode and narrow vs wide header constraints.
 */
function MoneyReportHeaderActionsBar({
    primaryAction,
    shouldDisplayNarrowMoreButton,
    shouldShowSelectedTransactionsButton,
    primaryActionElement,
    secondaryActionsElement,
    selectionDropdownElement,
}: MoneyReportHeaderActionsBarProps) {
    const styles = useThemeStyles();

    if (shouldShowSelectedTransactionsButton) {
        if (shouldDisplayNarrowMoreButton) {
            return <View>{selectionDropdownElement}</View>;
        }

        return <View style={[styles.dFlex, styles.w100, styles.ph5, styles.pb3]}>{selectionDropdownElement}</View>;
    }

    if (shouldDisplayNarrowMoreButton) {
        return (
            <View style={[styles.flexRow, styles.gap2]}>
                {primaryActionElement}
                {secondaryActionsElement}
            </View>
        );
    }

    return (
        <View style={[styles.flexRow, styles.gap2, styles.pb3, styles.ph5, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}>
            <MoneyReportHeaderPrimaryActionSlot primaryAction={primaryAction}>{primaryActionElement}</MoneyReportHeaderPrimaryActionSlot>
            {secondaryActionsElement}
        </View>
    );
}

export default MoneyReportHeaderActionsBar;
export type {MoneyReportHeaderActionsBarProps};
