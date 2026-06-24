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
};

export default OdometerDraft;
