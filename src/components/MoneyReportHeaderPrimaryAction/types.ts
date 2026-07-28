import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type MoneyReportHeaderPrimaryActionProps = {
    reportID: string | undefined;
    chatReportID: string | undefined;
    primaryAction: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | ValueOf<typeof CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS> | '';
    onExportModalOpen: () => void;
};

type SimpleActionProps = {
    reportID: string | undefined;
    chatReportID: string | undefined;
};

export type {MoneyReportHeaderPrimaryActionProps, SimpleActionProps};
