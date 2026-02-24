type ImportPerDiemRatesParams = {
    /** ID of the policy */
    policyID: string;

    /** Custom Unit ID of the per diem unit */
    customUnitID: string;

    /**
     * Stringified JSON object with type of following structure:
     * Array<{
     * customUnitRateID: <Same as name>;
     * name: “Spain”;
     * currency: “EUR”;
     * enabled: true (since we are importing);
     * rate: 0 (since we have subrates);
     * Attributes: [];
     * subRates: An array with each element in the following shape:
     *  id: “66d5ae9a0379d”;
     *  name: “Full Day”;
     *  rate: 3000 (in cents);
     * }>
     */
    customUnitRates: string;
};

export default ImportPerDiemRatesParams;
