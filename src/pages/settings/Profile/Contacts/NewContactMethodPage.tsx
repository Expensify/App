import type {StackScreenProps} from '@react-navigation/stack';
import Str from 'expensify-common/lib/str';
import React, {useCallback, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as LoginUtils from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/NewContactMethodForm';
import type {LoginList} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';

type NewContactMethodPageOnyxProps = {
    /** Login list for the user that is signed in */
    loginList: OnyxEntry<LoginList>;
};

type NewContactMethodPageProps = NewContactMethodPageOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD>;

const addNewContactMethod = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_CONTACT_METHOD_FORM>) => {
    const phoneLogin = LoginUtils.getPhoneLogin(values.phoneOrEmail);
    const validateIfnumber = LoginUtils.validateNumber(phoneLogin);
    const submitDetail = (validateIfnumber || values.phoneOrEmail).trim().toLowerCase();

    User.addNewContactMethodAndNavigate(submitDetail);
};

function NewContactMethodPage({loginList, route}: NewContactMethodPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const loginInputRef = useRef<AnimatedTextInputRef>(null);

    const navigateBackTo = route?.params?.backTo ?? ROUTES.SETTINGS_PROFILE;

    const validate = React.useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_CONTACT_METHOD_FORM>): Errors => {
            const phoneLogin = LoginUtils.getPhoneLogin(values.phoneOrEmail);
            const validateIfnumber = LoginUtils.validateNumber(phoneLogin);

            const errors = {};

            if (!values.phoneOrEmail) {
                ErrorUtils.addErrorMessage(errors, 'phoneOrEmail', 'contacts.genericFailureMessages.contactMethodRequired');
            }

            if (!!values.phoneOrEmail && !(validateIfnumber || Str.isValidEmail(values.phoneOrEmail))) {
                ErrorUtils.addErrorMessage(errors, 'phoneOrEmail', 'contacts.genericFailureMessages.invalidContactMethod');
            }

            if (!!values.phoneOrEmail && loginList?.[validateIfnumber || values.phoneOrEmail.toLowerCase()]) {
                ErrorUtils.addErrorMessage(errors, 'phoneOrEmail', 'contacts.genericFailureMessages.enteredMethodIsAlreadySubmited');
            }

            return errors;
        },
        // We don't need `loginList` because when submitting this form
        // the loginList gets updated, causing this function to run again.
        // https://github.com/Expensify/App/issues/20610
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const onBackButtonPress = useCallback(() => {
        if (navigateBackTo === ROUTES.SETTINGS_PROFILE) {
            Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.route);
            return;
        }
        Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.getRoute(navigateBackTo));
    }, [navigateBackTo]);

    return (
        <ScreenWrapper
            onEntryTransitionEnd={() => loginInputRef.current?.focus()}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={NewContactMethodPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('contacts.newContactMethod')}
                onBackButtonPress={onBackButtonPress}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.NEW_CONTACT_METHOD_FORM}
                validate={validate}
                onSubmit={addNewContactMethod}
                submitButtonText={translate('common.add')}
                style={[styles.flexGrow1, styles.mh5]}
                enabledWhenOffline
            >
                <Text style={styles.mb5}>{translate('common.pleaseEnterEmailOrPhoneNumber')}</Text>
                <View style={styles.mb6}>
                    <InputWrapper
                        InputComponent={TextInput}
                        label={`${translate('common.email')}/${translate('common.phoneNumber')}`}
                        aria-label={`${translate('common.email')}/${translate('common.phoneNumber')}`}
                        role={CONST.ROLE.PRESENTATION}
                        inputMode={CONST.INPUT_MODE.EMAIL}
                        ref={loginInputRef}
                        inputID={INPUT_IDS.PHONE_OR_EMAIL}
                        autoCapitalize="none"
                        enterKeyHint="done"
                        maxLength={CONST.LOGIN_CHARACTER_LIMIT}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

NewContactMethodPage.displayName = 'NewContactMethodPage';

export default withOnyx<NewContactMethodPageProps, NewContactMethodPageOnyxProps>({
    loginList: {key: ONYXKEYS.LOGIN_LIST},
})(NewContactMethodPage);
