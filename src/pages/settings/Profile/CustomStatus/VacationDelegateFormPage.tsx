import DelegatorList from '@components/DelegatorList';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import VacationDelegateForm from '@components/VacationDelegateForm';

import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDraftValues} from '@libs/actions/FormActions';
import {clearVacationDelegateError, deleteVacationDelegate, setVacationDelegate} from '@libs/actions/VacationDelegate';
import getVacationDelegateErrors from '@libs/getVacationDelegateErrors';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {useNavigation} from '@react-navigation/native';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';

function goBackToProfile() {
    clearDraftValues(ONYXKEYS.FORMS.VACATION_DELEGATE_FORM);
    Navigation.goBack(ROUTES.SETTINGS_PROFILE.route);
}

// Pops only this form, so a member picker opened straight from Profile is shown again.
function goBack() {
    clearDraftValues(ONYXKEYS.FORMS.VACATION_DELEGATE_FORM);
    Navigation.goBack();
}

function VacationDelegateFormPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const {showConfirmModal} = useConfirmModal();
    const navigation = useNavigation();

    const [vacationDelegate] = useOnyx(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
    const hasActiveDelegations = !!vacationDelegate?.delegatorFor?.length;

    const isSubmittingRef = useRef(false);
    // Drives the Save spinner and stays on until the error modal is dismissed, so the modal is the only place a save error shows
    const [isSaving, setIsSaving] = useState(false);

    const showErrorModal = async (delegateToRestore?: string, clearAfterToRestore?: string, message?: string) => {
        await showConfirmModal({
            title: translate('statusPage.addVacationDelegate'),
            prompt: message ?? translate('statusPage.vacationDelegateError'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });

        clearVacationDelegateError(delegateToRestore, clearAfterToRestore);
    };

    const onSubmit = (delegate: string, clearAfter: string | undefined) => {
        if (isSubmittingRef.current) {
            return;
        }

        const hasUnconfirmedChange = !!vacationDelegate?.pendingAction || !isEmptyObject(vacationDelegate?.errors) || !!vacationDelegate?.policyDiff;
        const currentDelegate = hasUnconfirmedChange ? vacationDelegate?.previousDelegate : vacationDelegate?.delegate;
        const currentClearAfter = hasUnconfirmedChange ? vacationDelegate?.previousClearAfter : vacationDelegate?.clearAfter;

        // Only the clear after date or time changed. The delegate was already accepted, so there's no policy diff to read, and a queued
        // write keeps the change optimistic offline instead of failing a one-off request.
        if (delegate === vacationDelegate?.delegate) {
            setVacationDelegate({creator: currentUserLogin, delegate, clearAfter, currentDelegate, currentClearAfter, shouldOverridePolicyDiffWarning: true});
            goBackToProfile();
            return;
        }

        isSubmittingRef.current = true;
        setIsSaving(true);
        setVacationDelegate({creator: currentUserLogin, delegate, clearAfter, currentDelegate, currentClearAfter})
            .then(async (response) => {
                if (!navigation.isFocused()) {
                    if (response?.data?.policyDiff) {
                        clearVacationDelegateError(currentDelegate, currentClearAfter);
                    }
                    return;
                }

                if (response?.data?.policyDiff) {
                    Navigation.navigate(ROUTES.SETTINGS_VACATION_DELEGATE_MISSING_WORKSPACES);
                    return;
                }

                // The action leaves the failure on the NVP for the profile page's red brick road, but the user is still on this screen,
                // so report it where they are. Dismissing the modal restores the previous delegate, exactly as dismissing that error would.
                if (response?.jsonCode !== CONST.JSON_CODE.SUCCESS) {
                    // Awaited so the spinner and the hidden inline error last until the modal is dismissed
                    await showErrorModal(currentDelegate, currentClearAfter, response?.jsonCode === CONST.JSON_CODE.EXP_ERROR ? response.message : undefined);
                    return;
                }

                goBackToProfile();
            })
            .catch(async () => {
                if (!navigation.isFocused()) {
                    clearVacationDelegateError(currentDelegate, currentClearAfter);
                    return;
                }

                await showErrorModal(currentDelegate, currentClearAfter);
            })
            .finally(() => {
                isSubmittingRef.current = false;
                setIsSaving(false);
            });
    };

    const onRemove = () => {
        deleteVacationDelegate(vacationDelegate);
        goBackToProfile();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID="VacationDelegateFormPage"
            shouldEnableMaxHeight
        >
            <HeaderWithBackButtonAndTitle
                title={translate('common.vacationDelegate')}
                onBackButtonPress={goBack}
            />
            {/* While the user is someone else's delegate, they can't change their own, same as on the member picker */}
            {hasActiveDelegations ? (
                <View style={styles.mt6}>
                    <DelegatorList
                        delegators={vacationDelegate?.delegatorFor}
                        message={translate('statusPage.cannotSetVacationDelegate')}
                    />
                </View>
            ) : (
                <VacationDelegateForm
                    vacationDelegate={vacationDelegate}
                    description={translate('statusPage.setVacationDelegate')}
                    onChangeDelegate={() => Navigation.navigate(ROUTES.SETTINGS_VACATION_DELEGATE_SELECT)}
                    onSubmit={onSubmit}
                    onRemove={onRemove}
                    errors={isSaving ? undefined : getVacationDelegateErrors(vacationDelegate)}
                    pendingAction={vacationDelegate?.pendingAction}
                    isLoading={isSaving}
                    onCloseError={() => clearVacationDelegateError(vacationDelegate?.previousDelegate, vacationDelegate?.previousClearAfter)}
                />
            )}
        </ScreenWrapper>
    );
}

export default VacationDelegateFormPage;
