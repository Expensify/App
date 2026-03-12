import React, {useEffect, useRef} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage} from '@libs/ErrorUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isValidEmail} from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {AddWorkEmail} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/AddWorkEmailForm';
import type {Errors} from '@src/types/onyx/OnyxCommon';

type WorkspaceCompanyCardAddWorkEmailPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARD_ADD_WORK_EMAIL>;

function WorkspaceCompanyCardAddWorkEmailPage({route}: WorkspaceCompanyCardAddWorkEmailPageProps) {
    const {policyID, feed} = route.params;
    const primaryContactMethod = usePrimaryContactMethod();

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [email, setEmail] = React.useState('');

    const emailInputRef = useRef<AnimatedTextInputRef>(null);

    const handleSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_WORK_EMAIL_FORM>) => {
        AddWorkEmail(values[INPUT_IDS.EMAIL]);
        setEmail(values[INPUT_IDS.EMAIL]);
    };

    useEffect(() => {
        if (!email || !primaryContactMethod || primaryContactMethod !== email) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARD_VERIFY_WORK_EMAIL.getRoute(policyID, feed));
    }, [primaryContactMethod, email, policyID, feed]);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_WORK_EMAIL_FORM>): Errors => {
        const errors = {};

        if (!values.email) {
            addErrorMessage(errors, 'email', translate('common.error.fieldRequired'));
        } else if (values.email.length > CONST.LOGIN_CHARACTER_LIMIT) {
            addErrorMessage(errors, 'email', translate('common.error.characterLimitExceedCounter', values.email.length, CONST.LOGIN_CHARACTER_LIMIT));
        }

        const isEmailInvalid = !!values.email && !isValidEmail(values.email);

        if (isEmailInvalid) {
            addErrorMessage(errors, 'email', translate('messages.errorMessageInvalidEmail'));
        }
        return errors;
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID="WorkspaceCompanyCardEditCardNamePage"
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton title={translate('workspace.companyCards.addWorkEmail')} />
                <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5]}>{translate('workspace.companyCards.addWorkEmailTitle')}</Text>
                <Text style={[styles.mt2, styles.mb4, styles.ph5, styles.textSupporting]}>{translate('workspace.companyCards.addWorkEmailDescription')}</Text>
                <FormProvider
                    formID={ONYXKEYS.FORMS.ADD_WORK_EMAIL_FORM}
                    validate={validate}
                    onSubmit={handleSubmit}
                    submitButtonText={translate('common.save')}
                    style={[styles.flex1, styles.ph5, styles.pb3]}
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        label={`${translate('common.workEmail')}`}
                        aria-label={`${translate('common.workEmail')}`}
                        role={CONST.ROLE.PRESENTATION}
                        inputMode={CONST.INPUT_MODE.EMAIL}
                        ref={emailInputRef}
                        inputID={INPUT_IDS.EMAIL}
                        autoCapitalize="none"
                        spellCheck={false}
                        suffixStyle={styles.colorMuted}
                        enterKeyHint="done"
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceCompanyCardAddWorkEmailPage;
