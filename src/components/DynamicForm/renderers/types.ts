import type {DynamicFormFieldsProps} from '@components/DynamicForm/components/DynamicFormFields';
import type {DynamicFormFieldOfType} from '@components/DynamicForm/types';
import type {InputComponentBaseProps} from '@components/Form/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import type {ThemeStyles} from '@src/styles';
import type {DynamicFormFieldType} from '@src/types/onyx';

import type {ReactElement} from 'react';

type DynamicFieldContext = Pick<DynamicFormFieldsProps, 'values' | 'onOpenListItemEditor'> &
    Required<Pick<DynamicFormFieldsProps, 'currency'>> & {
        translate: LocalizedTranslate;
        styles: ThemeStyles;

        /** The field is the page's only question, so a choice is drawn as the page itself instead of as a row */
        isLoneField: boolean;
    };

/** Props every input gets from the renderer */
type DynamicFieldInputProps = Required<ForwardedFSClassProps> &
    Required<Pick<InputComponentBaseProps, 'inputID' | 'shouldSaveDraft'>> &
    Pick<InputComponentBaseProps, 'onValueChange'> & {
        onBlur?: () => void;
    };

type DynamicFieldInput = {
    input: ReactElement;

    /** Spans the page edge to edge like a menu row, instead of sitting inside the page padding */
    isMenuRow: boolean;

    /** The input has no label of its own, so the renderer draws the field label above it, as a question prompt or as a bold heading */
    labelAbove?: 'prompt' | 'heading';

    /** The input shows the field description itself, so the renderer does not draw it */
    showsDescription?: boolean;
};

type DynamicFieldRenderer<TType extends DynamicFormFieldType> = (field: DynamicFormFieldOfType<TType>, context: DynamicFieldContext, inputProps: DynamicFieldInputProps) => DynamicFieldInput;

/** One renderer per field type, so typecheck fails when a type has none */
type DynamicFieldRendererMap = {[TType in DynamicFormFieldType]: DynamicFieldRenderer<TType>};

export type {DynamicFieldContext, DynamicFieldInput, DynamicFieldInputProps, DynamicFieldRenderer, DynamicFieldRendererMap};
