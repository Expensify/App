import type {DynamicFormValues} from '@components/DynamicForm/types';
import getContentFields from '@components/DynamicForm/utils/getContentFields';
import {getLoneField, getVisibleContent} from '@components/DynamicForm/utils/getVisibleFields';
import groupContentBySection from '@components/DynamicForm/utils/groupContentBySection';
import FormFields from '@components/Form/Layout/FormFields';
import type {FormValue} from '@components/Form/types';

import useAccessibilityAnnouncement from '@hooks/useAccessibilityAnnouncement';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {DynamicFormContentItem, DynamicFormField, DynamicFormListItem} from '@src/types/onyx';

import React, {useState} from 'react';
import {View} from 'react-native';

import DynamicFormFieldRow from './DynamicFormFieldRow';
import DynamicFormSection from './DynamicFormSection';

type DynamicFormFieldsProps = {
    /** Headings and fields to render, in order. Fields of a type this App version does not know are left out. */
    content: DynamicFormContentItem[];

    /** Current answers, from FormProvider's render-prop `inputValues`, so showWhen and dependsOn follow the user's typing */
    values: DynamicFormValues;

    /** The whole form when `content` is one page of it, since a field's `showWhen` can name a controller on another page */
    allFields?: DynamicFormField[];

    /** The page's headline comes from its lone question, so that question's label is not drawn again above its input. False when the page has its own title, since the label then still says what the inputs are for. */
    isLoneFieldInHeadline?: boolean;

    /** Currency of amount fields that let the user pick none */
    currency?: string;

    /** Largest size of one file, in bytes, for file fields that set none. No limit when not set. */
    maxFileSize?: number;

    /** Called when the user changes a field marked `refreshOnChange`, with the draft key that changed, so the screen can fetch the schema again */
    onRefreshRequirements?: (inputID: string, value: FormValue) => void;

    /** Opens the editor page of a list entry, or of a new one without `itemID`. DynamicFormFlow passes it. Without it, list entries are edited in a modal. */
    onOpenListItemEditor?: (listKey: string, itemID?: string) => void;

    /** Called with a list's entries after the user removes one, so the flow can keep a sensitive list in memory up to date */
    onListItemsChange?: (listKey: string, items: DynamicFormListItem[]) => void;

    /** Every answer here is sensitive, as in the editor of an entry of a sensitive list: none is drafted, and each starts from the answer in `values` */
    isSensitive?: boolean;
};

/** The inputs of a schema-driven form. Render it inside a FormProvider and validate the fields of the same content with getDynamicFieldErrors. */
function DynamicFormFields({
    content,
    values,
    allFields,
    isLoneFieldInHeadline = false,
    currency = CONST.CURRENCY.USD,
    maxFileSize,
    onRefreshRequirements,
    onOpenListItemEditor,
    onListItemsChange,
    isSensitive = false,
}: DynamicFormFieldsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const visibleContent = getVisibleContent(content, values, allFields);
    const visibleFields = getContentFields(visibleContent);
    const loneField = getLoneField(visibleFields);

    // Questions appear and disappear as answers or refreshed requirements change, which a screen reader user can't see, so each change is announced
    const visibleFieldKeys = visibleFields.map((field) => field.key).join(',');
    const [shownFieldKeys, setShownFieldKeys] = useState(visibleFieldKeys);
    const [questionsChangeCount, setQuestionsChangeCount] = useState(0);
    if (shownFieldKeys !== visibleFieldKeys) {
        setShownFieldKeys(visibleFieldKeys);
        setQuestionsChangeCount((count) => count + 1);
    }
    useAccessibilityAnnouncement(translate('dynamicForm.questionsChanged'), questionsChangeCount > 0, {
        shouldAnnounceOnNative: true,
        shouldAnnounceOnWeb: true,
        politeness: 'polite',
        announcementKey: questionsChangeCount,
    });
    const renderFields = (itemFields: DynamicFormField[], itemValues: DynamicFormValues, isItemSensitive: boolean) => (
        <DynamicFormFields
            content={itemFields}
            values={itemValues}
            isSensitive={isItemSensitive}
            currency={currency}
            maxFileSize={maxFileSize}
            onRefreshRequirements={onRefreshRequirements}
        />
    );

    const renderRows = (fields: DynamicFormField[], key?: string) => (
        <FormFields key={key}>
            {fields.map((field) => (
                <DynamicFormFieldRow
                    key={field.key}
                    field={field}
                    values={values}
                    currency={currency}
                    maxFileSize={maxFileSize}
                    isLoneField={field === loneField}
                    shouldHideLabel={isLoneFieldInHeadline && field === loneField}
                    onRefreshRequirements={onRefreshRequirements}
                    onOpenListItemEditor={onOpenListItemEditor}
                    onListItemsChange={onListItemsChange}
                    isSensitive={isSensitive}
                    renderFields={renderFields}
                />
            ))}
        </FormFields>
    );

    const sections = groupContentBySection(visibleContent);
    const [firstSection] = sections;
    if (sections.length === 1 && firstSection && !firstSection.heading) {
        return renderRows(firstSection.fields);
    }

    return (
        <View style={styles.formContent}>
            {sections.map(({heading, fields}) =>
                heading ? (
                    // A heading can share its key with a field, so its section is keyed apart from the rows
                    <DynamicFormSection
                        key={`heading-${heading.key}`}
                        heading={heading}
                    >
                        {fields.length > 0 && renderRows(fields)}
                    </DynamicFormSection>
                ) : (
                    renderRows(fields, 'leading-fields')
                ),
            )}
        </View>
    );
}

export default DynamicFormFields;
export type {DynamicFormFieldsProps};
