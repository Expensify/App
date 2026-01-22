import React, {useState} from 'react';
import {View} from 'react-native';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
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
import {domainNameSelector, memberAccountIDsSelector} from '@src/selectors/Domain';
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

    const [email, setEmail] = useState<string>('');
    const fullEmail = `${email}@${domainName}`;

    const isUserAlreadyAMember = !!email && personalDetails.some(({login}) => login?.toLowerCase() === fullEmail.toLowerCase());
    const isEmailInvalid = !!domainName && !!email && !isValidEmail(fullEmail);
    const isSubmitDisabled = !domainName || !email || isEmailInvalid || isUserAlreadyAMember;

    const handleSubmit = () => {
        if (isSubmitDisabled) {
            return;
        }

        setEmail('');
        addMemberToDomain(domainAccountID, fullEmail);
        Navigation.dismissModal();
    };

    const getErrorText = () => {
        if (isEmailInvalid) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (isUserAlreadyAMember && !!domainName) {
            return translate('messages.userIsAlreadyMember', {login: fullEmail, name: domainName});
        }

        return undefined;
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

                <View style={[styles.flex1, styles.ph5, styles.pb3]}>
                    <TextInput
                        accessibilityLabel={`${translate('common.email')}`}
                        label={`${translate('common.email')}`}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        spellCheck={false}
                        inputMode={CONST.INPUT_MODE.EMAIL}
                        autoFocus
                        suffixCharacter={domainName ? `@${domainName}` : undefined}
                        suffixStyle={styles.colorMuted}
                        hasError={isEmailInvalid || isUserAlreadyAMember}
                        errorText={getErrorText()}
                    />
                </View>

                <FormAlertWithSubmitButton
                    isDisabled={isSubmitDisabled}
                    isAlertVisible={false}
                    buttonText={translate('common.invite')}
                    onSubmit={handleSubmit}
                    containerStyles={styles.p5}
                    enabledWhenOffline
                />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default DomainAddMemberPage;
