import React, {useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import PressableWithDelayToggle from '@components/Pressable/PressableWithDelayToggle';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Clipboard from '@libs/Clipboard';
import localFileDownload from '@libs/localFileDownload';
import StepWrapper from '@pages/settings/Security/TwoFactorAuth/StepWrapper/StepWrapper';
import useTwoFactorAuthContext from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthContext/useTwoFactorAuth';
import {defaultAccount, TwoFactorAuthPropTypes} from '@pages/settings/Security/TwoFactorAuth/TwoFactorAuthPropTypes';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import * as Session from '@userActions/Session';
import * as TwoFactorAuthActions from '@userActions/TwoFactorAuthActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function CodesStep({account = defaultAccount}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isExtraSmallScreenWidth, isSmallScreenWidth} = useWindowDimensions();
    const [error, setError] = useState('');

    const {setStep} = useTwoFactorAuthContext();

    useEffect(() => {
        if (account.requiresTwoFactorAuth || account.recoveryCodes) {
            return;
        }
        Session.toggleTwoFactorAuth(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- We want to run this when component mounts
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
                        {account.isLoading ? (
                            <View style={styles.twoFactorLoadingContainer}>
                                <ActivityIndicator color={theme.spinner} />
                            </View>
                        ) : (
                            <>
                                <View style={styles.twoFactorAuthCodesContainer}>
                                    {Boolean(account.recoveryCodes) &&
                                        _.map(account.recoveryCodes.split(', '), (code) => (
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
                                            Clipboard.setString(account.recoveryCodes);
                                            setError('');
                                            TwoFactorAuthActions.setCodesAreCopied();
                                        }}
                                        styles={[styles.button, styles.buttonMedium, styles.twoFactorAuthCodesButton]}
                                        textStyles={[styles.buttonMediumText]}
                                    />
                                    <PressableWithDelayToggle
                                        text={translate('common.download')}
                                        icon={Expensicons.Download}
                                        onPress={() => {
                                            localFileDownload('two-factor-auth-codes', account.recoveryCodes);
                                            setError('');
                                            TwoFactorAuthActions.setCodesAreCopied();
                                        }}
                                        inline={false}
                                        styles={[styles.button, styles.buttonMedium, styles.twoFactorAuthCodesButton]}
                                        textStyles={[styles.buttonMediumText]}
                                    />
                                </View>
                            </>
                        )}
                    </View>
                </Section>
                <FixedFooter style={[styles.mtAuto, styles.pt5]}>
                    {!_.isEmpty(error) && (
                        <FormHelpMessage
                            isError
                            message={translate(error)}
                            style={[styles.mb3]}
                        />
                    )}
                    <Button
                        success
                        text={translate('common.next')}
                        onPress={() => {
                            if (!account.codesAreCopied) {
                                setError('twoFactorAuth.errorStepCodes');
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

CodesStep.propTypes = TwoFactorAuthPropTypes;
CodesStep.displayName = 'CodesStep';

// eslint-disable-next-line rulesdir/onyx-props-must-have-default
export default withOnyx({
    account: {key: ONYXKEYS.ACCOUNT},
})(CodesStep);
