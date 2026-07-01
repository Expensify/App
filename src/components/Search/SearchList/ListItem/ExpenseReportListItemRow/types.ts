import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ExpenseReportListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchColumnType} from '@components/Search/types';
import type {Report, ReportAction} from '@src/types/onyx';

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
    shouldDisableActionPointerEvents?: boolean;
    columns?: SearchColumnType[];
    isMarkAsDone: boolean;
};

type ExpenseReportListItemRowProps = ExpenseReportListItemRowWideProps;

export type {ExpenseReportListItemRowProps, ExpenseReportListItemRowNarrowProps, ExpenseReportListItemRowWideProps};
