import type * as OnyxCommon from './OnyxCommon';

/** Information about export template */
type ExportTemplate = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** The user facing name of the template */
    name: string;

    /** The internal name of the template */
    templateName: string;

    /** Type of the template */
    type: string;

    /** Policy ID of the template */
    policyID: string | undefined;

    /** Description of the template */
    description: string;
}>;

export default ExportTemplate;
