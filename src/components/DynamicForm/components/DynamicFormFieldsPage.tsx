import type {DynamicFormSubPageProps} from '@components/DynamicForm/types';
import getContentFields from '@components/DynamicForm/utils/getContentFields';
import getDynamicFieldErrors from '@components/DynamicForm/utils/getDynamicFieldErrors';
import getLocalizedText from '@components/DynamicForm/utils/getLocalizedText';
import getPageTitle from '@components/DynamicForm/utils/getPageTitle';
import toDynamicFormValues from '@components/DynamicForm/utils/toDynamicFormValues';
import FormProvider from '@components/Form/FormProvider';
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
}: DynamicFormSubPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const page = pages.find((candidate) => candidate.key === currentPageName);
    if (!page) {
        return null;
    }
    const withInputValues = (inputValues: unknown) => ({...values, ...toDynamicFormValues(inputValues)});

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
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={styles.mb0}
            keyboardSubmitBehavior={CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY}
            // An offline request is saved to disk, so the last page submits only online, as the confirmation page does
            enabledWhenOffline={!isLastPage}
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
                            >
                                {title}
                            </Text>
                        )}
                        {!!description && <Text style={[styles.textSupporting, styles.mb3]}>{description}</Text>}
                        <DynamicFormFields
                            content={page.content}
                            allFields={allFields}
                            isTitledByPage={!hasOwnTitle}
                            values={currentValues}
                            currency={currency}
                            maxFileSize={maxFileSize}
                            onRefreshRequirements={onRefreshRequirements}
                            onOpenListItemEditor={onOpenListItemEditor}
                        />
                    </>
                );
            }}
        </FormProvider>
    );
}

export default DynamicFormFieldsPage;
