const SPEND_RULES = {
    CATEGORIES: {
        AIRLINES: 'airlines',
        ALCOHOL_AND_BARS: 'alcoholAndBars',
        AMAZON_AND_BOOKSTORES: 'amazonAndBookstores',
        AUTOMOTIVE: 'automotive',
        CAR_RENTALS: 'carRentals',
        DINING: 'dining',
        FUEL_AND_GAS: 'fuelAndGas',
        GOVERNMENT_AND_NON_PROFITS: 'governmentAndNonProfits',
        GROCERIES: 'groceries',
        GYMS_AND_FITNESS: 'gymsAndFitness',
        HEALTHCARE: 'healthcare',
        HOTELS: 'hotels',
        INTERNET_AND_PHONE: 'internetAndPhone',
        OFFICE_SUPPLIES: 'officeSupplies',
        PARKING_AND_TOLLS: 'parkingAndTolls',
        PROFESSIONAL_SERVICES: 'professionalServices',
        RETAIL: 'retail',
        SHIPPING_AND_DELIVERY: 'shippingAndDelivery',
        SOFTWARE: 'software',
        TRANSIT_AND_RIDESHARE: 'transitAndRideshare',
        TRAVEL_AGENCIES: 'travelAgencies',
    },
    ACTION: {
        ALLOW: 'allow',
        BLOCK: 'block',
    },
} as const;

// eslint-disable-next-line import/prefer-default-export -- Preserve the named API used by the extracted CONST module.
export {SPEND_RULES};
