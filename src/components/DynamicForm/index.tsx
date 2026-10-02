import type {FormValue} from '@components/Form/types';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';

import Navigation from '@libs/Navigation/Navigation';

import {clearSensitiveAnswers, saveSensitiveAnswers} from '@userActions/DynamicForm';

import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxFormKey} from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {DynamicFormField} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React from 'react';

import type {DynamicFormSubPageProps, DynamicFormValues} from './types';
import type {DynamicFormGroup} from './utils/groupFieldsIntoPages';

import DynamicFormConfirmationPage from './components/DynamicFormConfirmationPage';
import DynamicFormFields from './components/DynamicFormFields';
import DynamicFormGroupPage from './components/DynamicFormGroupPage';
import getDynamicFieldErrors from './utils/getDynamicFieldErrors';
import getFirstIncompleteGroupIndex from './utils/getFirstIncompleteGroupIndex';
import getSubmittedAnswers from './utils/getSubmittedAnswers';
import getVisibleFields from './utils/getVisibleFields';
import groupFieldsIntoPages, {CONFIRMATION_PAGE_SLUG} from './utils/groupFieldsIntoPages';
import toDynamicFormValues from './utils/toDynamicFormValues';

type DynamicFormFlowProps = {
    fields: DynamicFormField[];

    /** The form whose draft holds the answers. Sensitive answers stay in memory instead. */
    formID: OnyxFormKey;

    headerTitle: string;
    confirmationTitle: string;
    testID: string;

    /** Route of a page. The flow passes `edit` when the user opens a page from the confirmation page. */
    buildRoute: (pageName: string, action?: 'edit') => Route;

    /** Replace the route on each page change instead of pushing one, for flows on dynamic routes */
    shouldReplaceRoute?: boolean;

    /** Receives the answers to every visible field, sensitive ones included. Call clearSensitiveAnswers once the submission succeeds. */
    onSubmit: (answers: DynamicFormValues) => void;

    /** Receives a page's answers when the user leaves it with Next, for flows that save each page */
    onGroupSubmit?: (group: DynamicFormGroup, answers: DynamicFormValues) => void;

    /** Leaves the flow from its first page */
    onBack: () => void;

    /** Currency of amount fields that let the user pick none */
    currency?: string;

    /** Called when the user changes a field marked `refreshRequirementsOnChange`, so the screen can fetch the schema again */
    onRefreshRequirements?: (inputID: string, value: FormValue) => void;

    isSubmitting?: boolean;
    submitError?: string;
};

function hasAnyAnswer(values: DynamicFormValues): boolean {
    return Object.values(values).some((value) => value !== '' && !(Array.isArray(value) && value.length === 0));
}

/** A whole dynamic form: one page per group, skipping pages with nothing to ask, then a confirmation page */
function DynamicFormFlow({
    fields,
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
    const values: DynamicFormValues = {...toDynamicFormValues(draft), ...sensitiveAnswersByForm?.[formID]};

    const groups = groupFieldsIntoPages(fields);
    const pages = [...groups.map((group) => ({pageName: group.slug, component: DynamicFormGroupPage})), {pageName: CONFIRMATION_PAGE_SLUG, component: DynamicFormConfirmationPage}];
    const skipPages = groups.filter((group) => getVisibleFields(group.fields, values).length === 0).map((group) => group.slug);
    const firstIncompleteIndex = getFirstIncompleteGroupIndex(groups, values, translate);

    let startFrom = 0;
    if (isDraftLoading) {
        startFrom = -1;
    } else if (hasAnyAnswer(values)) {
        startFrom = firstIncompleteIndex === -1 ? groups.length : firstIncompleteIndex;
    }

    /** The confirmation page can be opened by URL before every page is answered, so an incomplete form goes back to its first gap instead */
    const submitIfComplete = () => {
        const incompleteGroup = groups.at(firstIncompleteIndex);
        if (firstIncompleteIndex !== -1 && incompleteGroup) {
            Navigation.navigate(buildRoute(incompleteGroup.slug));
            return;
        }
        onSubmit(getSubmittedAnswers(fields, values));
    };

    const {CurrentPage, isEditing, currentPageName, pageIndex, nextPage, prevPage, moveTo, isRedirecting} = useSubPage<DynamicFormSubPageProps>({
        pages,
        skipPages,
        startFrom,
        buildRoute,
        shouldReplaceRoute,
        onFinished: submitIfComplete,
    });

    const handleGroupSubmit = (group: DynamicFormGroup, answers: DynamicFormValues) => {
        const sensitiveAnswers = Object.fromEntries(
            group.fields.flatMap((field) => {
                const answer = answers[field.key];
                return field.sensitive && typeof answer === 'string' ? [[field.key, answer]] : [];
            }),
        );
        if (Object.keys(sensitiveAnswers).length > 0) {
            saveSensitiveAnswers(formID, sensitiveAnswers);
        }
        onGroupSubmit?.(group, answers);
    };

    const firstShownPageIndex = pages.findIndex((page) => !skipPages.includes(page.pageName));
    const goBack = () => {
        if (isEditing) {
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
            {isDraftLoading || isRedirecting ? (
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
