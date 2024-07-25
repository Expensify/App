type MarkAsExportedParams = {
    markedManually: boolean;
    /**
     * Stringified JSON object with type of following structure:
     * {
     *   reportID: number;
     *   label: string;
     *   optimisticReportActionID: string;
     * }>
     */
    data: string;
};

export default MarkAsExportedParams;
