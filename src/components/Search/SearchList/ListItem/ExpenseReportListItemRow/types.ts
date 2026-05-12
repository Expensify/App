import type {StyleProp, ViewStyle} from 'react-native';
import type {ExpenseReportListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchColumnType} from '@components/Search/types';
import type {ReportAction} from '@src/types/onyx';

type ExpenseReportListItemRowNarrowProps = {
    item: ExpenseReportListItemType;
    canSelectMultiple?: boolean;
    onCheckboxPress?: () => void;
    isSelectAllChecked?: boolean;
    isIndeterminate?: boolean;
    isDisabledCheckbox?: boolean;
};

type ExpenseReportListItemRowWideProps = ExpenseReportListItemRowNarrowProps & {
    reportActions?: ReportAction[];
    showTooltip: boolean;
    isActionLoading?: boolean;
    onButtonPress?: () => void;
    containerStyle?: StyleProp<ViewStyle>;
    isHovered?: boolean;
    isFocused?: boolean;
    isPendingDelete?: boolean;
    columns?: SearchColumnType[];
};

type ExpenseReportListItemRowProps = ExpenseReportListItemRowWideProps;

export type {ExpenseReportListItemRowProps, ExpenseReportListItemRowNarrowProps, ExpenseReportListItemRowWideProps};
