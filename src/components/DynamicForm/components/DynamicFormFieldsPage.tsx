import DotIndicatorMessage from '@components/DotIndicatorMessage';
import type {DynamicFormSubPageProps, DynamicFormValues} from '@components/DynamicForm/types';
import getContentFields from '@components/DynamicForm/utils/getContentFields';
import getDynamicFieldErrors from '@components/DynamicForm/utils/getDynamicFieldErrors';
import getLocalizedText from '@components/DynamicForm/utils/getLocalizedText';
import getPageTitle from '@components/DynamicForm/utils/getPageTitle';
import isSensitiveField from '@components/DynamicForm/utils/isSensitiveField';
import toDynamicFormValues from '@components/DynamicForm/utils/toDynamicFormValues';
import FormProvider from '@components/Form/FormProvider';
import Text from '@components/Text';

import useAccessibilityAnnouncement from '@hooks/useAccessibilityAnnouncement';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React, {useEffect, useRef, useState} from 'react';

import DynamicFormFields from './DynamicFormFields';

/** One page of a dynamic form flow: its title and description, its fields and a Next button */
function DynamicFormFieldsPage({
    currentPageName,
    isEditing,
    isLastPage,
    onNext,
    formID,
    pages,
    allFields,
    values,
    currency,
    maxFileSize,
    onRefreshRequirements,
    onPageSubmit,
    onOpenListItemEditor,
    onListItemsChange,
    isSubmitting,
    submitError,
    isSavingPage,
    pageSaveError,
}: DynamicFormSubPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    // A flow that passes isSavingPage moves on only once the page is saved, and keeps the user on the page with the error when the save fails
    const [pendingPageValues, setPendingPageValues] = useState<DynamicFormValues>();
    const [hasSaveStarted, setHasSaveStarted] = useState(false);
    const [hasSaveFailed, setHasSaveFailed] = useState(false);
    const [savedPageValues, setSavedPageValues] = useState<DynamicFormValues>();
    if (pendingPageValues && isSavingPage && !hasSaveStarted) {
        setHasSaveStarted(true);
    }
    if (pendingPageValues && hasSaveStarted && !isSavingPage) {
        setPendingPageValues(undefined);
        setHasSaveStarted(false);
        if (pageSaveError) {
            setHasSaveFailed(true);
        } else {
            setSavedPageValues(pendingPageValues);
        }
    }

    // onNext changes on every render, so the saved page is advanced from once
    const advancedPageValuesRef = useRef<DynamicFormValues | undefined>(undefined);
    useEffect(() => {
        if (!savedPageValues || advancedPageValuesRef.current === savedPageValues) {
            return;
        }
        advancedPageValuesRef.current = savedPageValues;
        onNext(savedPageValues);
    }, [savedPageValues, onNext]);
    const footerError = isLastPage && submitError ? submitError : hasSaveFailed && pageSaveError;
    const page = pages.find((candidate) => candidate.key === currentPageName);
    // VoiceOver ignores the error's live region, so the error is announced as it appears, as on the confirmation page
    useAccessibilityAnnouncement(submitError, !!isLastPage && !!submitError, {shouldAnnounceOnNative: true});
    if (!page) {
        return null;
    }
    // A sensitive list lives in memory, which the editor page and a removal update, so the form's own copy of it may be stale
    const pageKeys = new Set(getContentFields(page.content).map((field) => field.key));
    const memoryListValues = Object.fromEntries(
        allFields.filter((field) => field.type === 'list' && isSensitiveField(field) && pageKeys.has(field.key)).map((field) => [field.key, values[field.key]]),
    );
    const withInputValues = (inputValues: unknown) => ({...values, ...toDynamicFormValues(inputValues), ...memoryListValues});

    return (
        <FormProvider
            formID={formID}
            submitButtonText={translate(isEditing || isLastPage ? 'common.confirm' : 'common.next')}
            validate={(inputValues) => getDynamicFieldErrors(getContentFields(page.content), withInputValues(inputValues), translate, allFields)}
            onSubmit={(inputValues) => {
                const pageValues = toDynamicFormValues(inputValues);
                onPageSubmit(page, pageValues);
                if (isSavingPage === undefined) {
                    onNext(pageValues);
                    return;
                }
                setHasSaveFailed(false);
                setPendingPageValues(pageValues);
            }}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={styles.mb0}
            keyboardSubmitBehavior={CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY}
            // An offline request is saved to disk, so the last page submits only online, as the confirmation page does
            enabledWhenOffline={!isLastPage}
            // Without a confirmation page the last page sends the form, so it shows the request's progress and error as the confirmation page does
            isLoading={(isLastPage && !!isSubmitting) || !!pendingPageValues}
            footerContent={
                footerError ? (
                    <DotIndicatorMessage
                        textStyles={[styles.formError]}
                        type="error"
                        messages={{error: footerError}}
                    />
                ) : undefined
            }
            shouldRenderFooterAboveSubmit
        >
            {({inputValues}) => {
                const currentValues = withInputValues(inputValues);
                const title = getPageTitle(page, currentValues, translate, allFields);
                const hasOwnTitle = !!getLocalizedText(translate, page.titleKey, page.title);
                const description = getLocalizedText(translate, page.descriptionKey, page.description);
                return (
                    <>
                        {!!title && (
                            <Text
                                style={[styles.textHeadlineLineHeightXXL, styles.mb3]}
                                accessibilityRole={CONST.ROLE.HEADER}
                                aria-level={2}
                            >
                                {title}
                            </Text>
                        )}
                        {!!description && <Text style={[styles.textSupporting, styles.mb3]}>{description}</Text>}
                        <DynamicFormFields
                            content={page.content}
                            allFields={allFields}
                            isLoneFieldInHeadline={!hasOwnTitle}
                            values={currentValues}
                            currency={currency}
                            maxFileSize={maxFileSize}
                            onRefreshRequirements={onRefreshRequirements}
                            onOpenListItemEditor={onOpenListItemEditor}
                            onListItemsChange={onListItemsChange}
                        />
                    </>
                );
            }}
        </FormProvider>
    );
}

export default DynamicFormFieldsPage;
