import type {DynamicFormValues} from '@components/DynamicForm/types';
import getAddressInputKeys from '@components/DynamicForm/utils/getAddressInputKeys';
import getContentFields from '@components/DynamicForm/utils/getContentFields';
import isSupportedField from '@components/DynamicForm/utils/isSupportedField';

import type {DynamicFormPage} from '@src/types/onyx';

/**
 * A page's answers under the names the server stores them by. An address is one set of draft keys per part, `address`, `address.city` and so on, which the server
 * names `addressStreet`, `addressCity` and so on. File fields are left out, since their files are uploaded with the page rather than sent as answers.
 */
function toWiseOnboardingInputs(page: DynamicFormPage, answers: DynamicFormValues): Record<string, unknown> {
    const inputs: Record<string, unknown> = {};
    for (const field of getContentFields(page.content).filter(isSupportedField)) {
        if (field.type === 'file') {
            continue;
        }
        if (field.type === 'address') {
            const keys = getAddressInputKeys(field.key);
            inputs[`${field.key}Street`] = answers[keys.street];
            inputs[`${field.key}City`] = answers[keys.city];
            inputs[`${field.key}State`] = answers[keys.state];
            inputs[`${field.key}ZipCode`] = answers[keys.zipCode];
            inputs[`${field.key}Country`] = answers[keys.country];
            continue;
        }
        if (answers[field.key] !== undefined) {
            inputs[field.key] = answers[field.key];
        }
    }
    return inputs;
}

export default toWiseOnboardingInputs;
