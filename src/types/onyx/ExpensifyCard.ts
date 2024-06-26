import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import PersonalDetails from '@src/types/onyx/PersonalDetails';

// TODO: specify correct type when API is updated
type ExpensifyCard = OnyxCommon.OnyxValueWithOfflineFeedback<{cardholder: PersonalDetails; errors?: OnyxCommon.Errors} & Record<string, unknown>>;

type ExpensifyCardsList = Record<string, ExpensifyCard>;

export default ExpensifyCard;
export type {ExpensifyCardsList};
