import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';

import Navigation from '@libs/Navigation/Navigation';

import {clearSensitiveAnswers, saveDraftAnswers, saveSensitiveAnswers} from '@userActions/DynamicForm';

import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useEffect} from 'react';

import type {DynamicFormFlowProps, DynamicFormSubPageProps, DynamicFormValues} from './types';
import type {DynamicFormGroup} from './utils/groupFieldsIntoPages';

import DynamicFormConfirmationPage from './components/DynamicFormConfirmationPage';
import DynamicFormFields from './components/DynamicFormFields';
import DynamicFormGroupPage from './components/DynamicFormGroupPage';
import getDynamicFieldErrors, {isAnswered} from './utils/getDynamicFieldErrors';
import getSubmittedAnswers from './utils/getSubmittedAnswers';
import getVisibleFields from './utils/getVisibleFields';
import groupFieldsIntoPages, {CONFIRMATION_PAGE_SLUG} from './utils/groupFieldsIntoPages';
import isSensitiveField from './utils/isSensitiveField';
import isSupportedField from './utils/isSupportedField';
import toDynamicFormValues from './utils/toDynamicFormValues';

/** A whole dynamic form: one page per group, skipping pages with nothing to ask, then a confirmation page */
function DynamicFormFlow({
    fields: schemaFields,
    formID,
    headerTitle,
    confirmationTitle,
    testID,
    buildRoute,
    shouldReplaceRoute,
    onSubmit,
    onGroupSubmit,
    onBack,
    currency,
    onRefreshRequirements,
    isSubmitting,
    submitError,
}: DynamicFormFlowProps) {
    const {translate} = useLocalize();
    const [draft, draftMetadata] = useOnyx(`${formID}Draft`);
    const [sensitiveAnswersByForm] = useOnyx(ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS);
    const isDraftLoading = isLoadingOnyxValue(draftMetadata);
    const draftValues = toDynamicFormValues(draft);
    const values: DynamicFormValues = {...draftValues, ...sensitiveAnswersByForm?.[formID]};

    const fields = schemaFields.filter(isSupportedField);
    const groups = groupFieldsIntoPages(fields);
    const pages = [...groups.map((group) => ({pageName: group.slug, component: DynamicFormGroupPage})), {pageName: CONFIRMATION_PAGE_SLUG, component: DynamicFormConfirmationPage}];
    const skipPages = groups.filter((group) => getVisibleFields(group.fields, values, fields).length === 0).map((group) => group.slug);
    const firstShownPageIndex = pages.findIndex((page) => !skipPages.includes(page.pageName));
    const getFirstIncompleteGroupIndex = (answers: DynamicFormValues) => groups.findIndex((group) => Object.keys(getDynamicFieldErrors(group.fields, answers, translate, fields)).length > 0);

    // A visit opened without a page in the URL drops the sensitive answers of earlier visits, so it starts from what the draft holds
    let startFrom = firstShownPageIndex;
    if (isDraftLoading) {
        startFrom = -1;
    } else if (Object.values(draftValues).some((value) => isAnswered(value))) {
        const firstIncompleteIndex = getFirstIncompleteGroupIndex(draftValues);
        startFrom = firstIncompleteIndex === -1 ? groups.length : firstIncompleteIndex;
    }

    const {CurrentPage, isEditing, currentPageName, pageIndex, nextPage, prevPage, moveTo, resetToPage, isRedirecting} = useSubPage<DynamicFormSubPageProps>({
        pages,
        skipPages,
        startFrom,
        buildRoute,
        shouldReplaceRoute,
        onFinished: submitIfComplete,
    });

    /** The confirmation page can be opened by URL before every page is answered, so an incomplete form goes back to its first gap instead */
    function submitIfComplete() {
        const firstIncompleteIndex = getFirstIncompleteGroupIndex(values);
        const incompleteGroup = firstIncompleteIndex === -1 ? undefined : groups.at(firstIncompleteIndex);
        if (incompleteGroup) {
            resetToPage(incompleteGroup.slug);
            return;
        }
        onSubmit(getSubmittedAnswers(fields, values));
    }

    const isOnUnavailablePage = !isDraftLoading && !isRedirecting && (!pages.some((page) => page.pageName === currentPageName) || skipPages.some((pageName) => pageName === currentPageName));

    useEffect(() => {
        if (!isRedirecting) {
            return;
        }
        clearSensitiveAnswers(formID);
    }, [isRedirecting, formID]);

    // A stale link, or a page the answers now skip, opens where a new visit would start
    useEffect(() => {
        if (!isOnUnavailablePage) {
            return;
        }
        resetToPage(pages.at(startFrom)?.pageName);
    }, [isOnUnavailablePage, resetToPage, pages, startFrom]);

    /** Typed answers are drafted as FormProvider cleaned them and inputs left untouched are drafted with their defaults, so the draft matches what the page validated */
    const handleGroupSubmit = (group: DynamicFormGroup, pageValues: DynamicFormValues) => {
        const answers = getSubmittedAnswers(group.fields, {...values, ...pageValues}, fields);
        const sensitiveKeys = new Set(group.fields.filter(isSensitiveField).map((field) => field.key));
        const draftAnswers: DynamicFormValues = {};
        const sensitiveAnswers: Record<string, string> = {};
        for (const [key, answer] of Object.entries(answers)) {
            if (sensitiveKeys.has(key) && typeof answer === 'string') {
                sensitiveAnswers[key] = answer;
            } else {
                draftAnswers[key] = answer;
            }
        }
        saveDraftAnswers(formID, draftAnswers);
        if (Object.keys(sensitiveAnswers).length > 0) {
            saveSensitiveAnswers(formID, sensitiveAnswers);
        }
        onGroupSubmit?.(group, answers);
    };

    const goBack = () => {
        if (isEditing) {
            // Replaced routes leave nothing in the stack to go back to
            if (shouldReplaceRoute) {
                resetToPage(CONFIRMATION_PAGE_SLUG);
                return;
            }
            Navigation.goBack(buildRoute(CONFIRMATION_PAGE_SLUG));
            return;
        }
        if (pageIndex <= firstShownPageIndex) {
            clearSensitiveAnswers(formID);
            onBack();
            return;
        }
        prevPage();
    };

    return (
        <ScreenWrapper
            testID={testID}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButtonAndTitle
                title={headerTitle}
                onBackButtonPress={goBack}
            />
            {isDraftLoading || isRedirecting || isOnUnavailablePage ? (
                <FullscreenLoadingIndicator />
            ) : (
                <CurrentPage
                    isEditing={isEditing}
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
                    confirmationTitle={confirmationTitle}
                    isSubmitting={isSubmitting}
                    submitError={submitError}
                />
            )}
        </ScreenWrapper>
    );
}

export default DynamicFormFlow;
export {DynamicFormFields, getDynamicFieldErrors};
