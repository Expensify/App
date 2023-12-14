type PolicyReportFieldType = "text" | "date" | "dropdown";

type PolicyReportField = {
    /** Name of the field */
    name: string;

    /** Default value assigned to the field */
    defaultValue: string;

    /** Unique id of the field */
    fieldId: string;

    /** Position at which the field should show up relative to the other fields */
    orderWeight: number;

    /** Type of report field */
    type: PolicyReportFieldType;
};

type PolicyReportFields = Record<string, PolicyReportField>;
export default PolicyReportField;
export type {PolicyReportFields};
