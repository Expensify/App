type SearchFlightsParams = {
    policyID: string;

    /** JSON array of FlightSearchLeg */
    legs: string;

    /** JSON object of FlightSearchFilters */
    filters: string;

    /** The previous leg's searchID, empty for the first leg */
    searchID: string;

    /** The fare picked on the previous leg, empty for the first leg */
    selectedFareID: string;
    legIndex: number;

    /** Every flight instead of an express search, which can return only nonstops on a busy route */
    shouldShowAllFlights: boolean;
};

export default SearchFlightsParams;
