/** Only Android needs a separate scroll when the keyboard reopens without a new input focus event. */
import noop from 'lodash/noop';

import type UseScrollOnKeyboardReopen from './types';

const useScrollOnKeyboardReopen: UseScrollOnKeyboardReopen = () => noop;

export default useScrollOnKeyboardReopen;
