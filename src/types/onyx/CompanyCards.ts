/** Model of CompanyCard's Shared NVP record */
// TODO update information here during implementation Add Company Card flow
type CompanyCards = {
    /** Company cards object */
    companyCards: {
        /** Company card info key */
        cdfbmo: CompanyCardInfo;
    };
    /** Company cards nicknames */
    companyCardNicknames: {
        /** Company cards info key */
        cdfbmo: string;
    };
};
/**
 * Model of company card information
 */
type CompanyCardInfo = {
    /** Company card pending state */
    pending: boolean;

    /** Company card asr state */
    asrEnabled: boolean;

    /** Company card force reimbursable value */
    forceReimbursable: string;

    /** Company card liability type */
    liabilityType: string;

    /** Company card preferred policy */
    preferredPolicy: string;

    /** Company card report title format */
    reportTitleFormat: string;

    /** Company card statement period */
    statementPeriodEndDay: string;
};

export default CompanyCards;
