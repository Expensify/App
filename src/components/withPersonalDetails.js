import ONYXKEYS from '../ONYXKEYS';
import createOnyxContext from './createOnyxContext';

const context = createOnyxContext(ONYXKEYS.PERSONAL_DETAILS);
export const PersonalDetailsProvider = context.Provider;
export default context.withOnyxKey;
