import FSClassContext from '@components/FSClassView/FSClassContext';

import isSensitiveInput from '@libs/Fullstory/isSensitiveInput';
import type {SensitiveInputHints} from '@libs/Fullstory/isSensitiveInput';
import type {FSClass} from '@libs/Fullstory/types';

import CONST from '@src/CONST';

import {useContext} from 'react';

/**
 * The FullStory class a text input sets on itself. A class passed to the input wins. Otherwise inputs whose autofill
 * hints mark them as sensitive are masked, and the rest follow the closest `FSClassView`, unmasked when there is none.
 */
function useInputFSClass(forwardedFSClass: FSClass | undefined, hints: SensitiveInputHints): FSClass {
    const containerFSClass = useContext(FSClassContext);

    if (forwardedFSClass) {
        return forwardedFSClass;
    }

    if (isSensitiveInput(hints)) {
        return CONST.FULLSTORY.CLASS.MASK;
    }

    return containerFSClass ?? CONST.FULLSTORY.CLASS.UNMASK;
}

export default useInputFSClass;
