import {getMicroSecondOnyxErrorWithMessage} from '@libs/ErrorUtils';

import Navigation from '@navigation/Navigation';

import {clearErrorFields, clearErrors, setErrorFields} from '@userActions/FormActions';
import {AddWorkspaceWorkEmail} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/AddWorkEmailForm';

import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';

import useLocalize from './useLocalize';

type AddWorkspaceWorkEmailResponse = Awaited<ReturnType<typeof AddWorkspaceWorkEmail>>;

function getShouldValidateWorkspaceWorkEmail(response: AddWorkspaceWorkEmailResponse) {
    const onboardingUpdate = response?.onyxData?.find((update) => (update.key as string) === ONYXKEYS.NVP_ONBOARDING);
    const onboardingValues = onboardingUpdate?.value;

    if (!onboardingValues || typeof onboardingValues !== 'object' || !('shouldValidate' in onboardingValues) || typeof onboardingValues.shouldValidate !== 'boolean') {
        return undefined;
    }

    return onboardingValues.shouldValidate;
}

function useAddWorkspaceWorkEmailForm() {
    const {translate} = useLocalize();

    useFocusEffect(
        useCallback(() => {
            clearErrors(ONYXKEYS.FORMS.ADD_WORK_EMAIL_FORM);
            clearErrorFields(ONYXKEYS.FORMS.ADD_WORK_EMAIL_FORM);
        }, []),
    );

    const setAddWorkEmailError = useCallback((errorMessage: string) => {
        setErrorFields(ONYXKEYS.FORMS.ADD_WORK_EMAIL_FORM, {
            [INPUT_IDS.EMAIL]: getMicroSecondOnyxErrorWithMessage(errorMessage),
        });
    }, []);

    const getAddWorkEmailErrorMessage = useCallback(
        (response: AddWorkspaceWorkEmailResponse, submittedEmail: string) => {
            if (response?.message?.includes(CONST.MERGE_ACCOUNT_2FA_ERROR)) {
                return translate('onboarding.workEmail2FAError');
            }

            if (response?.message?.includes(CONST.MERGE_ACCOUNT_SINGLE_SIGN_ON_ERROR)) {
                return translate('onboarding.singleSignOnError');
            }

            if (response?.message === CONST.WORK_ACCOUNT_CLOSED_ERROR || response?.title === CONST.WORK_ACCOUNT_CLOSED_ERROR) {
                return translate('onboarding.mergeBlockScreen.workAccountClosedSubtitle');
            }

            return translate('onboarding.mergeBlockScreen.subtitle', submittedEmail);
        },
        [translate],
    );

    const submitAddWorkspaceWorkEmail = useCallback(
        (submittedEmail: string, verifyWorkEmailRoute: Route, onWorkEmailAdded: () => void) => {
            AddWorkspaceWorkEmail(submittedEmail)
                .then((response) => {
                    if (response?.jsonCode === CONST.JSON_CODE.EXP_ERROR) {
                        setAddWorkEmailError(getAddWorkEmailErrorMessage(response, submittedEmail));
                        return;
                    }

                    const shouldValidate = getShouldValidateWorkspaceWorkEmail(response);
                    if (shouldValidate) {
                        Navigation.navigate(verifyWorkEmailRoute);
                        return;
                    }

                    if (shouldValidate === false) {
                        onWorkEmailAdded();
                        return;
                    }

                    setAddWorkEmailError(translate('common.genericErrorMessage'));
                })
                .catch(() => {
                    setAddWorkEmailError(translate('common.genericErrorMessage'));
                });
        },
        [getAddWorkEmailErrorMessage, setAddWorkEmailError, translate],
    );

    return {setAddWorkEmailError, submitAddWorkspaceWorkEmail};
}

export default useAddWorkspaceWorkEmailForm;
