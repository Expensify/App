/**
 * Draft data persisted for odometer "save for later" flow.
 */
type OdometerDraft = {
    /** Draft start reading */
    odometerStartReading?: number;

    /** Draft end reading */
    odometerEndReading?: number;

    /** Draft start image as base64 (web) or file URI (native) */
    odometerStartImage?: string;

    /** Draft end image as base64 (web) or file URI (native) */
    odometerEndImage?: string;

    /** `lastModified` of the start image, preserved so the re-minted image keeps its identity (getOdometerImageIdentity) */
    odometerStartImageLastModified?: number;

    /** `lastModified` of the end image, preserved so the re-minted image keeps its identity (getOdometerImageIdentity) */
    odometerEndImageLastModified?: number;
};

export default OdometerDraft;
