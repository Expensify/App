import type {DynamicFormValues} from '@components/DynamicForm/types';
import getContentFields from '@components/DynamicForm/utils/getContentFields';
import {getLoneField, getVisibleContent} from '@components/DynamicForm/utils/getVisibleFields';
import isHeading from '@components/DynamicForm/utils/isHeading';
import type {FormValue} from '@components/Form/types';

import CONST from '@src/CONST';
import type {DynamicFormContentItem, DynamicFormField} from '@src/types/onyx';

import React from 'react';

import DynamicFormFieldRow from './DynamicFormFieldRow';
import DynamicFormHeadingRow from './DynamicFormHeadingRow';

type DynamicFormFieldsProps = {
    /** Headings and fields to render, in order. Fields of a type this App version does not know are left out. */
    content: DynamicFormContentItem[];

    /** Current answers, from FormProvider's render-prop `inputValues`, so showWhen and dependsOn follow the user's typing */
    values: DynamicFormValues;

    /** The whole form when `content` is one page of it, since a field's `showWhen` can name a controller on another page */
    allFields?: DynamicFormField[];

    /** The page's title is that question's label, so the label is not drawn again above its input. False when the page has its own title, since the label then still says what the inputs are for. */
    isTitledByPage?: boolean;

    /** Currency of amount fields that let the user pick none */
    currency?: string;

    /** Largest size of one file, in bytes, for file fields that set none. No limit when not set. */
    maxFileSize?: number;

    /** Called when the user changes a field marked `refreshOnChange`, with the draft key that changed, so the screen can fetch the schema again */
    onRefreshRequirements?: (inputID: string, value: FormValue) => void;
};

/** The inputs of a schema-driven form. Render it inside a FormProvider and validate the fields of the same content with getDynamicFieldErrors. */
function DynamicFormFields({content, values, allFields, isTitledByPage = false, currency = CONST.CURRENCY.USD, maxFileSize, onRefreshRequirements}: DynamicFormFieldsProps) {
    const visibleContent = getVisibleContent(content, values, allFields);
    const loneField = getLoneField(getContentFields(visibleContent));

    return visibleContent.map((item, index) =>
        isHeading(item) ? (
            <DynamicFormHeadingRow
                key={`heading-${item.key}`}
                heading={item}
                isFirst={index === 0}
            />
        ) : (
            <DynamicFormFieldRow
                key={item.key}
                field={item}
                values={values}
                currency={currency}
                maxFileSize={maxFileSize}
                isLoneField={item === loneField}
                shouldHideLabel={isTitledByPage && item === loneField}
                onRefreshRequirements={onRefreshRequirements}
            />
        ),
    );
}

export default DynamicFormFields;
export type {DynamicFormFieldsProps};
