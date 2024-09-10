import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as User from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import ValidateCodeForm from './ValidateCodeForm';
import type {ValidateCodeFormHandle} from './ValidateCodeForm/BaseValidateCodeForm';

function ValidateContactActionPage() {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const themeStyles = useThemeStyles();
    const {translate} = useLocalize();
    const validateCodeFormRef = useRef<ValidateCodeFormHandle>(null);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);

    const [pendingContactAction] = useOnyx(ONYXKEYS.PENDING_CONTACT_ACTION);
    const loginData = loginList?.[pendingContactAction?.contactMethod ?? ''];

    useEffect(() => {
        if (!loginData || !!loginData.pendingFields?.addedLogin) {
            return;
        }

        // Navigate to methods page on successful magic code verification
        Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS.route);
    }, [loginData, loginData?.pendingFields, loginList]);

    const onBackButtonPress = () => {
        User.clearUnvalidatedNewContactMethodAction();
        Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.route);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={ValidateContactActionPage.displayName}
            offlineIndicatorStyle={themeStyles.mtAuto}
        >
            <HeaderWithBackButton
                title={account?.primaryLogin ?? ''}
                onBackButtonPress={onBackButtonPress}
            />
            <View style={[themeStyles.ph5, themeStyles.mt3, themeStyles.mb7]}>
                <DotIndicatorMessage
                    type="success"
                    style={[themeStyles.mb3]}
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    messages={{0: translate('contacts.enterMagicCode', {contactMethod: account?.primaryLogin ?? ''})}}
                />
                <ValidateCodeForm
                    isValidatingAction
                    loginList={loginList}
                    ref={validateCodeFormRef}
                    pendingContact={pendingContactAction}
                    contactMethod={account?.primaryLogin ?? ''}
                />
            </View>
        </ScreenWrapper>
    );
}

ValidateContactActionPage.displayName = 'ValidateContactActionPage';

export default ValidateContactActionPage;
