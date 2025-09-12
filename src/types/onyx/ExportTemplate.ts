import type * as OnyxCommon from './OnyxCommon';

/** Information about export template */
type ExportTemplate = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Name of the template */
    name: string;
}>;

export default ExportTemplate;
