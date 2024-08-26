import type {RouteProp} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import React, {useEffect, useState, useRef} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import PressableWithDelayToggle from '@components/Pressable/PressableWithDelayToggle';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import ValidateAccountMessage from '@components/ValidateAccountMessage';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Clipboard from '@libs/Clipboard';
import localFileDownload from '@libs/localFileDownload';
import type {BackToParams, SettingsNavigatorParamList} from '@libs/Navigation/types';
import StepWrapper from '@pages/settings/Security/TwoFactorAuth/StepWrapper/StepWrapper';
import useTwoFactorAuthContext from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthContext/useTwoFactorAuth';
import TwoFactorAuthForm from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthForm';
import type {BaseTwoFactorAuthFormOnyxProps} from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthForm/types';
import * as Session from '@userActions/Session';
import * as TwoFactorAuthActions from '@userActions/TwoFactorAuthActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type CodesStepProps = BaseTwoFactorAuthFormOnyxProps & BackToParams;

function CodesStep({account, user, backTo}: CodesStepProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isExtraSmallScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const [error, setError] = useState('');
    const isUserValidated = user?.validated;
    const route = useRoute<RouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.TWO_FACTOR_AUTH>>();

    const formRef = useRef<BaseTwoFactorAuthFormRef>(null);

    const {setStep} = useTwoFactorAuthContext();

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (account?.requiresTwoFactorAuth || account?.recoveryCodes || !isUserValidated) {
            return;
        }
        Session.toggleTwoFactorAuth(true);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- We want to run this when component mounts
    }, [isUserValidated]);

    return (
        <StepWrapper
            title={translate('twoFactorAuth.disableTwoFactorAuth')}
            shouldEnableKeyboardAvoidingView={false}
            stepCounter={{
                step: 1,
                text: translate('twoFactorAuth.gatherCode'),
                total: 2,
            }}
            onBackButtonPress={() => setStep(CONST.TWO_FACTOR_AUTH_STEPS.ENABLED, CONST.ANIMATION_DIRECTION.OUT)}
            onEntryTransitionEnd={() => formRef.current && formRef.current.focus()}
        >
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <View style={[styles.ph5, styles.mt3]}>
                    <Text style={styles.textLabel}>{translate('twoFactorAuth.explainProcessToRemove')}</Text>
                </View>
            </ScrollView>
            <FixedFooter style={[styles.mt2, styles.pt2]}>
                <View style={[styles.mh5, styles.mb4]}>
                    <TwoFactorAuthForm innerRef={formRef} />
                </View>
                <Button
                    success
                    large
                    text={translate('common.next')}
                    isLoading={account?.isLoading}
                    onPress={() => {
                        if (!formRef.current) {
                            return;
                        }
                        formRef.current.validateAndSubmitForm();
                    }}
                />
            </FixedFooter>
        </StepWrapper>
    );
}

CodesStep.displayName = 'CodesStep';

export default withOnyx<CodesStepProps, BaseTwoFactorAuthFormOnyxProps>({
    account: {key: ONYXKEYS.ACCOUNT},
    user: {
        key: ONYXKEYS.USER,
    },
})(CodesStep);
