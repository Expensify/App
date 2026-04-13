import type {ValueOf} from 'type-fest';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import type CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';

type SecondaryActionEntry = DropdownOption<ValueOf<typeof CONST.REPORT.SECONDARY_ACTIONS>> & Pick<PopoverMenuItem, 'backButtonText' | 'rightIcon'>;

type MoneyReportHeaderActionsProps = {
    reportID: string | undefined;
    primaryAction: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | ValueOf<typeof CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS> | '';
    isReportInSearch?: boolean;
    backTo?: Route;
};

export type {SecondaryActionEntry, MoneyReportHeaderActionsProps};
