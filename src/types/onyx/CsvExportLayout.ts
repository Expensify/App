import type * as OnyxCommon from './OnyxCommon';

/** Information about account level in-app export templates */
type CsvExportLayout = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Name of the template */
    name: string;
}>;

export default CsvExportLayout;
