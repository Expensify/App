import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {ExpenseReportListItemType, TransactionListItemType} from '@components/SelectionListWithSections/types';

type ReportSearchHeaderProps = {
    /** Report, if we're showing the details for one and using AvatarWithDisplay */
    report?: ExpenseReportListItemType;

    /** Additional styles to add to the component */
    style?: StyleProp<ViewStyle>;

    /** Transactions inside report */
    transactions?: TransactionListItemType[];

    /** Color of the secondary avatar border, usually should match the container background */
    avatarBorderColor?: ColorValue;
};

export default ReportSearchHeaderProps;
