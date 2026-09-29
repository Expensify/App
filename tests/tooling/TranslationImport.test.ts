import {describe, expect, it} from 'bun:test';

import CONST from '@src/CONST';
import en from '@src/languages/en';

describe('translation imports', () => {
    it('loads real translations with Bun-safe CONST defaults', () => {
        expect(CONST.NEW_EXPENSIFY_URL).toBe('https://new.expensify.com/');
        expect(en.multifactorAuthentication.unsupportedDevice.pleaseUseWebApp).toContain(`href="${CONST.NEW_EXPENSIFY_URL}"`);
    });
});
