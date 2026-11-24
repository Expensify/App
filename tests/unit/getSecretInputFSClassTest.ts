import getSecretInputFSClass from '@libs/Fullstory/getSecretInputFSClass';

import CONST from '@src/CONST';

describe('getSecretInputFSClass', () => {
    it.each([
        [undefined, true, CONST.FULLSTORY.CLASS.MASK],
        [CONST.FULLSTORY.CLASS.EXCLUDE, true, CONST.FULLSTORY.CLASS.EXCLUDE],
        [undefined, false, undefined],
        [CONST.FULLSTORY.CLASS.UNMASK, false, CONST.FULLSTORY.CLASS.UNMASK],
    ] as const)('should resolve a passed class of %s with secret %s to %s', (forwardedFSClass, isDeclaredSecret, expected) => {
        // Given an input's passed class and whether it was declared secret, which both BaseTextInput implementations hand over
        // When the class is worked out
        const result = getSecretInputFSClass(forwardedFSClass, isDeclaredSecret);

        // Then a secret input is masked unless the caller chose a class, and other inputs keep what they were given
        expect(result).toBe(expected);
    });
});
