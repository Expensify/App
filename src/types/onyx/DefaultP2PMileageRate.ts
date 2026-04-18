/** Default P2P mileage rate fetched from Auth for the user's reporting currency */
type DefaultP2PMileageRate = {
    /** Rate in cents per unit (e.g. 6700 = $0.67/mile) */
    rate: number;

    /** Distance unit: "mi" or "km" */
    unit: string;
};

export default DefaultP2PMileageRate;
