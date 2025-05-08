import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {TransactionListItemType} from '@components/SelectionList/types';
import type {Policy, Report} from '@src/types/onyx';

type ReportSearchHeaderProps = {
    /** Report, if we're showing the details for one and using AvatarWithDisplay */
    report?: OnyxEntry<Report>;

    /** The report's policy, if we're showing the details for a report and need info about it for AvatarWithDisplay */
    policy?: OnyxEntry<Policy>;

    /** Additional styles to add to the component */
    style?: StyleProp<ViewStyle>;

    /** Transactions inside report */
    transactions?: TransactionListItemType[];
};

export default ReportSearchHeaderProps;
