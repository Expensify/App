import type {DynamicFormFieldType} from '@src/types/onyx';

import type {DynamicFieldContext, DynamicFieldInput, DynamicFieldInputProps, DynamicFieldRenderer, DynamicFieldRendererMap} from './renderers/types';
import type {DynamicFormFieldOfType} from './types';

import renderAddress from './renderers/addressRenderer';
import CHOICE_RENDERERS from './renderers/choiceRenderers';
import renderFile from './renderers/fileRenderer';
import TEXT_RENDERERS from './renderers/textRenderers';

const RENDERERS: DynamicFieldRendererMap = {
    ...TEXT_RENDERERS,
    ...CHOICE_RENDERERS,
    address: renderAddress,
    file: renderFile,
};

/** The input for one field, and how the renderer lays it out */
function renderDynamicField<TType extends DynamicFormFieldType>(field: DynamicFormFieldOfType<TType>, context: DynamicFieldContext, inputProps: DynamicFieldInputProps): DynamicFieldInput {
    const render: DynamicFieldRenderer<TType> = RENDERERS[field.type];
    return render(field, context, inputProps);
}

export default renderDynamicField;
