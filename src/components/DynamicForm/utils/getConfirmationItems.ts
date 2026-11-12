import type {DynamicFormValues} from '@components/DynamicForm/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {SummaryGroup, SummaryGroupRow} from '@components/SubStepForms/ConfirmationStep';

import {getLetterAvatarURLForName} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import type {DynamicFormField, DynamicFormListField, DynamicFormPage} from '@src/types/onyx';

import noop from 'lodash/noop';

import formatDynamicFieldValue from './formatDynamicFieldValue';
import getAddressInputKeys from './getAddressInputKeys';
import getContentFields from './getContentFields';
import {getFieldLabel} from './getLocalizedText';
import {getPageSectionName, isPageShown} from './getPageTitle';
import getVisibleFields from './getVisibleFields';
import hasProvidedAnswer from './hasProvidedAnswer';
import isSensitiveField from './isSensitiveField';
import isSupportedField from './isSupportedField';
import {getListItems} from './listItems';
import maskSensitiveValue, {getVisibleEnding} from './maskSensitiveValue';
import {getAllFields} from './paginate';
import summarizeListItem, {getListItemFallbackTitle} from './summarizeListItem';

/** One avatar row per list entry, which opens the entry. A readonly list gets plain rows that open nothing. */
function getListItemRows(
    field: DynamicFormListField,
    values: DynamicFormValues,
    translate: LocalizedTranslate,
    onEditListItem: (listKey: string, itemID: string) => void,
): SummaryGroupRow[] {
    return getListItems(values[field.key]).map((item, index): SummaryGroupRow => {
        const {title, description} = summarizeListItem(item, field.itemFields, translate, getListItemFallbackTitle(field, index, translate));
        if (field.readonly) {
            return {id: `${field.key}-${item.id}`, title, description, shouldShowRightIcon: false, onPress: noop, interactive: false};
        }
        return {
            kind: 'avatar',
            id: `${field.key}-${item.id}`,
            title,
            description,
            avatarSource: getLetterAvatarURLForName(title),
            onPress: () => onEditListItem(field.key, item.id),
        };
    });
}

/**
 * Maps each "I don't have X" link to the question it replaces, such as "I don't have a social security number" to the SSN.
 * The question must be one the form asks while the link is off. A link that replaces no question is not in the map.
 */
function getOptedOutFieldByLink(pages: DynamicFormPage[], values: DynamicFormValues, allFields: DynamicFormField[]): Map<string, DynamicFormField> {
    const optedOutFieldByLink = new Map<string, DynamicFormField>();
    for (const link of allFields) {
        if (link.type !== 'boolean' || link.presentation !== 'link') {
            continue;
        }
        const valuesWithLinkOff = {...values, [link.key]: false};
        const optedOutField = getAllFields(pages.filter((page) => isPageShown(page, valuesWithLinkOff, allFields))).find(
            ({showWhen}) => showWhen?.key === link.key && showWhen.equals.includes('false') && !showWhen.equals.includes('true'),
        );
        if (optedOutField) {
            optedOutFieldByLink.set(link.key, optedOutField);
        }
    }
    return optedOutFieldByLink;
}

/**
 * One section per shown page holding its visible answers, with each list entry as an avatar row and an empty list as a plain row. Tapping a row opens the page or entry to edit. Readonly rows open nothing.
 * Offline, a row whose answer asks the server for a new form is disabled, as its input is on its page. An address stays open, since only its country does that and the rest can be edited offline.
 * A row named in `fieldErrors` shows its error. An address has one row, so it shows the first error of any of its parts.
 */
function getConfirmationItems(
    pages: DynamicFormPage[],
    allFields: DynamicFormField[],
    values: DynamicFormValues,
    translate: LocalizedTranslate,
    onEditPage: (pageIndex: number) => void,
    onEditListItem: (listKey: string, itemID: string) => void,
    isOffline = false,
    fieldErrors: Record<string, string> = {},
): SummaryGroup[] {
    const optedOutFieldByLink = getOptedOutFieldByLink(pages, values, allFields);

    return pages.flatMap((page, pageIndex): SummaryGroup[] => {
        if (!isPageShown(page, values, allFields)) {
            return [];
        }

        // A link that is off has no row, because the question it replaces already shows the answer.
        const fields = getVisibleFields(getContentFields(page.content).filter(isSupportedField), values, allFields).filter(
            (field) => values[field.key] === true || !optedOutFieldByLink.has(field.key),
        );

        if (fields.length === 0) {
            return [];
        }

        const handleEdit = () => onEditPage(pageIndex);
        const sectionName = getPageSectionName(page, values, translate, allFields);

        return [
            {
                id: page.key,
                name: sectionName,
                rows: fields.flatMap((field): SummaryGroupRow[] => {
                    const listItemRows = field.type === 'list' ? getListItemRows(field, values, translate, onEditListItem) : [];
                    if (listItemRows.length > 0) {
                        // The section heading names a list that is alone in it, so the list's own label is shown only when nothing else names the entries or other answers sit beside them
                        const shouldNameList = !sectionName || fields.length > 1;
                        const namedRows: SummaryGroupRow[] = shouldNameList
                            ? [{kind: 'label', id: `${field.key}-label`, title: getFieldLabel(field, translate)}, ...listItemRows]
                            : listItemRows;
                        // An entry row has no room for an error, so an error about the whole list, such as too many entries, goes under them
                        const listError = fieldErrors[field.key];
                        return listError ? [...namedRows, {kind: 'error', id: `${field.key}-error`, title: listError}] : namedRows;
                    }

                    const typedAnswer = formatDynamicFieldValue(field, values, translate);
                    // A resumed sensitive answer, such as an SSN, is blank because the server never sends it back, so the row says it is on file instead of looking unanswered
                    const answer = !typedAnswer && hasProvidedAnswer(field, values) ? translate('dynamicForm.onFile') : typedAnswer;
                    const isEditable = !field.readonly;
                    const fieldLabel = getFieldLabel(field, translate);
                    const isMasked = isSensitiveField(field) && !!typedAnswer && !!getVisibleEnding(typedAnswer);
                    const shownAnswer = isSensitiveField(field) && typedAnswer ? maskSensitiveValue(typedAnswer) : answer;
                    const optedOutField = values[field.key] === true ? optedOutFieldByLink.get(field.key) : undefined;
                    const errorKeys = field.type === 'address' ? [field.key, ...Object.values(getAddressInputKeys(field.key))] : [field.key];
                    const errorText = errorKeys.map((key) => fieldErrors[key]).find((message) => !!message);

                    return [
                        {
                            id: field.key,
                            description: optedOutField ? getFieldLabel(optedOutField, translate) : fieldLabel,
                            title: optedOutField ? fieldLabel : shownAnswer,
                            // Screen readers would read out each bullet of the mask
                            accessibilityLabel: isMasked ? translate('dynamicForm.maskedValueLabel', {label: fieldLabel, ending: getVisibleEnding(typedAnswer)}) : undefined,
                            shouldShowRightIcon: isEditable,
                            onPress: isEditable ? handleEdit : noop,
                            interactive: isEditable,
                            disabled: isOffline && !!field.refreshOnChange && field.type !== 'address',
                            brickRoadIndicator: errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                            errorText,
                        },
                    ];
                }),
            },
        ];
    });
}

export default getConfirmationItems;
