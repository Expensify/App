import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

import kycRequirementTypes from '../fixtures/wise/kycRequirementTypes';
import {expectSchemaRenders} from '../utils/dynamicFormCoverage';

describe('Wise KYC requirement schemas', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.DEFAULT);
    });

    it('covers all 31 Wise KYC requirement types', () => {
        expect(Object.keys(kycRequirementTypes)).toHaveLength(31);
    });

    it.each(Object.entries(kycRequirementTypes))('renders every field of %s', (_key, fields) => {
        expectSchemaRenders(fields);
    });
});
