import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

import allFieldTypes from '../fixtures/dynamicForm/allFieldTypes';
import {expectSchemaRenders, flattenFields} from '../utils/dynamicFormCoverage';

describe('DynamicForm coverage', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.DEFAULT);
    });

    it('maps every field in the type fixture to a registered input', () => {
        expectSchemaRenders(allFieldTypes);
    });

    it('has a fixture field for every type in the contract', () => {
        const covered = new Set(flattenFields(allFieldTypes).map((field) => field.type));
        expect([...covered].sort()).toEqual(['address', 'amount', 'boolean', 'country', 'date', 'file', 'list', 'multiselect', 'percent', 'radio', 'select', 'text']);
    });
});
