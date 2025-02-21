import {Str} from 'expensify-common';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import variables from '@styles/variables';
import * as CloseAccount from '@userActions/CloseAccount';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/CloseAccountForm';

function CloseAccountPage() {
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();

    const [isConfirmModalVisible, setConfirmModalVisibility] = useState(false);
    const [reasonForLeaving, setReasonForLeaving] = useState('');

    // If you are new to hooks this might look weird but basically it is something that only runs when the component unmounts
    // nothing runs on mount and we pass empty dependencies to prevent this from running on every re-render.
    // TODO: We should refactor this so that the data in instead passed directly as a prop instead of "side loading" the data
    // here, we left this as is during refactor to limit the breaking changes.
    useEffect(() => () => CloseAccount.clearError(), []);

    const hideConfirmModal = () => {
        setConfirmModalVisibility(false);
    };

    const onConfirm = () => {
        User.closeAccount(reasonForLeaving);
        hideConfirmModal();
    };

    const showConfirmModal = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM>) => {
        setConfirmModalVisibility(true);
        setReasonForLeaving(values.reasonForLeaving);
    };

    /**
     * Removes spaces and transform the input string to lowercase.
     * @param phoneOrEmail - The input string to be sanitized.
     * @returns The sanitized string
     */
    const sanitizePhoneOrEmail = (phoneOrEmail: string): string => phoneOrEmail.replace(/\s+/g, '').toLowerCase();

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM> => {
        const userEmailOrPhone = session?.email ? formatPhoneNumber(session.email) : null;
        const errors = ValidationUtils.getFieldRequiredErrors(values, ['phoneOrEmail']);

        if (values.phoneOrEmail && userEmailOrPhone && sanitizePhoneOrEmail(userEmailOrPhone) !== sanitizePhoneOrEmail(values.phoneOrEmail)) {
            errors.phoneOrEmail = translate('closeAccountPage.enterYourDefaultContactMethod');
        }
        return errors;
    };

    const userEmailOrPhone = session?.email ? formatPhoneNumber(session.email) : null;

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID={CloseAccountPage.displayName}
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={translate('closeAccountPage.closeAccount')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM}
                    validate={validate}
                    onSubmit={showConfirmModal}
                    submitButtonText={translate('closeAccountPage.closeAccount')}
                    style={[styles.flexGrow1, styles.mh5]}
                    isSubmitActionDangerous
                >
                    <View style={[styles.flexGrow1]}>
                        <Text>{translate('closeAccountPage.reasonForLeavingPrompt')}</Text>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.REASON_FOR_LEAVING}
                            autoGrowHeight
                            maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                            label={translate('closeAccountPage.enterMessageHere')}
                            aria-label={translate('closeAccountPage.enterMessageHere')}
                            role={CONST.ROLE.PRESENTATION}
                            containerStyles={[styles.mt5]}
                        />
                        <Text style={[styles.mt5]}>
                            {translate('closeAccountPage.enterDefaultContactToConfirm')} <Text style={[styles.textStrong]}>{userEmailOrPhone}</Text>
                        </Text>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.PHONE_OR_EMAIL}
                            autoCapitalize="none"
                            label={translate('closeAccountPage.enterDefaultContact')}
                            aria-label={translate('closeAccountPage.enterDefaultContact')}
                            role={CONST.ROLE.PRESENTATION}
                            containerStyles={[styles.mt5]}
                            autoCorrect={false}
                            inputMode={userEmailOrPhone && Str.isValidEmail(userEmailOrPhone) ? CONST.INPUT_MODE.EMAIL : CONST.INPUT_MODE.TEXT}
                        />
                        <ConfirmModal
                            danger
                            title={translate('closeAccountPage.closeAccountWarning')}
                            onConfirm={onConfirm}
                            onCancel={hideConfirmModal}
                            isVisible={isConfirmModalVisible}
                            prompt={translate('closeAccountPage.closeAccountPermanentlyDeleteData')}
                            confirmText={translate('common.yesContinue')}
                            cancelText={translate('common.cancel')}
                            shouldDisableConfirmButtonWhenOffline
                            shouldShowCancelButton
                        />
                    </View>
                </FormProvider>
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

CloseAccountPage.displayName = 'CloseAccountPage';

export default CloseAccountPage;
