import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import ValidateCodeForm from './ValidateCodeForm';
import type {ValidateCodeFormHandle} from './ValidateCodeForm/BaseValidateCodeForm';

type DelegateMagicCodePageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.DELEGATE_CONFIRM>;

function DelegateMagicCodePage({route}: DelegateMagicCodePageProps) {
    const accountID = Number(route.params.accountID);
    const role = route.params.role as ValueOf<typeof CONST.DELEGATE_ROLE>;

    const delegatePersonalDetails = PersonalDetailsUtils.getPersonalDetailsByIDs([accountID], -1)[0];
    const {translate} = useLocalize();

    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const styles = useThemeStyles();
    const validateCodeFormRef = useRef<ValidateCodeFormHandle>(null);

    const currentDelegate = account?.delegatedAccess?.delegates?.find((d) => d.email === delegatePersonalDetails?.login);

    useEffect(() => {
        if (!currentDelegate || !!currentDelegate.pendingFields?.email || !!currentDelegate.errorFields?.addDelegate) {
            return;
        }

        // Dismiss modal on successful magic code verification
        Navigation.dismissModal();
    }, [accountID, currentDelegate, role]);

    const onBackButtonPress = () => {
        Navigation.goBack(ROUTES.SETTINGS_DELEGATE_CONFIRM.getRoute(accountID, role));
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={DelegateMagicCodePage.displayName}
            offlineIndicatorStyle={styles.mtAuto}
        >
            <HeaderWithBackButton
                title={translate('delegate.makeSureItIsYou')}
                onBackButtonPress={onBackButtonPress}
            />
            <Text style={[styles.mb3, styles.ph5]}>{translate('delegate.enterMagicCode', {contactMethod: account?.primaryLogin ?? ''})}</Text>
            <ValidateCodeForm
                ref={validateCodeFormRef}
                delegate={delegatePersonalDetails?.login ?? ''}
                role={role}
            />
        </ScreenWrapper>
    );
}

DelegateMagicCodePage.displayName = 'DelegateMagicCodePage';

export default DelegateMagicCodePage;
