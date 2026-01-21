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
import {isValidEmail} from '@libs/ValidationUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import {addMemberToDomain} from '@userActions/Domain';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {domainNameSelector} from '@src/selectors/Domain';

type DomainAddMemberProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.ADD_MEMBER>;

function DomainAddMemberPage({route}: DomainAddMemberProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const {domainAccountID} = route.params;

    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: false, selector: domainNameSelector});
    const [email, setEmail] = useState<string | undefined>();

    const isEmailInvalid = !!domainName && !!email && !isValidEmail(`${email}@${domainName}`);
    const isSubmitDisabled = !domainName || !email || isEmailInvalid;

    const handleSubmit = () => {
        if (isSubmitDisabled) {
            return;
        }

        addMemberToDomain(domainAccountID, `${email}@${domainName}`);
        Navigation.dismissModal();
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
                        hasError={isEmailInvalid}
                        errorText={isEmailInvalid ? translate('messages.errorMessageInvalidEmail') : undefined}
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
