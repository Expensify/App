import type {DynamicFormValues} from '@components/DynamicForm/types';
import getContentFields from '@components/DynamicForm/utils/getContentFields';

import type {DynamicFormPage} from '@src/types/onyx';

/** A page's answers without its file fields, whose files are uploaded rather than sent as answers. The rest keep their draft keys, such as `address.city`, which the server stores as sent. */
function toWiseOnboardingInputs(page: DynamicFormPage, answers: DynamicFormValues): Record<string, unknown> {
    const fileKeys = new Set(
        getContentFields(page.content)
            .filter((field) => field.type === 'file')
            .map((field) => field.key),
    );
    return Object.fromEntries(Object.entries(answers).filter(([key]) => !fileKeys.has(key)));
}

export default toWiseOnboardingInputs;
