import type {StyleProp, ViewStyle} from 'react-native';
import type {ExpenseReportListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchColumnType} from '@components/Search/types';
import type {Report, ReportAction} from '@src/types/onyx';
import type {OnyxEntry} from 'react-native-onyx';

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
    chatReport?: OnyxEntry<Report>;
    containerStyle?: StyleProp<ViewStyle>;
    isHovered?: boolean;
    isFocused?: boolean;
    isPendingDelete?: boolean;
    columns?: SearchColumnType[];
};

type ExpenseReportListItemRowProps = ExpenseReportListItemRowWideProps;

export type {ExpenseReportListItemRowProps, ExpenseReportListItemRowNarrowProps, ExpenseReportListItemRowWideProps};
