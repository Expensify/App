import getInputComponentForField from '@components/DynamicForm/getInputComponentForField';
import type {DynamicFieldContext} from '@components/DynamicForm/types';

import type {DynamicFormField} from '@src/types/onyx';

import {translateLocal} from './TestHelper';

/** Every field a schema declares, including the fields inside list items */
function flattenFields(fields: DynamicFormField[]): DynamicFormField[] {
    return fields.flatMap((field) => [field, ...flattenFields(field.itemFields ?? [])]);
}

const context: DynamicFieldContext = {values: {}, translate: translateLocal, renderFields: () => null, isAloneOnPage: false};

/** Asserts every field in a schema, nested ones included, maps to a registered input; a new server shape fails here first */
function expectSchemaRenders(fields: DynamicFormField[]) {
    for (const field of flattenFields(fields)) {
        const {InputComponent} = getInputComponentForField(field, context);
        expect(typeof InputComponent === 'function' || typeof InputComponent === 'object').toBe(true);
    }
}

export {expectSchemaRenders, flattenFields};
