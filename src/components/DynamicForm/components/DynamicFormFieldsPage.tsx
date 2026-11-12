import type {DynamicFormSubPageProps} from '@components/DynamicForm/types';
import getContentFields from '@components/DynamicForm/utils/getContentFields';
import getDynamicFieldErrors from '@components/DynamicForm/utils/getDynamicFieldErrors';
import getLocalizedText from '@components/DynamicForm/utils/getLocalizedText';
import getPageTitle from '@components/DynamicForm/utils/getPageTitle';
import isSensitiveField from '@components/DynamicForm/utils/isSensitiveField';
import toDynamicFormValues from '@components/DynamicForm/utils/toDynamicFormValues';
import FormProvider from '@components/Form/FormProvider';
import FormHelpMessage from '@components/FormHelpMessage';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

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
    isRefreshingRequirements,
    refreshError,
    shouldDisableNextWhenOffline,
}: DynamicFormSubPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const page = pages.find((candidate) => candidate.key === currentPageName);
    const pageError = (isLastPage ? submitError : undefined) ?? refreshError;
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
                onNext(pageValues);
            }}
            style={[styles.mh5, styles.flexGrow1, styles.mt3]}
            submitButtonStyles={styles.mb0}
            keyboardSubmitBehavior={CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY}
            // An offline request is saved to disk, so the last page submits only online, as the confirmation page does. A flow that saves each page asks for it on every page.
            enabledWhenOffline={!isLastPage && !shouldDisableNextWhenOffline}
            // Without a confirmation page the last page sends the form, so it shows the request's progress and error as the confirmation page does.
            // A refresh can change the fields on any page, so Next waits for it everywhere.
            isLoading={(isLastPage && !!isSubmitting) || !!isRefreshingRequirements}
            footerContent={
                // Same message and spacing as the form's own alert, so an error from the server looks like one found locally. It announces itself.
                pageError ? (
                    <FormHelpMessage
                        message={pageError}
                        style={styles.mb3}
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
                                style={[styles.textHeadlineLineHeightXXL, description ? styles.mb3 : styles.mb6]}
                                accessibilityRole={CONST.ROLE.HEADER}
                                aria-level={2}
                            >
                                {title}
                            </Text>
                        )}
                        {!!description && <Text style={[styles.textSupporting, styles.mb6]}>{description}</Text>}
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
                            isRefreshingRequirements={isRefreshingRequirements}
                        />
                    </>
                );
            }}
        </FormProvider>
    );
}

export default DynamicFormFieldsPage;
