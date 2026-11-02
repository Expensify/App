import type {DynamicFormFieldsProps} from '@components/DynamicForm/components/DynamicFormFields';
import type {DynamicFormFieldOfType, DynamicFormValues} from '@components/DynamicForm/types';
import type {FormValue, InputComponentBaseProps} from '@components/Form/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import type {ThemeStyles} from '@src/styles';
import type {DynamicFormField, DynamicFormFieldType, DynamicFormListItem} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

import type {ReactElement, ReactNode} from 'react';

type DynamicFieldContext = Pick<DynamicFormFieldsProps, 'values' | 'maxFileSize' | 'onOpenListItemEditor' | 'onListItemsChange' | 'isSensitive'> &
    Required<Pick<DynamicFormFieldsProps, 'currency'>> & {
        translate: LocalizedTranslate;
        styles: ThemeStyles;

        /** The field is the page's only question, so a choice is drawn as the page itself instead of as a row */
        isLoneField: boolean;

        /** Draws a list entry's fields in the modal editor used outside DynamicFormFlow */
        renderFields: (fields: DynamicFormField[], values: DynamicFormValues, isSensitive: boolean) => ReactNode;
    };

/** The answer each field type's input holds. An address holds its street, and its other parts sit under their own keys. */
type DynamicFieldAnswerMap = {
    text: string;
    number: string;
    select: string;
    radio: string;
    multiselect: string[];
    date: string;
    address: string;
    file: FileObject[];
    amount: string;
    country: string;
    countryMultiselect: string[];
    boolean: boolean;
    currency: string;
    percent: string;
    list: DynamicFormListItem[];
};

/** Props every input gets from the renderer */
type DynamicFieldInputProps<TAnswer extends FormValue = FormValue> = Required<ForwardedFSClassProps> &
    Required<Pick<InputComponentBaseProps, 'inputID' | 'shouldSaveDraft'>> &
    Pick<InputComponentBaseProps, 'onValueChange'> & {
        onBlur?: () => void;

        /** A sensitive answer is not drafted, so the input starts from the answer the flow keeps in memory */
        defaultValue?: TAnswer;
    };

type DynamicFieldInput = {
    /** The form input drawn for the field */
    input: ReactElement;

    /** Spans the page edge to edge like a menu row, instead of sitting inside the page padding */
    isMenuRow: boolean;

    /** The input has no label of its own, so the renderer draws the field label above it, as a question prompt or as a bold heading */
    labelAbove?: 'prompt' | 'heading';

    /** The input shows the field description itself, so the renderer does not draw it */
    showsDescription?: boolean;
};

type DynamicFieldRenderer<TType extends DynamicFormFieldType> = (
    field: DynamicFormFieldOfType<TType>,
    context: DynamicFieldContext,
    inputProps: DynamicFieldInputProps<DynamicFieldAnswerMap[TType]>,
) => DynamicFieldInput;

/** One renderer per field type, so typecheck fails when a type has none */
type DynamicFieldRendererMap = {[TType in DynamicFormFieldType]: DynamicFieldRenderer<TType>};

export type {DynamicFieldAnswerMap, DynamicFieldContext, DynamicFieldInput, DynamicFieldInputProps, DynamicFieldRenderer, DynamicFieldRendererMap};
