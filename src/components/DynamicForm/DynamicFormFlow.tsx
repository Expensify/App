import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';

import Navigation from '@libs/Navigation/Navigation';

import {clearDraftValues, setDraftValues} from '@userActions/FormActions';

import type {OnyxFormKey} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {DynamicFormField} from '@src/types/onyx';
import type {DynamicFormListItem} from '@src/types/onyx/DynamicFormField';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {Str} from 'expensify-common';
import React, {useEffect, useState} from 'react';

import type {DynamicFormPage as DynamicFormPageSchema} from './groupFieldsIntoPages';
import type {DynamicFormValues} from './types';

import {summarizeItem} from './adapters/ListFieldAdapter';
import DynamicFormPage from './DynamicFormPage';
import DynamicFormShell from './DynamicFormShell';
import formatDynamicFieldValue from './formatDynamicFieldValue';
import getDynamicFieldErrors from './getDynamicFieldErrors';
import {getFieldLabel} from './getInputComponentForField';
import groupFieldsIntoPages, {CONFIRM_PAGE_SLUG} from './groupFieldsIntoPages';
import isFieldVisible from './isFieldVisible';

type DynamicFormFlowProps = {
    fields: DynamicFormField[];
    formID: OnyxFormKey;
    headerTitle: string;
    testID: string;

    /** Route for a page slug; the flow passes `edit` when returning from the confirmation page */
    buildRoute: (pageName: string, action?: 'edit') => Route;

    /** Receives every answer in the draft once the confirmation page is confirmed */
    onSubmit: (values: DynamicFormValues) => void;

    /** Leaving the first page */
    onBack: () => void;

    /** Currency for amount fields without a currencyKey */
    currency?: string;

    confirmationTitle: string;

    isSubmitting?: boolean;

    submitError?: string;

    /** Overrides the step indicator's page-count default: true always shows it, false never does */
    shouldShowStepIndicator?: boolean;

    /** Called with a page and its answers before the flow moves on, for flows that persist each page to the API */
    onPageSubmit?: (page: DynamicFormPageSchema, values: DynamicFormValues) => void;
};

function EmptyPage() {
    return null;
}

/** Each sub page is a separate route mount, so answers kept out of the draft live here for the length of one visit to the flow */
const carriedAnswersByForm = new Map<string, DynamicFormValues>();

function isCarriedOutsideDraft(field: DynamicFormField): boolean {
    return !!field.sensitive;
}

const LIST_ITEM_FORM_ID = ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM;
const ITEM_EDITOR_SEPARATOR = '~';
const NEW_ITEM_ID = 'new';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isListItems(value: unknown): value is DynamicFormListItem[] {
    return Array.isArray(value) && value.every((item) => isRecord(item) && typeof item.id === 'string');
}

/** Sensitive item answers never reach the draft; they are carried per item under this key and merged back on submit */
function getCarriedItemKey(listKey: string, itemID: string): string {
    return `${listKey}${ITEM_EDITOR_SEPARATOR}${itemID}`;
}

