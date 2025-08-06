import type * as OnyxCommon from './OnyxCommon';

/** Information about integration server export templates */
type IntegrationServerExportTemplate = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Name of the template */
    name: string;
}>;

export default IntegrationServerExportTemplate;
