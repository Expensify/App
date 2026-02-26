import type * as OnyxTypes from '@src/types/onyx';

type ActionRendererProps = {
    /** The report action to render */
    action: OnyxTypes.ReportAction;

    /** The report ID this action belongs to */
    reportID: string | undefined;
};

export default ActionRendererProps;
