import type Card from './Card';
import type * as OnyxCommon from './OnyxCommon';
import type PersonalDetails from './PersonalDetails';

/** Model of an Expensify card */
type ExpensifyCard = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Cardholder personal details */
    cardholder: PersonalDetails;

    /** Card related error messages */
    errors?: OnyxCommon.Errors;

    /** The last four digits of the card */
    lastFourPAN: string;

    /** Card name */
    name: string;

    /** Card limit */
    limit: number;
}>;

/** List of Expensify cards */
type ExpensifyCardsList = Record<string, Card>;

export default ExpensifyCard;
export type {ExpensifyCardsList};
