import React, {useEffect, useRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import ValidateCodeForm from './ValidateCodeForm';
import type {ValidateCodeFormHandle} from './ValidateCodeForm/BaseValidateCodeForm';

type UpdateDelegateMagicCodePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.DELEGATE_CONFIRM>;

function UpdateDelegateMagicCodePage({route}: UpdateDelegateMagicCodePageProps) {
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const login = route.params.login;
    const role = route.params.role as ValueOf<typeof CONST.DELEGATE_ROLE>;

    const styles = useThemeStyles();
    const validateCodeFormRef = useRef<ValidateCodeFormHandle>(null);

    const currentDelegate = account?.delegatedAccess?.delegates?.find((d) => d.email === login);

    useEffect(() => {
        if (!currentDelegate || !!currentDelegate.pendingFields?.role || !!currentDelegate.errorFields?.updateDelegateRole) {
            return;
        }

        // Dismiss modal on successful magic code verification
        Navigation.dismissModal();
    }, [login, currentDelegate, role]);

    const onBackButtonPress = () => {
        Navigation.goBack(ROUTES.SETTINGS_UPDATE_DELEGATE_ROLE.getRoute(login, role));
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={UpdateDelegateMagicCodePage.displayName}
            offlineIndicatorStyle={styles.mtAuto}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithBackButton
                        title={translate('delegate.makeSureItIsYou')}
                        onBackButtonPress={onBackButtonPress}
                    />
                    <Text style={[styles.mb3, styles.ph5]}>{translate('delegate.enterMagicCodeUpdate', {contactMethod: account?.primaryLogin ?? ''})}</Text>
                    <ValidateCodeForm
                        ref={validateCodeFormRef}
                        delegate={login}
                        role={role}
                        wrapperStyle={safeAreaPaddingBottomStyle}
                    />
                </>
            )}
        </ScreenWrapper>
    );
}

UpdateDelegateMagicCodePage.displayName = 'UpdateDelegateMagicCodePage';

export default UpdateDelegateMagicCodePage;
