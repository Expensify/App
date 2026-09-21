import type {ValidInputs} from '@components/Form/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import type {DynamicFormField} from '@src/types/onyx';

import type {ReactNode} from 'react';

/** The current answers of a dynamic form, keyed by field key; the shape FormProvider hands to its children */
type DynamicFormValues = Record<string, unknown>;

type DynamicFieldContext = {
    values: DynamicFormValues;
    translate: LocalizedTranslate;

    /** Currency for amount fields when the form has no `currency` answer */
    currency?: string;

    /** The field is the only one on its page, so choice inputs present as the page instead of as a row */
    isAloneOnPage?: boolean;

    /** Renders a nested set of fields, so a list item's editor reuses the renderer without importing it */
    renderFields: (fields: DynamicFormField[], values: DynamicFormValues) => ReactNode;

    /** Opens the flow's editor page for a list item; absent when the page has no flow, so the list uses a modal */
    openListItemEditor?: (fieldKey: string, itemID?: string) => void;
};

type DynamicFieldInput = {
    InputComponent: ValidInputs;

    /** Props derived from the field, spread onto InputWrapper after the common ones */
    inputProps: Record<string, unknown>;

    /** Rendered edge to edge like a menu row instead of inside the page padding */
    isMenuRow?: boolean;

    /** The component has no label of its own, so the renderer draws the field label above it */
    shouldRenderLabelAbove?: boolean;

    /** Draw the label above as a body-text question prompt, as SingleChoiceQuestion does, instead of a form label */
    isLabelAboveQuestion?: boolean;
};

type DynamicFieldFactory = (field: DynamicFormField, context: DynamicFieldContext) => DynamicFieldInput;

export type {DynamicFieldContext, DynamicFieldFactory, DynamicFieldInput, DynamicFormValues};
