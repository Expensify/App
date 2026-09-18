import getInputComponentForField from '@components/DynamicForm/getInputComponentForField';
import type {DynamicFieldContext} from '@components/DynamicForm/types';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {DynamicFormField} from '@src/types/onyx';

import allFieldTypes from '../fixtures/dynamicForm/allFieldTypes';
import accountRequirements from '../fixtures/wise/accountRequirements';
import businessProfile from '../fixtures/wise/businessProfile';
import kycRequirementTypes from '../fixtures/wise/kycRequirementTypes';
import {translateLocal} from '../utils/TestHelper';

/** Every field a schema declares, including the fields inside list items */
function flattenFields(fields: DynamicFormField[]): DynamicFormField[] {
    return fields.flatMap((field) => [field, ...flattenFields(field.itemFields ?? [])]);
}

const context: DynamicFieldContext = {values: {}, translate: translateLocal, renderFields: () => null};

const schemaSources: Array<[string, DynamicFormField[]]> = [
    ['generic type fixture', allFieldTypes],
    ...Object.entries(accountRequirements).map(([corridor, fields]): [string, DynamicFormField[]] => [`account requirements ${corridor}`, fields]),
    ...Object.entries(kycRequirementTypes).map(([key, fields]): [string, DynamicFormField[]] => [`KYC ${key}`, fields]),
    ['business profile intake', businessProfile],
];

describe('DynamicForm coverage', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.DEFAULT);
    });

    it('covers all 31 Wise KYC requirement types', () => {
        expect(Object.keys(kycRequirementTypes)).toHaveLength(31);
    });

    it.each(schemaSources)('maps every field in %s to a registered input', (_name, fields) => {
        for (const field of flattenFields(fields)) {
            const {InputComponent} = getInputComponentForField(field, {...context, isAloneOnPage: false});
            expect(typeof InputComponent === 'function' || typeof InputComponent === 'object').toBe(true);
        }
    });

    it('has a fixture field for every type in the contract', () => {
        const covered = new Set(schemaSources.flatMap(([, fields]) => flattenFields(fields).map((field) => field.type)));
        expect([...covered].sort()).toEqual(['address', 'amount', 'boolean', 'country', 'date', 'file', 'list', 'multiselect', 'percent', 'radio', 'select', 'text']);
    });
});