/** A whole dynamic form: one sub page per group, a confirmation page, and a step indicator when the flow is long enough */
function DynamicFormFlow({
    fields,
    formID,
    headerTitle,
    testID,
    buildRoute,
    onSubmit,
    onBack,
    currency,
    confirmationTitle,
    isSubmitting = false,
    submitError,
    shouldShowStepIndicator,
    onPageSubmit,
}: DynamicFormFlowProps) {
    const {translate} = useLocalize();
    const [draft, draftMetadata] = useOnyx(`${formID}Draft`);
    const [carriedAnswers, setCarriedAnswers] = useState<DynamicFormValues>(() => carriedAnswersByForm.get(formID) ?? {});
    const groupPages = groupFieldsIntoPages(fields);
    const pages = [...groupPages.map((page) => ({pageName: page.slug, component: EmptyPage})), {pageName: CONFIRM_PAGE_SLUG, component: EmptyPage}];
    const draftValues: DynamicFormValues = {...draft, ...carriedAnswers};
    const hasVisibleField = (page: DynamicFormPageSchema) => page.fields.some((field) => isFieldVisible(field, draftValues));
    const skipPages = groupPages.filter((page) => !hasVisibleField(page)).map((page) => page.slug);

    const isDraftLoading = isLoadingOnyxValue(draftMetadata);
    const hasProgress = fields.some((field) => {
        const answer = draftValues[field.key];
        return answer !== undefined && answer !== '' && !(Array.isArray(answer) && answer.length === 0);
    });
    const firstIncompleteIndex = groupPages.findIndex((page) => hasVisibleField(page) && Object.keys(getDynamicFieldErrors(page.fields, draftValues, translate)).length > 0);
    let startFrom = 0;
    if (isDraftLoading) {
        startFrom = -1;
    } else if (hasProgress) {
        startFrom = firstIncompleteIndex === -1 ? pages.length - 1 : firstIncompleteIndex;
    }

    const {isEditing, nextPage, prevPage, pageIndex, moveTo, currentPageName, isRedirecting} = useSubPage({
        pages,
        skipPages,
        startFrom,
        onFinished: () => {
            const incompletePage = groupPages.at(firstIncompleteIndex);
            if (firstIncompleteIndex !== -1 && incompletePage) {
                Navigation.navigate(buildRoute(incompletePage.slug));
                return;
            }
            carriedAnswersByForm.delete(formID);
            const visibleFields = fields.filter((field) => isFieldVisible(field, draftValues));
            const isSubmitted = (key: string) => visibleFields.some((field) => key === field.key || key === field.currencyKey || key.startsWith(`${field.key}.`));
            const submitted = Object.fromEntries(Object.entries(draftValues).filter(([key]) => isSubmitted(key)));
            for (const field of visibleFields) {
                const items = submitted[field.key];
                if (field.type === 'list' && isListItems(items)) {
                    submitted[field.key] = items.map((item) => {
                        const carriedItemAnswers = carriedAnswers[getCarriedItemKey(field.key, item.id)];
                        return isRecord(carriedItemAnswers) ? {...item, ...carriedItemAnswers} : item;
                    });
                }
            }
            onSubmit(submitted);
        },
        buildRoute,
    });

    useEffect(() => {
        if (!isRedirecting) {
            return;
        }
        carriedAnswersByForm.delete(formID);
    }, [isRedirecting, formID]);

    const isCurrentPageSkipped = !!currentPageName && skipPages.includes(currentPageName);
    const pageNames = pages.map((page) => page.pageName);
    const nextShownIndex = pageNames.findIndex((name, index) => index > pageIndex && !skipPages.includes(name));
    const previousShownIndex = pageNames.findLastIndex((name, index) => index < pageIndex && !skipPages.includes(name));
    const redirectIndex = isCurrentPageSkipped && !isRedirecting && !isDraftLoading ? Math.max(nextShownIndex, previousShownIndex) : -1;
    const redirectPageName = pageNames.at(redirectIndex === -1 ? pageNames.length : redirectIndex);
    useEffect(() => {
        if (!redirectPageName) {
            return;
        }
        Navigation.navigate(buildRoute(redirectPageName), {forceReplace: true});
    }, [redirectPageName, buildRoute]);

    const goBackToConfirmation = () => Navigation.goBack(buildRoute(CONFIRM_PAGE_SLUG));

    const currentGroupPage = groupPages.find((page) => page.slug === currentPageName);

    const [editorListKey = '', editorItemID = ''] = currentPageName?.includes(ITEM_EDITOR_SEPARATOR) ? currentPageName.split(ITEM_EDITOR_SEPARATOR) : [];
    const editorField = fields.find((field) => field.type === 'list' && field.key === editorListKey);
    const editorGroup = editorField ? groupPages.find((page) => page.fields.includes(editorField)) : undefined;
    const editorItemFields = editorField?.itemFields ?? [];
    const editorSensitiveKeys = editorItemFields.filter((field) => field.sensitive).map((field) => field.key);
    const storedItems = draftValues[editorListKey];
    const editorItems = isListItems(storedItems) ? storedItems : [];
    const editingItem = editorItems.find((item) => item.id === editorItemID);
    const carriedEditingAnswers = editingItem ? carriedAnswers[getCarriedItemKey(editorListKey, editingItem.id)] : undefined;
    const editorDraft: DynamicFormValues = {...editingItem, ...(isRecord(carriedEditingAnswers) ? carriedEditingAnswers : {})};
    const [seededEditorPage, setSeededEditorPage] = useState<string | undefined>();
    const editorSensitiveKeysSignature = editorSensitiveKeys.join('\n');
    useEffect(() => {
        if (!editorField || !currentPageName) {
            return;
        }
        const sensitiveKeys = editorSensitiveKeysSignature.split('\n');
        clearDraftValues(LIST_ITEM_FORM_ID);
        setDraftValues(LIST_ITEM_FORM_ID, Object.fromEntries(Object.entries(editingItem ?? {}).filter(([key]) => key !== 'id' && !sensitiveKeys.includes(key)))).then(() =>
            setSeededEditorPage(currentPageName),
        );
    }, [currentPageName, editorField, editingItem, editorSensitiveKeysSignature]);

    const openListItemEditor = (fieldKey: string, itemID?: string) => Navigation.navigate(buildRoute(getCarriedItemKey(fieldKey, itemID ?? NEW_ITEM_ID)));

    const saveEditorItem = (values: DynamicFormValues) => {
        if (!editorField || !editorGroup) {
            return;
        }
        const id = editingItem?.id ?? Str.guid();
        const item: DynamicFormListItem = {...Object.fromEntries(Object.entries(values).filter(([key]) => !editorSensitiveKeys.includes(key))), id};
        const sensitiveAnswers = Object.fromEntries(Object.entries(values).filter(([key, answer]) => editorSensitiveKeys.includes(key) && answer !== '' && answer !== undefined));
        setDraftValues(formID, {[editorField.key]: editingItem ? editorItems.map((existing) => (existing.id === id ? item : existing)) : [...editorItems, item]});
        if (Object.keys(sensitiveAnswers).length > 0) {
            const carriedItemKey = getCarriedItemKey(editorField.key, id);
            const existing = carriedAnswers[carriedItemKey];
            const nextCarried = {...carriedAnswers, [carriedItemKey]: {...(isRecord(existing) ? existing : {}), ...sensitiveAnswers}};
            carriedAnswersByForm.set(formID, nextCarried);
            setCarriedAnswers(nextCarried);
        }
        Navigation.goBack(buildRoute(editorGroup.slug));
    };

    const editorItemLabel = editorField?.itemLabelKey ? translate(editorField.itemLabelKey) : editorField?.itemLabel;
    let editorTitle = editorItemLabel ? translate('dynamicForm.addItem', {item: editorItemLabel}) : translate('common.add');
    if (editingItem) {
        editorTitle = summarizeItem(editingItem, editorItemFields, translate).title || editorTitle;
    }

    const handleBackButtonPress = () => {
        if (editorGroup) {
            Navigation.goBack(buildRoute(editorGroup.slug));
            return;
        }
        if (isEditing) {
            goBackToConfirmation();
            return;
        }
        if (previousShownIndex === -1) {
            carriedAnswersByForm.delete(formID);
            onBack();
            return;
        }
        prevPage();
    };

    const handleNext = (values: DynamicFormValues) => {
        const carriedKeys = currentGroupPage?.fields.filter(isCarriedOutsideDraft).map((field) => field.key) ?? [];
        if (carriedKeys.length > 0) {
            const nextCarried = {...carriedAnswers, ...Object.fromEntries(carriedKeys.map((key) => [key, values[key]]))};
            carriedAnswersByForm.set(formID, nextCarried);
            setCarriedAnswers(nextCarried);
        }
        if (currentGroupPage) {
            onPageSubmit?.(currentGroupPage, values);
        }
        if (isEditing) {
            goBackToConfirmation();
            return;
        }
        nextPage();
    };

    const isConfirmationPage = currentPageName === CONFIRM_PAGE_SLUG;
    const visibleGroupPages = groupPages.filter(hasVisibleField);
    const stepNames = visibleGroupPages.map((page) => page.name);
    const stepGroup = currentGroupPage ?? editorGroup;
    const stepIndex = stepGroup ? Math.max(0, visibleGroupPages.indexOf(stepGroup)) : stepNames.length - 1;

    const summaryItems = groupPages.flatMap((page, index) =>
        page.fields
            .filter((field) => isFieldVisible(field, draftValues))
            .map((field) => ({
                id: field.key,
                description: getFieldLabel(field, translate),
                title: field.sensitive ? '••••' : formatDynamicFieldValue(field, draftValues, translate),
                shouldShowRightIcon: !field.readonly,
                onPress: () => moveTo(index),
            })),
    );

    const isLoading = isRedirecting || isCurrentPageSkipped || isDraftLoading || (!currentGroupPage && !isConfirmationPage && !editorField);

    let content = <FullScreenLoadingIndicator />;
    if (!isLoading && currentGroupPage && !isConfirmationPage) {
        content = (
            <DynamicFormPage
                key={currentGroupPage.slug}
                page={currentGroupPage}
                formID={formID}
                draft={draftValues}
                currency={currency}
                submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
                onSubmit={handleNext}
                onOpenListItemEditor={openListItemEditor}
            />
        );
    } else if (!isLoading && editorField && editorGroup) {
        if (seededEditorPage === currentPageName && currentPageName) {
            content = (
                <DynamicFormPage
                    key={currentPageName}
                    page={{name: editorTitle, slug: currentPageName, fields: editorItemFields}}
                    formID={LIST_ITEM_FORM_ID}
                    draft={editorDraft}
                    currency={currency}
                    submitButtonText={translate('common.save')}
                    onSubmit={saveEditorItem}
                />
            );
        }
    } else if (!isLoading) {
        content = (
            <ConfirmationStep
                pageTitle={confirmationTitle}
                summaryItems={summaryItems}
                showOnfidoLinks={false}
                isLoading={isSubmitting}
                error={submitError}
                isEditing={false}
                onNext={nextPage}
                onMove={moveTo}
            />
        );
    }

    return (
        <DynamicFormShell
            testID={testID}
            headerTitle={headerTitle}
            stepNames={stepNames}
            stepIndex={Math.min(stepIndex, Math.max(stepNames.length - 1, 0))}
            onBackButtonPress={handleBackButtonPress}
            shouldShowStepIndicator={shouldShowStepIndicator}
        >
            {content}
        </DynamicFormShell>
    );
}

export default DynamicFormFlow;
