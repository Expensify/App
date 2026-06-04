import React from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import ExpenseReportListItemRowNarrow from './ExpenseReportListItemRowNarrow';
import ExpenseReportListItemRowWide from './ExpenseReportListItemRowWide';
import type {ExpenseReportListItemRowProps} from './types';

function ExpenseReportListItemRow(props: ExpenseReportListItemRowProps) {
    const {isLargeScreenWidth} = useResponsiveLayout();

    if (isLargeScreenWidth) {
        return (
            <ExpenseReportListItemRowWide
                item={props.item}
                reportActions={props.reportActions}
                showTooltip={props.showTooltip}
                canSelectMultiple={props.canSelectMultiple}
                isActionLoading={props.isActionLoading}
                onButtonPress={props.onButtonPress}
                onCheckboxPress={props.onCheckboxPress}
                containerStyle={props.containerStyle}
                isSelectAllChecked={props.isSelectAllChecked}
                isIndeterminate={props.isIndeterminate}
                isDisabledCheckbox={props.isDisabledCheckbox}
                isHovered={props.isHovered}
                isFocused={props.isFocused}
                isPendingDelete={props.isPendingDelete}
                columns={props.columns}
            />
        );
    }
    return (
        <ExpenseReportListItemRowNarrow
            item={props.item}
            onCheckboxPress={props.onCheckboxPress}
            canSelectMultiple={props.canSelectMultiple}
            isSelectAllChecked={props.isSelectAllChecked}
            isIndeterminate={props.isIndeterminate}
            isDisabledCheckbox={props.isDisabledCheckbox}
        />
    );
}

export default ExpenseReportListItemRow;
