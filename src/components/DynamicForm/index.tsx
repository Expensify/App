import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';

import Navigation from '@libs/Navigation/Navigation';
import {findLastPageIndex} from '@libs/SubPageUtils';

import {clearSensitiveAnswers, forgetSensitiveAnswers, saveDraftAnswers, saveSensitiveAnswers} from '@userActions/DynamicForm';

import ONYXKEYS from '@src/ONYXKEYS';
import type {DynamicFormListField, DynamicFormListItem} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {Str} from 'expensify-common';
import React, {useEffect, useRef} from 'react';

import type {DynamicFormFlowProps, DynamicFormSubPageProps, DynamicFormValues} from './types';
import type {DynamicFormGroup} from './utils/groupFieldsIntoPages';

import DynamicFormConfirmationPage from './components/DynamicFormConfirmationPage';
import DynamicFormFields from './components/DynamicFormFields';
import DynamicFormGroupPage from './components/DynamicFormGroupPage';
import DynamicFormListItemPage from './components/DynamicFormListItemPage';
import DynamicFormShell from './components/DynamicFormShell';
import getDynamicFieldErrors from './utils/getDynamicFieldErrors';
import getSubmittedAnswers from './utils/getSubmittedAnswers';
import getVisibleFields from './utils/getVisibleFields';
import groupFieldsIntoPages, {CONFIRMATION_PAGE_SLUG, getGroupTitle} from './utils/groupFieldsIntoPages';
import isSensitiveField from './utils/isSensitiveField';
import isSupportedField from './utils/isSupportedField';
import {getListItemPageName, getListItems, getListItemSensitiveKey, getRemovedListItemSensitiveKeys, parseListItemPageName} from './utils/listItems';
import toDynamicFormValues from './utils/toDynamicFormValues';

const CONFIRMATION_MIN_PAGES = 5;

/** An answer the user gave, including `false`, which counts as progress when deciding where a visit resumes */
function hasDraftAnswer(answer: DynamicFormValues[string]): boolean {
    return answer !== undefined && answer !== '' && !(Array.isArray(answer) && answer.length === 0);
}

/** Flows shorter than this read as one form, so `auto` gives them no step indicator */
const STEP_INDICATOR_MIN_PAGES = 3;

