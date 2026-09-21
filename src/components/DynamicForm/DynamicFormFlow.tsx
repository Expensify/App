import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';

import Navigation from '@libs/Navigation/Navigation';

import type {OnyxFormKey} from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {DynamicFormField} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useEffect, useState} from 'react';

import type {DynamicFormPage as DynamicFormPageSchema} from './groupFieldsIntoPages';
import type {DynamicFormValues} from './types';

import DynamicFormPage from './DynamicFormPage';
import DynamicFormShell from './DynamicFormShell';
import formatDynamicFieldValue from './formatDynamicFieldValue';
import {getFieldLabel} from './getInputComponentForField';
import groupFieldsIntoPages from './groupFieldsIntoPages';
import isFieldVisible from './isFieldVisible';

const CONFIRM_PAGE = 'confirm';

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
    const [pageAnswers, setPageAnswers] = useState<DynamicFormValues>({});
    const groupPages = groupFieldsIntoPages(fields);
    const pages = [...groupPages.map((page) => ({pageName: page.slug, component: EmptyPage})), {pageName: CONFIRM_PAGE, component: EmptyPage}];
    const draftValues: DynamicFormValues = {...draft, ...pageAnswers};
    const hasVisibleField = (page: DynamicFormPageSchema) => page.fields.some((field) => isFieldVisible(field, draftValues));
    const skipPages = groupPages.filter((page) => !hasVisibleField(page)).map((page) => page.slug);

    const {isEditing, nextPage, prevPage, pageIndex, moveTo, currentPageName, isRedirecting} = useSubPage({
        pages,
        skipPages,
        onFinished: () => onSubmit(draftValues),
        buildRoute,
    });

    const isCurrentPageSkipped = !!currentPageName && skipPages.includes(currentPageName);
    const pageNames = pages.map((page) => page.pageName);
    const nextShownIndex = pageNames.findIndex((name, index) => index > pageIndex && !skipPages.includes(name));
    const previousShownIndex = pageNames.findLastIndex((name, index) => index < pageIndex && !skipPages.includes(name));
    const redirectIndex = isCurrentPageSkipped && !isRedirecting && !isLoadingOnyxValue(draftMetadata) ? Math.max(nextShownIndex, previousShownIndex) : -1;
    useEffect(() => {
        if (redirectIndex === -1) {
            return;
        }
        moveTo(redirectIndex, false);
    }, [redirectIndex, moveTo]);

    const goBackToConfirmation = () => Navigation.goBack(buildRoute(CONFIRM_PAGE));

    const currentGroupPage = groupPages.find((page) => page.slug === currentPageName);

    const handleBackButtonPress = () => {
        if (isEditing) {
            goBackToConfirmation();
            return;
        }
        if (pageIndex === 0) {
            onBack();
            return;
        }
        prevPage();
    };

    const handleNext = (values: DynamicFormValues) => {
        setPageAnswers((previous) => ({...previous, ...values}));
        if (currentGroupPage) {
            onPageSubmit?.(currentGroupPage, values);
        }
        if (isEditing) {
            goBackToConfirmation();
            return;
        }
        nextPage();
    };

    const isConfirmationPage = currentPageName === CONFIRM_PAGE;
    const visibleGroupPages = groupPages.filter(hasVisibleField);
    const stepNames = visibleGroupPages.map((page) => page.name);
    const stepIndex = currentGroupPage ? Math.max(0, visibleGroupPages.indexOf(currentGroupPage)) : stepNames.length - 1;

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

    const isLoading = isRedirecting || isCurrentPageSkipped || isLoadingOnyxValue(draftMetadata) || (!currentGroupPage && !isConfirmationPage);

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
            />
        );
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
