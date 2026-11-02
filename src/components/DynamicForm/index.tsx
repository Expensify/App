import ActivityIndicator from '@components/ActivityIndicator';

import useAndroidBackButtonHandler from '@hooks/useAndroidBackButtonHandler';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {findLastPageIndex} from '@libs/SubPageUtils';

import {clearSensitiveAnswers, forgetSensitiveAnswers, saveDraftAnswers, saveSensitiveAnswers} from '@userActions/DynamicForm';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DynamicFormListField, DynamicFormListItem, DynamicFormPage} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {Str} from 'expensify-common';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import type {DynamicFormFlowProps, DynamicFormSubPageProps, DynamicFormValues} from './types';

import DynamicFormConfirmationPage from './components/DynamicFormConfirmationPage';
import DynamicFormFieldsPage from './components/DynamicFormFieldsPage';
import DynamicFormListItemPage from './components/DynamicFormListItemPage';
import DynamicFormShell from './components/DynamicFormShell';
import getAnswerKeys from './utils/getAnswerKeys';
import getContentFields from './utils/getContentFields';
import getDynamicFieldErrors from './utils/getDynamicFieldErrors';
import getPageTitle, {isPageShown} from './utils/getPageTitle';
import getSubmittedAnswers from './utils/getSubmittedAnswers';
import hasSensitiveAnswer from './utils/hasSensitiveAnswer';
import isSensitiveField from './utils/isSensitiveField';
import isSupportedField from './utils/isSupportedField';
import {getListItemPageName, getListItems, getListItemSensitiveKey, getRemovedListItemSensitiveKeys, parseListItemPageName} from './utils/listItems';
import {getAllFields, getPages} from './utils/paginate';
import toDynamicFormValues from './utils/toDynamicFormValues';

/** An answer the user gave, including `false`, which counts as progress when deciding where a visit resumes */
function hasDraftAnswer(answer: DynamicFormValues[string]): boolean {
    return answer !== undefined && answer !== null && answer !== '' && !(Array.isArray(answer) && answer.length === 0);
}