/** A whole dynamic form: one page per group, skipping pages with nothing to ask, then a confirmation page on longer forms */
function DynamicFormFlow({
    fields: schemaFields,
    formID,
    headerTitle,
    confirmationTitle,
    testID,
    buildRoute,
    shouldReplaceRoute,
    onSubmit,
    onPageSubmit,
    onBack,
    currency,
    onRefreshRequirements,
    isSubmitting,
    submitError,
    layout = 'auto',
    hasConfirmation,
}: DynamicFormFlowProps) {
    const {translate} = useLocalize();
    const [draft, draftMetadata] = useOnyx(`${formID}Draft`);
    const [sensitiveAnswersByForm] = useOnyx(ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS);
    const isDraftLoading = isLoadingOnyxValue(draftMetadata);
    const draftValues = toDynamicFormValues(draft);
    const values: DynamicFormValues = {...draftValues, ...sensitiveAnswersByForm?.[formID]};

    const fields = schemaFields.filter(isSupportedField);
    const groups = groupFieldsIntoPages(fields);
    const listFields = fields.filter((field): field is DynamicFormListField => field.type === 'list');
    const shownGroups = groups.filter((group) => getVisibleFields(group.fields, values, fields).length > 0);

    const hasPageToShow = shownGroups.length > 0;

    // useSubPage needs at least one page, so a form without groups gets the confirmation page
    const hasConfirmationPage = groups.length === 0 || (hasConfirmation ?? groups.length > CONFIRMATION_MIN_PAGES);

    // Entry editors come after the confirmation page and are skipped by Next and Back, so only an entry's Add, Edit or row opens them
    const listItemPageNames = listFields.flatMap((field) => [getListItemPageName(field.key), ...getListItems(values[field.key]).map((item) => getListItemPageName(field.key, item.id))]);
    const pages = [
        ...groups.map((group) => ({pageName: group.slug, component: DynamicFormGroupPage})),
        ...(hasConfirmationPage ? [{pageName: CONFIRMATION_PAGE_SLUG, component: DynamicFormConfirmationPage}] : []),
        ...listItemPageNames.map((pageName) => ({pageName, component: DynamicFormListItemPage})),
    ];
    // While nothing is shown no group is skipped, since useSubPage needs a page that is not skipped
    const skippedGroups = hasPageToShow ? groups.filter((group) => !shownGroups.includes(group)) : [];
    const skipPages = [...skippedGroups.map((group) => group.slug), ...listItemPageNames];
    const firstShownPageIndex = pages.findIndex((page) => !skipPages.includes(page.pageName));
    const lastShownPageIndex = findLastPageIndex<DynamicFormSubPageProps>(pages, skipPages);
    const getFirstIncompleteGroupIndex = (answers: DynamicFormValues) => groups.findIndex((group) => Object.keys(getDynamicFieldErrors(group.fields, answers, translate, fields)).length > 0);

    // A visit opened without a page in the URL drops the sensitive answers of earlier visits, so it starts from what the draft holds
    let startFrom = firstShownPageIndex;
    if (isDraftLoading) {
        startFrom = -1;
    } else if (fields.some((field) => hasDraftAnswer(draftValues[field.key]))) {
        const firstIncompleteIndex = getFirstIncompleteGroupIndex(draftValues);
        startFrom = firstIncompleteIndex === -1 ? lastShownPageIndex : firstIncompleteIndex;
    }

    const {CurrentPage, isEditing, currentPageName, pageIndex, nextPage, prevPage, moveTo, resetToPage, isRedirecting} = useSubPage<DynamicFormSubPageProps>({
        pages,
        skipPages,
        startFrom,
        buildRoute,
        shouldReplaceRoute,
        onFinished: submitIfComplete,
    });

    /** The confirmation page can be opened by URL before every page is answered, so an incomplete form goes back to its first gap instead. Without a confirmation page the last page's answers arrive here, before their draft is saved. */
    function submitIfComplete(lastPageValues?: unknown) {
        const answers = {...values, ...toDynamicFormValues(lastPageValues)};
        const firstIncompleteIndex = getFirstIncompleteGroupIndex(answers);
        const incompleteGroup = firstIncompleteIndex === -1 ? undefined : groups.at(firstIncompleteIndex);
        if (incompleteGroup) {
            resetToPage(incompleteGroup.slug);
            return;
        }
        const submittedAnswers = getSubmittedAnswers(fields, answers);
        if (isSubmitting === undefined) {
            clearSensitiveAnswers(formID);
        }
        onSubmit(submittedAnswers);
    }

    const listItemPage = parseListItemPageName(currentPageName);
    const findListGroup = (listKey: string) => groups.find((group) => group.fields.some((field) => field.key === listKey));
    const isOnSkippedGroupPage = !listItemPage && skipPages.some((pageName) => pageName === currentPageName);
    const isOnUnavailablePage = !isDraftLoading && !isRedirecting && (!pages.some((page) => page.pageName === currentPageName) || isOnSkippedGroupPage);

    useEffect(() => {
        if (!isRedirecting) {
            return;
        }
        clearSensitiveAnswers(formID);
    }, [isRedirecting, formID]);

    // A submission that finishes without an error drops the sensitive answers
    const wasSubmittingRef = useRef(false);
    useEffect(() => {
        if (isSubmitting) {
            wasSubmittingRef.current = true;
            return;
        }
        if (!wasSubmittingRef.current || submitError) {
            return;
        }
        wasSubmittingRef.current = false;
        clearSensitiveAnswers(formID);
    }, [isSubmitting, submitError, formID]);

    // A page the answers now skip moves on to the next shown page, or back to the previous one. A stale link opens where a new visit would start.
    const pageNames = pages.map((page) => page.pageName);
    const nextShownPageName = pageNames.find((pageName, index) => index > pageIndex && !skipPages.includes(pageName));
    const previousShownPageName = pageNames.findLast((pageName, index) => index < pageIndex && !skipPages.includes(pageName));
    const unavailablePageTarget = isOnSkippedGroupPage ? (nextShownPageName ?? previousShownPageName) : pages.at(startFrom)?.pageName;
    useEffect(() => {
        if (!isOnUnavailablePage || !unavailablePageTarget) {
            return;
        }
        resetToPage(unavailablePageTarget);
    }, [isOnUnavailablePage, resetToPage, unavailablePageTarget]);

    /** Typed answers are drafted as FormProvider cleaned them and inputs left untouched are drafted with their defaults, so the draft matches what the page validated. Lists are drafted as they change, and their submitted entries carry sensitive answers, so they are left out. */
    const handleGroupSubmit = (group: DynamicFormGroup, pageValues: DynamicFormValues) => {
        const currentValues = {...values, ...pageValues};
        const answers = getSubmittedAnswers(group.fields, currentValues, fields);
        const sensitiveKeys = new Set(group.fields.filter(isSensitiveField).map((field) => field.key));
        const listKeys = new Set(listFields.map((field) => field.key));
        const draftAnswers: DynamicFormValues = {};
        const sensitiveAnswers: DynamicFormValues = {};
        for (const [key, answer] of Object.entries(answers)) {
            if (sensitiveKeys.has(key)) {
                sensitiveAnswers[key] = answer;
            } else if (!listKeys.has(key)) {
                draftAnswers[key] = answer;
            }
        }
        saveDraftAnswers(formID, draftAnswers);
        if (Object.keys(sensitiveAnswers).length > 0) {
            saveSensitiveAnswers(formID, sensitiveAnswers);
        }
        const removedSensitiveKeys = listFields.filter((field) => group.fields.includes(field)).flatMap((field) => getRemovedListItemSensitiveKeys(field, currentValues));
        if (removedSensitiveKeys.length > 0) {
            forgetSensitiveAnswers(formID, removedSensitiveKeys);
        }
        onPageSubmit?.(group, pageValues);
    };

    const returnTo = (pageName: string) => {
        // Replaced routes leave nothing in the stack to go back to
        if (shouldReplaceRoute) {
            resetToPage(pageName);
            return;
        }
        Navigation.goBack(buildRoute(pageName));
    };

    /** An entry opened from the confirmation page, or from a page edited from it, returns there */
    const closeListItemEditor = (listKey: string) => {
        const listGroup = findListGroup(listKey);
        returnTo(isEditing || !listGroup ? CONFIRMATION_PAGE_SLUG : listGroup.slug);
    };

    const openListItemEditor = (listKey: string, itemID?: string) => {
        const editorIndex = pages.findIndex((page) => page.pageName === getListItemPageName(listKey, itemID));
        moveTo(editorIndex, isEditing || currentPageName === CONFIRMATION_PAGE_SLUG);
    };

    /** The entry is drafted with the form, except its sensitive answers, which are kept in memory under the entry */
    const saveListItem = (listKey: string, itemID: string | undefined, itemValues: DynamicFormValues) => {
        const listField = listFields.find((field) => field.key === listKey);
        if (!listField) {
            return;
        }
        const id = itemID ?? Str.guid();
        const sensitiveKeys = new Set(listField.itemFields.filter(isSensitiveField).map((field) => field.key));
        const item: DynamicFormListItem = {id};
        const sensitiveAnswers: DynamicFormValues = {};
        for (const [key, answer] of Object.entries(getSubmittedAnswers(listField.itemFields, itemValues))) {
            if (sensitiveKeys.has(key)) {
                sensitiveAnswers[getListItemSensitiveKey(listKey, id, key)] = answer;
            } else {
                item[key] = answer;
            }
        }
        const items = getListItems(values[listKey]);
        saveDraftAnswers(formID, {[listKey]: itemID ? items.map((existing) => (existing.id === id ? item : existing)) : [...items, item]});
        if (Object.keys(sensitiveAnswers).length > 0) {
            saveSensitiveAnswers(formID, sensitiveAnswers);
        }
        closeListItemEditor(listKey);
    };

    const goBack = () => {
        if (listItemPage) {
            closeListItemEditor(listItemPage.listKey);
            return;
        }
        if (isEditing) {
            returnTo(CONFIRMATION_PAGE_SLUG);
            return;
        }
        if (pageIndex <= firstShownPageIndex) {
            clearSensitiveAnswers(formID);
            onBack();
            return;
        }
        prevPage();
    };

    // An entry editor highlights its list's step, and the confirmation page the last one
    const stepGroup = groups.find((group) => group.slug === currentPageName) ?? (listItemPage && findListGroup(listItemPage.listKey));
    const stepNames = [...shownGroups.map((group) => getGroupTitle(group, translate)), ...(hasConfirmationPage ? [translate('common.confirm')] : [])];
    const stepIndex = stepGroup ? Math.max(shownGroups.indexOf(stepGroup), 0) : stepNames.length - 1;
    const isStepIndicatorAsked = layout === 'auto' ? shownGroups.length >= STEP_INDICATOR_MIN_PAGES : layout === 'stepper';

    return (
        <DynamicFormShell
            testID={testID}
            headerTitle={headerTitle}
            onBackButtonPress={goBack}
            stepNames={stepNames}
            stepIndex={stepIndex}
            shouldShowStepIndicator={isStepIndicatorAsked && stepNames.length > 1}
        >
            {isDraftLoading || isRedirecting || isOnUnavailablePage || !hasPageToShow ? (
                <FullscreenLoadingIndicator />
            ) : (
                <CurrentPage
                    isEditing={isEditing}
                    isLastPage={!hasConfirmationPage && pageIndex === lastShownPageIndex}
                    currentPageName={currentPageName}
                    onNext={nextPage}
                    onMove={moveTo}
                    prevPage={prevPage}
                    formID={formID}
                    fields={fields}
                    groups={groups}
                    values={values}
                    currency={currency}
                    onRefreshRequirements={onRefreshRequirements}
                    onGroupSubmit={handleGroupSubmit}
                    onOpenListItemEditor={openListItemEditor}
                    onListItemSave={saveListItem}
                    confirmationTitle={confirmationTitle}
                    isSubmitting={isSubmitting}
                    submitError={submitError}
                />
            )}
        </DynamicFormShell>
    );
}

export default DynamicFormFlow;
export {DynamicFormFields, getDynamicFieldErrors};
