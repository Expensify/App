import type {DynamicFormSubPageProps} from '@components/DynamicForm/types';
import getDynamicFieldErrors from '@components/DynamicForm/utils/getDynamicFieldErrors';
import {getGroupTitle} from '@components/DynamicForm/utils/groupFieldsIntoPages';
import toDynamicFormValues from '@components/DynamicForm/utils/toDynamicFormValues';
import FormProvider from '@components/Form/FormProvider';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

import DynamicFormFields from './DynamicFormFields';

/** One page of a dynamic form flow: the group's title, its fields and a Next button */
function DynamicFormGroupPage({currentPageName, isEditing, onNext, formID, fields, groups, values, currency, onRefreshRequirements, onGroupSubmit}: DynamicFormSubPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const group = groups.find((candidate) => candidate.slug === currentPageName);
    if (!group) {
        return null;
    }
    const title = getGroupTitle(group, translate);
    const withInputValues = (inputValues: unknown) => ({...values, ...toDynamicFormValues(inputValues)});

    return (
        <FormProvider
            formID={formID}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={(inputValues) => getDynamicFieldErrors(group.fields, withInputValues(inputValues), translate, fields)}
            onSubmit={(inputValues) => {
                onGroupSubmit(group, toDynamicFormValues(inputValues));
                onNext();
            }}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={styles.mb0}
            keyboardSubmitBehavior={CONST.KEYBOARD_SUBMIT_BEHAVIOR.SUBMIT_ONLY}
            enabledWhenOffline
        >
            {({inputValues}) => (
                <>
                    {!!title && <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{title}</Text>}
                    <DynamicFormFields
                        fields={group.fields}
                        allFields={fields}
                        values={withInputValues(inputValues)}
                        currency={currency}
                        onRefreshRequirements={onRefreshRequirements}
                    />
                </>
            )}
        </FormProvider>
    );
}

export default DynamicFormGroupPage;
