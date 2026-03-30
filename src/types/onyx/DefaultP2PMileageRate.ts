import type {Unit} from './Policy';

/** Model of the default P2P mileage rate fetched from Auth */
type DefaultP2PMileageRate = {
    /** Rate in cents per unit */
    rate: number;

    /** Unit of measurement: 'km' or 'mi' */
    unit: Unit;
};

export default DefaultP2PMileageRate;
