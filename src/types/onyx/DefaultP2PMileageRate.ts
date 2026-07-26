import type {Unit} from './Policy';

/** Default P2P mileage rate fetched from Auth for the user's personal policy outputCurrency (default / report currency) */
type DefaultP2PMileageRate = {
    /** Rate in cents per unit (e.g. 67 = $0.67/mile) */
    rate: number;

    /** Distance unit: "mi" or "km" */
    unit: Unit;
};

export default DefaultP2PMileageRate;
