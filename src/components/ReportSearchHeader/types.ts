import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {TransactionListItemType} from '@components/SelectionListWithSections/types';
import type {PersonalDetailsList, Report} from '@src/types/onyx';

type ReportSearchHeaderProps = {
    /** Report, if we're showing the details for one and using AvatarWithDisplay */
    report?: OnyxEntry<Report>;

    /** Additional styles to add to the component */
    style?: StyleProp<ViewStyle>;

    /** Transactions inside report */
    transactions?: TransactionListItemType[];

    /** Color of the secondary avatar border, usually should match the container background */
    avatarBorderColor?: ColorValue;

    /** Optional personal details list to use instead of the global collection */
    personalDetailsList?: PersonalDetailsList;
};

export default ReportSearchHeaderProps;
