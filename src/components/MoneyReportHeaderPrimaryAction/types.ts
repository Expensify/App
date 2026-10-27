import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type MoneyReportHeaderPrimaryActionProps = {
    reportID: string | undefined;
    chatReportID: string | undefined;
    primaryAction: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | ValueOf<typeof CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS> | '';
    onExportModalOpen: () => void;

    /** Whether the primary action is disabled, e.g. while expenses are selected */
    isDisabled?: boolean;
};

type SimpleActionProps = {
    reportID: string | undefined;
    chatReportID: string | undefined;

    /** Whether the primary action is disabled, e.g. while expenses are selected */
    isDisabled?: boolean;
};

export type {MoneyReportHeaderPrimaryActionProps, SimpleActionProps};
