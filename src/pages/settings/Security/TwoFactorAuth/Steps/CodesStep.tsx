import React, {useEffect, useState} from 'react';
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
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Clipboard from '@libs/Clipboard';
import localFileDownload from '@libs/localFileDownload';
import type {BackToParams} from '@libs/Navigation/types';
import StepWrapper from '@pages/settings/Security/TwoFactorAuth/StepWrapper/StepWrapper';
import useTwoFactorAuthContext from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthContext/useTwoFactorAuth';
import type {BaseTwoFactorAuthFormOnyxProps} from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthForm/types';
import * as Session from '@userActions/Session';
import * as TwoFactorAuthActions from '@userActions/TwoFactorAuthActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type CodesStepProps = BaseTwoFactorAuthFormOnyxProps & BackToParams;

function CodesStep({account, backTo}: CodesStepProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isExtraSmallScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const [error, setError] = useState('');

    const {setStep} = useTwoFactorAuthContext();

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (account?.requiresTwoFactorAuth || account?.recoveryCodes) {
            return;
        }
        Session.toggleTwoFactorAuth(true);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- We want to run this when component mounts
    }, []);

    return (
        <StepWrapper
            title={translate('twoFactorAuth.headerTitle')}
            shouldEnableKeyboardAvoidingView={false}
            stepCounter={{
                step: 1,
                text: translate('twoFactorAuth.stepCodes'),
                total: 3,
            }}
            onBackButtonPress={() => TwoFactorAuthActions.quitAndNavigateBack(backTo)}
        >
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <Section
                    title={translate('twoFactorAuth.keepCodesSafe')}
                    icon={Illustrations.ShieldYellow}
                    containerStyles={[styles.twoFactorAuthSection]}
                    iconContainerStyles={[styles.ml6]}
                >
                    <View style={styles.mv3}>
                        <Text>{translate('twoFactorAuth.codesLoseAccess')}</Text>
                    </View>
                    <View style={styles.twoFactorAuthCodesBox({isExtraSmallScreenWidth, isSmallScreenWidth})}>
                        {account?.isLoading ? (
                            <View style={styles.twoFactorLoadingContainer}>
                                <ActivityIndicator color={theme.spinner} />
                            </View>
                        ) : (
                            <>
                                <View style={styles.twoFactorAuthCodesContainer}>
                                    {!!account?.recoveryCodes &&
                                        account?.recoveryCodes?.split(', ').map((code) => (
                                            <Text
                                                style={styles.twoFactorAuthCode}
                                                key={code}
                                            >
                                                {code}
                                            </Text>
                                        ))}
                                </View>
                                <View style={styles.twoFactorAuthCodesButtonsContainer}>
                                    <PressableWithDelayToggle
                                        text={translate('twoFactorAuth.copy')}
                                        textChecked={translate('common.copied')}
                                        icon={Expensicons.Copy}
                                        inline={false}
                                        onPress={() => {
                                            Clipboard.setString(account?.recoveryCodes ?? '');
                                            setError('');
                                            TwoFactorAuthActions.setCodesAreCopied();
                                        }}
                                        styles={[styles.button, styles.buttonMedium, styles.twoFactorAuthCodesButton]}
                                        textStyles={[styles.buttonMediumText]}
                                        accessible={false}
                                        tooltipText=""
                                        tooltipTextChecked=""
                                    />
                                    <PressableWithDelayToggle
                                        text={translate('common.download')}
                                        icon={Expensicons.Download}
                                        onPress={() => {
                                            localFileDownload('two-factor-auth-codes', account?.recoveryCodes ?? '');
                                            setError('');
                                            TwoFactorAuthActions.setCodesAreCopied();
                                        }}
                                        inline={false}
                                        styles={[styles.button, styles.buttonMedium, styles.twoFactorAuthCodesButton]}
                                        textStyles={[styles.buttonMediumText]}
                                        accessible={false}
                                        tooltipText=""
                                        tooltipTextChecked=""
                                    />
                                </View>
                            </>
                        )}
                    </View>
                </Section>
                <FixedFooter style={[styles.mtAuto, styles.pt5]}>
                    {!!error && (
                        <FormHelpMessage
                            isError
                            message={error}
                            style={[styles.mb3]}
                        />
                    )}
                    <Button
                        success
                        large
                        text={translate('common.next')}
                        onPress={() => {
                            if (!account?.codesAreCopied) {
                                setError(translate('twoFactorAuth.errorStepCodes'));
                                return;
                            }
                            setStep(CONST.TWO_FACTOR_AUTH_STEPS.VERIFY);
                        }}
                    />
                </FixedFooter>
            </ScrollView>
        </StepWrapper>
    );
}

CodesStep.displayName = 'CodesStep';

export default withOnyx<CodesStepProps, BaseTwoFactorAuthFormOnyxProps>({
    account: {key: ONYXKEYS.ACCOUNT},
})(CodesStep);
