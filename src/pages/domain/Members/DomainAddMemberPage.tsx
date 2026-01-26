import React, {useRef} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getPersonalDetailsByIDs} from '@libs/PersonalDetailsUtils';
import {isValidEmail} from '@libs/ValidationUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import {addMemberToDomain} from '@userActions/Domain';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {defaultSecurityGroupIDSelector, domainNameSelector, memberAccountIDsSelector} from '@src/selectors/Domain';
import INPUT_IDS from '@src/types/form/AddDomainMemberForm';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import getEmptyArray from '@src/types/utils/getEmptyArray';

type DomainAddMemberProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.ADD_MEMBER>;

function DomainAddMemberPage({route}: DomainAddMemberProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const {domainAccountID} = route.params;

    const [memberIDs = getEmptyArray<number>()] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: memberAccountIDsSelector,
    });
    const personalDetails = getPersonalDetailsByIDs({accountIDs: memberIDs});
    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: false, selector: domainNameSelector});
    const [defaultSecurityGroupID] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: true, selector: defaultSecurityGroupIDSelector});

    const emailInputRef = useRef<AnimatedTextInputRef>(null);

    const handleSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_DOMAIN_MEMBER_FORM>) => {
        if (!defaultSecurityGroupID) {
            return;
        }
        const fullEmail = `${values.email}@${domainName}`;

        addMemberToDomain(domainAccountID, fullEmail, defaultSecurityGroupID);
        Navigation.dismissModal();
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_DOMAIN_MEMBER_FORM>): Errors => {
        const fullEmail = `${values.email}@${domainName}`;

        const errors = {};

        if (!values.email) {
            addErrorMessage(errors, 'email', translate('common.error.fieldRequired'));
        } else if (fullEmail.length > CONST.LOGIN_CHARACTER_LIMIT) {
            addErrorMessage(errors, 'email', translate('common.error.characterLimitExceedCounter', fullEmail.length, CONST.LOGIN_CHARACTER_LIMIT));
        }

        const isUserAlreadyAMember = !!values.email && personalDetails.some(({login}) => login?.toLowerCase() === fullEmail.toLowerCase());
        const isEmailInvalid = !!domainName && !!values.email && !isValidEmail(fullEmail);

        if (isEmailInvalid) {
            addErrorMessage(errors, 'email', translate('messages.errorMessageInvalidEmail'));
        }
        if (isUserAlreadyAMember && !!domainName) {
            addErrorMessage(errors, 'email', translate('messages.userIsAlreadyMember', {login: fullEmail, name: domainName}));
        }

        return errors;
    };

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                shouldEnableMaxHeight
                shouldUseCachedViewportHeight
                testID="DomainAddMemberPage"
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButton
                    title={translate('domain.members.addMember')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.DOMAIN_ADMINS.getRoute(domainAccountID))}
                />

                <FormProvider
                    formID={ONYXKEYS.FORMS.ADD_DOMAIN_MEMBER_FORM}
                    validate={validate}
                    onSubmit={handleSubmit}
                    submitButtonText={translate('common.invite')}
                    style={[styles.flex1, styles.ph5, styles.pb3]}
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        label={`${translate('common.email')}`}
                        aria-label={`${translate('common.email')}`}
                        role={CONST.ROLE.PRESENTATION}
                        inputMode={CONST.INPUT_MODE.EMAIL}
                        ref={emailInputRef}
                        inputID={INPUT_IDS.EMAIL}
                        autoCapitalize="none"
                        spellCheck={false}
                        suffixCharacter={domainName ? `@${domainName}` : undefined}
                        suffixStyle={styles.colorMuted}
                        enterKeyHint="done"
                    />
                </FormProvider>
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default DomainAddMemberPage;