/** A whole dynamic form: one page per schema page, skipping pages with nothing to ask, then a confirmation page */
function DynamicFormFlow({
    schema,
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
    maxFileSize,
    onRefreshRequirements,
    isSubmitting,
    submitError,
    layout = 'auto',
    hasConfirmation = true,
}: DynamicFormFlowProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [draft, draftMetadata] = useOnyx(`${formID}Draft`);
    const [sensitiveAnswersByForm] = useOnyx(ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS);
    const isDraftLoading = isLoadingOnyxValue(draftMetadata);
    const draftValues = toDynamicFormValues(draft);
    const values: DynamicFormValues = {...draftValues, ...sensitiveAnswersByForm?.[formID]};

    const pages = getPages(schema);
    const allFields = getAllFields(pages);
    const listFields = allFields.filter((field): field is DynamicFormListField => field.type === 'list');
    const shownPages = pages.filter((page) => isPageShown(page, values, allFields));
    const hasPageToShow = shownPages.length > 0;

    // useSubPage needs at least one page, so a form without pages gets the confirmation page
    const hasConfirmationPage = pages.length === 0 || hasConfirmation;
    // Entry editors come after the confirmation page and are skipped by Next and Back, so only an entry's Add, Edit or row opens them. A readonly list has no editors.
    const listItemPageNames = listFields
        .filter((field) => !field.readonly)
        .flatMap((field) => [getListItemPageName(field.key), ...getListItems(values[field.key]).map((item) => getListItemPageName(field.key, item.id))]);
    const subPages = [
        ...pages.map((page) => ({pageName: page.key, component: DynamicFormFieldsPage})),
        ...(hasConfirmationPage ? [{pageName: CONST.DYNAMIC_FORM.CONFIRMATION_PAGE_KEY, component: DynamicFormConfirmationPage}] : []),
        ...listItemPageNames.map((pageName) => ({pageName, component: DynamicFormListItemPage})),
    ];
    // While nothing is shown no page is skipped, since useSubPage needs a page that is not skipped
    const skippedPages = hasPageToShow ? pages.filter((page) => !shownPages.includes(page)) : [];
    const skipPages = [...skippedPages.map((page) => page.key), ...listItemPageNames];
    const firstShownPageIndex = subPages.findIndex((page) => !skipPages.includes(page.pageName));
    const lastShownPageIndex = findLastPageIndex<DynamicFormSubPageProps>(subPages, skipPages);

    /** Pages the answers hide are never asked, so they cannot be the first gap */
    const getFirstIncompletePageIndex = (answers: DynamicFormValues) =>
        pages.findIndex((page) => isPageShown(page, answers, allFields) && Object.keys(getDynamicFieldErrors(getContentFields(page.content), answers, translate, allFields)).length > 0);

    // A visit opened without a page in the URL drops the sensitive answers of earlier visits, so it starts from what the draft holds
    let startFrom = firstShownPageIndex;
    if (isDraftLoading) {
        startFrom = -1;
    } else if (allFields.some((field) => hasDraftAnswer(draftValues[field.key]))) {
        const firstIncompleteIndex = getFirstIncompletePageIndex(draftValues);
        startFrom = firstIncompleteIndex === -1 ? lastShownPageIndex : firstIncompleteIndex;
    }

    const {CurrentPage, isEditing, currentPageName, pageIndex, nextPage, prevPage, moveTo, resetToPage, isRedirecting} = useSubPage<DynamicFormSubPageProps>({
        pages: subPages,
        skipPages,
        startFrom,
        buildRoute,
        shouldReplaceRoute,
        onFinished: submitIfComplete,
    });

    /** Goes back to a page without stacking a second copy of it. Replaced routes leave nothing in the stack to go back to. */
    const returnTo = (pageName: string) => {
        if (shouldReplaceRoute) {
            resetToPage(pageName);
            return;
        }
        Navigation.goBack(buildRoute(pageName));
    };

    /** The confirmation page can be opened by URL before every page is answered, so an incomplete form goes back to its first gap instead. Without a confirmation page the last page's answers arrive here, before their draft is saved. */
    function submitIfComplete(lastPageValues?: unknown) {
        const answers = {...values, ...toDynamicFormValues(lastPageValues)};
        const firstIncompleteIndex = getFirstIncompletePageIndex(answers);
        const incompletePage = firstIncompleteIndex === -1 ? undefined : pages.at(firstIncompleteIndex);
        if (incompletePage) {
            returnTo(incompletePage.key);
            return;
        }
        // Fields of a page the answers skip are not submitted
        const shownFields = getAllFields(pages.filter((page) => isPageShown(page, answers, allFields)));
        const submittedAnswers = getSubmittedAnswers(shownFields, answers, allFields);
        if (isSubmitting === undefined) {
            clearSensitiveAnswers(formID);
        }
        onSubmit(submittedAnswers);
    }

    const listItemPage = parseListItemPageName(currentPageName);
    const findListPage = (listKey: string) => pages.find((page) => getContentFields(page.content).some((field) => field.key === listKey));
    const isOnSkippedPage = !listItemPage && !!currentPageName && skipPages.includes(currentPageName);
    const isOnUnavailablePage = !isDraftLoading && !isRedirecting && (!subPages.some((page) => page.pageName === currentPageName) || isOnSkippedPage);

    useEffect(() => {
        if (!isRedirecting) {
            return;
        }
        clearSensitiveAnswers(formID);
    }, [isRedirecting, formID]);

    // A visit that opens without a page waits for the earlier visit's sensitive answers to be gone, so no input starts from them. The flow can be left without
    // its own Back, such as by a swipe back, which leaves them in memory.
    const hasSensitiveAnswers = !isEmptyObject(sensitiveAnswersByForm?.[formID]);
    const [isClearingEarlierVisit, setIsClearingEarlierVisit] = useState(isRedirecting);
    if (isClearingEarlierVisit && !hasSensitiveAnswers) {
        setIsClearingEarlierVisit(false);
    }

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

    // A page the answers now skip is replaced by the next shown page, or the previous one, so Back never lands on it. A stale link opens where a new visit would start.
    const pageNames = subPages.map((page) => page.pageName);
    const nextShownPageName = pageNames.find((pageName, index) => index > pageIndex && !skipPages.includes(pageName));
    const previousShownPageName = pageNames.findLast((pageName, index) => index < pageIndex && !skipPages.includes(pageName));
    const unavailablePageTarget = isOnSkippedPage ? (nextShownPageName ?? previousShownPageName) : subPages.at(startFrom)?.pageName;

    useEffect(() => {
        if (!isOnUnavailablePage || !unavailablePageTarget) {
            return;
        }
        Navigation.navigate(buildRoute(unavailablePageTarget), {forceReplace: true});
    }, [isOnUnavailablePage, buildRoute, unavailablePageTarget]);

    /** Typed answers are drafted as FormProvider cleaned them and inputs left untouched are drafted with their defaults, so the draft matches what the page validated. Sensitive answers go to memory only and reach the screen apart from the draft ones. Lists are drafted as they change, so the screen gets their drafted entries, which hold no sensitive answers. */
    const handlePageSubmit = (page: DynamicFormPage, pageValues: DynamicFormValues) => {
        const currentValues = {...values, ...pageValues};
        const pageFields = getContentFields(page.content).filter(isSupportedField);
        const answers = getSubmittedAnswers(pageFields, currentValues, allFields);
        const sensitiveKeys = new Set(pageFields.filter((field) => isSensitiveField(field)).flatMap((field) => getAnswerKeys(field)));
        const listKeys = new Set(listFields.map((field) => field.key));
        const draftAnswers: DynamicFormValues = {};
        const listAnswers: DynamicFormValues = {};
        const sensitiveAnswers: DynamicFormValues = {};
        for (const [key, answer] of Object.entries(answers)) {
            if (sensitiveKeys.has(key)) {
                sensitiveAnswers[key] = answer;
            } else if (listKeys.has(key)) {
                listAnswers[key] = getListItems(currentValues[key]);
            } else {
                draftAnswers[key] = answer;
            }
        }
        saveDraftAnswers(formID, draftAnswers);
        if (Object.keys(sensitiveAnswers).length > 0) {
            saveSensitiveAnswers(formID, sensitiveAnswers);
        }
        const removedSensitiveKeys = listFields.filter((field) => pageFields.includes(field)).flatMap((field) => getRemovedListItemSensitiveKeys(field, currentValues));
        if (removedSensitiveKeys.length > 0) {
            forgetSensitiveAnswers(formID, removedSensitiveKeys);
        }
        onPageSubmit?.(page, {...draftAnswers, ...listAnswers}, sensitiveAnswers);
    };

    /** An entry opened from the confirmation page, or from a page edited from it, returns there */
    const closeListItemEditor = (listKey: string) => {
        const listPage = findListPage(listKey);
        returnTo(isEditing || !listPage ? CONST.DYNAMIC_FORM.CONFIRMATION_PAGE_KEY : listPage.key);
    };

    const openListItemEditor = (listKey: string, itemID?: string) => {
        const editorIndex = subPages.findIndex((page) => page.pageName === getListItemPageName(listKey, itemID));
        // moveTo(-1) would open the last sub-page, which is another entry's editor
        if (editorIndex === -1) {
            return;
        }
        moveTo(editorIndex, isEditing || currentPageName === CONST.DYNAMIC_FORM.CONFIRMATION_PAGE_KEY);
    };

    /** The entry is drafted with the form, except its sensitive answers, which are kept in memory under the entry. A sensitive list is kept in memory whole. */
    const saveListItem = (listKey: string, itemID: string | undefined, itemValues: DynamicFormValues) => {
        const listField = listFields.find((field) => field.key === listKey);
        if (!listField) {
            return;
        }
        const items = getListItems(values[listKey]);
        // The add row is hidden once the list is full, but a stale link can still open the editor of a new entry
        if (!itemID && listField.maxItems !== undefined && items.length >= listField.maxItems) {
            closeListItemEditor(listKey);
            return;
        }
        const id = itemID ?? Str.guid();
        const sensitiveKeys = new Set(listField.itemFields.filter(hasSensitiveAnswer).flatMap(getAnswerKeys));
        const item: DynamicFormListItem = {id};
        const sensitiveAnswers: DynamicFormValues = {};
        for (const [key, answer] of Object.entries(getSubmittedAnswers(listField.itemFields, itemValues))) {
            if (sensitiveKeys.has(key)) {
                sensitiveAnswers[getListItemSensitiveKey(listKey, id, key)] = answer;
            } else {
                item[key] = answer;
            }
        }
        const savedItems = itemID ? items.map((existing) => (existing.id === id ? item : existing)) : [...items, item];
        const saveListAnswer = isSensitiveField(listField) ? saveSensitiveAnswers : saveDraftAnswers;
        saveListAnswer(formID, {[listKey]: savedItems});
        if (Object.keys(sensitiveAnswers).length > 0) {
            saveSensitiveAnswers(formID, sensitiveAnswers);
        }
        // The editor saves outside the list's input, so a list that asks for fresh requirements on change asks here, as a removal does through its input
        if (listField.refreshOnChange) {
            onRefreshRequirements?.(listKey, savedItems);
        }
        closeListItemEditor(listKey);
    };

    /** A sensitive list is kept in memory, so removing an entry is saved right away for the next entry added to build on. A drafted list is saved as it changes. */
    const changeListItems = (listKey: string, items: DynamicFormListItem[]) => {
        const listField = listFields.find((field) => field.key === listKey);
        if (!listField || !isSensitiveField(listField)) {
            return;
        }
        saveSensitiveAnswers(formID, {[listKey]: items});
        const removedSensitiveKeys = getRemovedListItemSensitiveKeys(listField, {...values, [listKey]: items});
        if (removedSensitiveKeys.length > 0) {
            forgetSensitiveAnswers(formID, removedSensitiveKeys);
        }
    };

    const goBack = () => {
        if (listItemPage) {
            closeListItemEditor(listItemPage.listKey);
            return;
        }
        if (isEditing) {
            returnTo(CONST.DYNAMIC_FORM.CONFIRMATION_PAGE_KEY);
            return;
        }
        if (pageIndex <= firstShownPageIndex) {
            clearSensitiveAnswers(formID);
            onBack();
            return;
        }
        prevPage();
    };

    // A flow on replaced routes has no page stack for Android's back to pop, so it takes the header's steps
    useAndroidBackButtonHandler(() => {
        goBack();
        return true;
    });

    // An entry editor highlights its list's step, and the confirmation page the last one
    const stepPage = shownPages.find((page) => page.key === currentPageName) ?? (listItemPage && findListPage(listItemPage.listKey));
    // The indicator draws no names and keys its steps by them, so the unique page keys stand in for titles an untitled page does not have
    const stepNames = [...shownPages.map((page) => page.key), ...(hasConfirmationPage ? [CONST.DYNAMIC_FORM.CONFIRMATION_PAGE_KEY] : [])];
    const stepPageIndex = stepPage ? shownPages.indexOf(stepPage) : -1;
    const stepIndex = stepPageIndex === -1 ? stepNames.length - 1 : stepPageIndex;
    const stepTitle = stepPage ? getPageTitle(stepPage, values, translate, allFields) : confirmationTitle;
    // The shell swaps its root when the indicator toggles, which remounts the page. So `auto` decides once, from the answers the draft held on arrival, and keeps it while the user types.
    const [isAutoStepIndicatorAsked, setIsAutoStepIndicatorAsked] = useState<boolean>();
    if (!isDraftLoading && isAutoStepIndicatorAsked === undefined) {
        setIsAutoStepIndicatorAsked(shownPages.length >= CONST.DYNAMIC_FORM.STEP_INDICATOR_MIN_PAGES);
    }
    const isStepIndicatorAsked = layout === 'auto' ? !!isAutoStepIndicatorAsked : layout === 'stepper';

    return (
        <DynamicFormShell
            testID={testID}
            headerTitle={headerTitle}
            onBackButtonPress={goBack}
            stepNames={stepNames}
            stepIndex={stepIndex}
            stepTitle={stepTitle || undefined}
            shouldShowStepIndicator={isStepIndicatorAsked && stepNames.length > 1}
        >
            {isDraftLoading || isRedirecting || isClearingEarlierVisit || isOnUnavailablePage || (!hasPageToShow && pages.length > 0) ? (
                <View style={[styles.flex1, styles.fullScreenLoading]}>
                    <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                </View>
            ) : (
                <CurrentPage
                    isEditing={isEditing}
                    isLastPage={!hasConfirmationPage && pageIndex === lastShownPageIndex}
                    currentPageName={currentPageName}
                    onNext={nextPage}
                    onMove={moveTo}
                    prevPage={prevPage}
                    formID={formID}
                    pages={pages}
                    allFields={allFields}
                    values={values}
                    currency={currency}
                    maxFileSize={maxFileSize}
                    onRefreshRequirements={onRefreshRequirements}
                    onPageSubmit={handlePageSubmit}
                    onOpenListItemEditor={openListItemEditor}
                    onListItemSave={saveListItem}
                    onListItemsChange={changeListItems}
                    confirmationTitle={confirmationTitle}
                    isSubmitting={isSubmitting}
                    submitError={submitError}
                />
            )}
        </DynamicFormShell>
    );
}

export default DynamicFormFlow;
