import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type CONST from '@src/CONST';

type SecondaryActionEntry = DropdownOption<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>> & Pick<PopoverMenuItem, 'backButtonText' | 'rightIcon'>;

type MoneyReportHeaderActionsProps = {
    reportID: string | undefined;
    primaryAction: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | ValueOf<typeof CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS> | '';
    /** Style to apply when rendered inline (narrow layout inside HeaderWithBackButton) */
    style?: StyleProp<ViewStyle>;
    isReportInSearch?: boolean;
};

export type {SecondaryActionEntry, MoneyReportHeaderActionsProps};
