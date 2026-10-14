import ActivityIndicator from '@components/ActivityIndicator';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {findLastPageIndex} from '@libs/SubPageUtils';

import {clearSensitiveAnswers, saveDraftAnswers, saveSensitiveAnswers} from '@userActions/DynamicForm';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DynamicFormPage} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import type {DynamicFormFlowProps, DynamicFormSubPageProps, DynamicFormValues} from './types';

import DynamicFormConfirmationPage from './components/DynamicFormConfirmationPage';
import DynamicFormFieldsPage from './components/DynamicFormFieldsPage';
import DynamicFormShell from './components/DynamicFormShell';
import getContentFields from './utils/getContentFields';
import getDynamicFieldErrors from './utils/getDynamicFieldErrors';
import getPageTitle, {isPageShown} from './utils/getPageTitle';
import getSubmittedAnswers, {getAnswerKeys} from './utils/getSubmittedAnswers';
import isSensitiveField from './utils/isSensitiveField';
import isSupportedField from './utils/isSupportedField';
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
    const shownPages = pages.filter((page) => isPageShown(page, values, allFields));
    const hasPageToShow = shownPages.length > 0;

    // useSubPage needs at least one page, so a form without pages gets the confirmation page
    const hasConfirmationPage = pages.length === 0 || hasConfirmation;
    const subPages = [
        ...pages.map((page) => ({pageName: page.key, component: DynamicFormFieldsPage})),
        ...(hasConfirmationPage ? [{pageName: CONST.DYNAMIC_FORM.CONFIRMATION_PAGE_KEY, component: DynamicFormConfirmationPage}] : []),
    ];
    // While nothing is shown no page is skipped, since useSubPage needs a page that is not skipped
    const skipPages = hasPageToShow ? pages.filter((page) => !shownPages.includes(page)).map((page) => page.key) : [];
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

    const isOnSkippedPage = !!currentPageName && skipPages.includes(currentPageName);
    const isOnUnavailablePage = !isDraftLoading && !isRedirecting && (!subPages.some((page) => page.pageName === currentPageName) || isOnSkippedPage);

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

    /** Typed answers are drafted as FormProvider cleaned them and inputs left untouched are drafted with their defaults, so the draft matches what the page validated. Sensitive answers go to memory only, and only the draft ones reach the screen. */
    const handlePageSubmit = (page: DynamicFormPage, pageValues: DynamicFormValues) => {
        const currentValues = {...values, ...pageValues};
        const pageFields = getContentFields(page.content).filter(isSupportedField);
        const answers = getSubmittedAnswers(pageFields, currentValues, allFields);
        const sensitiveKeys = new Set(pageFields.filter((field) => isSensitiveField(field)).flatMap((field) => getAnswerKeys(field)));
        const draftAnswers: DynamicFormValues = {};
        const sensitiveAnswers: DynamicFormValues = {};
        for (const [key, answer] of Object.entries(answers)) {
            if (sensitiveKeys.has(key)) {
                sensitiveAnswers[key] = answer;
            } else {
                draftAnswers[key] = answer;
            }
        }
        saveDraftAnswers(formID, draftAnswers);
        if (Object.keys(sensitiveAnswers).length > 0) {
            saveSensitiveAnswers(formID, sensitiveAnswers);
        }
        onPageSubmit?.(page, draftAnswers);
    };

    const goBack = () => {
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

    // The confirmation page highlights the last step
    const stepNames = [...shownPages.map((page) => getPageTitle(page, values, translate, allFields)), ...(hasConfirmationPage ? [translate('common.confirm')] : [])];
    const currentShownPageIndex = shownPages.findIndex((page) => page.key === currentPageName);
    const stepIndex = currentShownPageIndex === -1 ? stepNames.length - 1 : currentShownPageIndex;
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
            shouldShowStepIndicator={isStepIndicatorAsked && stepNames.length > 1}
        >
            {isDraftLoading || isRedirecting || isOnUnavailablePage || (!hasPageToShow && pages.length > 0) ? (
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
                    confirmationTitle={confirmationTitle}
                    isSubmitting={isSubmitting}
                    submitError={submitError}
                />
            )}
        </DynamicFormShell>
    );
}

export default DynamicFormFlow;
