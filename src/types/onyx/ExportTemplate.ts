import type * as OnyxCommon from './OnyxCommon';

/** Information about export template */
type ExportTemplate = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** The user facing name of the template */
    name: string;

    /** The internal name of the template */
    templateName: string;

    type: string;

    policyID: string | undefined;

    description: string;
}>;

export default ExportTemplate;
