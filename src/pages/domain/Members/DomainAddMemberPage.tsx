import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {NativeSyntheticEvent, TextInputSelectionChangeEventData} from 'react-native';
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
import {addMemberToDomain} from '@userActions/Domain';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DomainAddMemberProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.ADD_MEMBER>;

function DomainAddMemberPage({route}: DomainAddMemberProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const domainAccountID = route.params.domainAccountID;
    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: true});

    const domainName = domain ? Str.extractEmailDomain(domain.email) : undefined;
    const domainSuffix = domainName ? `@${domainName}` : '';

    const [email, setEmail] = useState(domainSuffix);
    const [selection, setSelection] = useState({start: 0, end: 0});

    useEffect(() => {
        setEmail(domainSuffix);
        setSelection({start: 0, end: 0});
    }, [domainSuffix]);

    const maxCursorPosition = Math.max(0, email.length - domainSuffix.length);

    const handleInputChange =
        (value: string) => {
            if (!domainName) {
                setEmail(value);
                return;
            }

            const loginPart = value.replace(domainSuffix, '').split('@').at(0) ?? '';

            if (loginPart === '') {
                setEmail(domainSuffix);
                setSelection({start: 0, end: 0});
            } else {
                setEmail(`${loginPart}${domainSuffix}`);
            }
        }

    const handleSelectionChange =
        (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
            const {start, end} = event.nativeEvent.selection;

            if (start > maxCursorPosition || end > maxCursorPosition) {
                const constrainedPosition = Math.min(start, end, maxCursorPosition);
                setSelection({
                    start: constrainedPosition,
                    end: constrainedPosition,
                });
            } else {
                setSelection({start, end});
            }
        }

    const inviteUser = () => {
        debugger;
        addMemberToDomain(domainAccountID, email);
        Navigation.dismissModal();
    }

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
                    label={`${translate('domain.members.email')} at domain ${domainName}`}
                    value={email}
                    onChangeText={handleInputChange}
                    selection={selection}
                    onSelectionChange={handleSelectionChange}
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
                buttonText={translate('common.invite')}
                onSubmit={inviteUser}
                containerStyles={[styles.p5]}
                enabledWhenOffline
            />
        </ScreenWrapper>
    );
}

DomainAddMemberPage.displayName = 'DomainAddMemberPage';

export default DomainAddMemberPage;
