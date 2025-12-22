import {Str} from 'expensify-common';
import React, {useCallback, useMemo, useState} from 'react';
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
import type {SettingsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainAddMemberProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.ADD_MEMBER>;

function DomainAddMemberPage({route}: DomainAddMemberProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const domainAccountID = route.params.accountID;
    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: true});


    const domainName = domain ? Str.extractEmailDomain(domain.email) : undefined;
    const domainSuffix = useMemo(() => (domainName ? `@${domainName}` : ''), [domainName]);
    const [email, setEmail] = useState(domainSuffix);

    const handleInputChange = useCallback((value: string) => {
        if (!domainName) {
            setEmail(value);
            return;
        }

        const loginPart = value.replace(domainSuffix, '').split('@').at(0);

        if (loginPart === '') {
            setEmail('');
        } else {
            setEmail(`${loginPart}${domainSuffix}`);
        }
    }, [domainName, domainSuffix]);

    const inviteUser = useCallback(() => {

        }, [email, domainSuffix]);

    const isButtonDisabled = !email || email === domainSuffix || !email.includes('@');

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            shouldUseCachedViewportHeight
            testID={DomainAddMemberPage.displayName}
            includeSafeAreaPaddingBottom
        >
            <HeaderWithBackButton
                title={translate('domain.members.addMember')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.DOMAIN_ADMINS.getRoute(domainAccountID));
                }}
            />

            <View style={[styles.flex1, styles.p5]}>
                <TextInput
                    accessibilityLabel="Text input field"
                    label={translate('selectionList.nameEmailOrPhoneNumber')}
                    value={email}
                    onChangeText={handleInputChange}
                    placeholder={domainSuffix}
                    autoCapitalize="none"
                    spellCheck={false}
                    inputMode={CONST.INPUT_MODE.EMAIL}
                    autoFocus
                />
            </View>

            <FormAlertWithSubmitButton
                isDisabled={isButtonDisabled}
                isAlertVisible={false}
                buttonText={translate('domain.members.invite')}
                onSubmit={inviteUser}
                containerStyles={[styles.p5]}
                enabledWhenOffline
            />
        </ScreenWrapper>
    );
}

DomainAddMemberPage.displayName = 'DomainAddMemberPage';

export default DomainAddMemberPage;
