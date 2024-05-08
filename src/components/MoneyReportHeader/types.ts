import type {OnyxEntry} from 'react-native-onyx';
import type * as OnyxTypes from '@src/types/onyx';

type MoneyReportHeaderOnyxProps = {
    /** The transaction thread report associated with the current report, if any */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
};

type MoneyReportHeaderProps = MoneyReportHeaderOnyxProps & {
    /** The report currently being looked at */
    report: OnyxTypes.Report;

    /** The policy tied to the expense report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Array of report actions for the report */
    reportActions: OnyxTypes.ReportAction[];

    /** The reportID of the transaction thread report associated with this current report, if any */
    // eslint-disable-next-line react/no-unused-prop-types
    transactionThreadReportID?: string | null;

    /** Whether we should display the header as in narrow layout */
    shouldUseNarrowLayout?: boolean;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: () => void;
};

type MoneyReportHeaderContentOnyxProps = {
    /** The chat report this report is linked to */
    chatReport: OnyxEntry<OnyxTypes.Report>;

    /** The next step for the report */
    nextStep: OnyxEntry<OnyxTypes.ReportNextStep>;

    /** Session info for the currently logged in user. */
    session: OnyxEntry<OnyxTypes.Session>;

    /** The transaction data of the transaction thread report */
    requestTransaction: OnyxEntry<OnyxTypes.Transaction>;
};

type MoneyReportHeaderContentProps = MoneyReportHeaderProps &
    MoneyReportHeaderContentOnyxProps & {
        /** The parent report action of the transaction thread report */
        requestParentReportAction: OnyxEntry<OnyxTypes.ReportAction> | undefined;
    };

export type {MoneyReportHeaderProps, MoneyReportHeaderOnyxProps, MoneyReportHeaderContentProps, MoneyReportHeaderContentOnyxProps};
