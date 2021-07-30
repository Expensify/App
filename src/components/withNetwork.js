import ONYXKEYS from '../ONYXKEYS';
import createOnyxContext from './createOnyxContext';

const context = createOnyxContext(ONYXKEYS.NETWORK);
export const NetworkProvider = context.Provider;
export default context.withOnyxKey;
