import type {Unit} from './Policy';

/** Model of a default mileage rate fetched from the backend */
type DefaultMileageRate = {
    /** Rate in cents per unit */
    rate: number;

    /** Unit of measurement: 'km' or 'mi' */
    unit: Unit;
};

export default DefaultMileageRate;
