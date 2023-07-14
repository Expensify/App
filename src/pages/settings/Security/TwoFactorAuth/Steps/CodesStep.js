import React, {useEffect, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import {ActivityIndicator, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import _ from 'underscore';
import PropTypes from 'prop-types';
import Navigation from '../../../../../libs/Navigation/Navigation';
import * as Expensicons from '../../../../../components/Icon/Expensicons';
import withLocalize, {withLocalizePropTypes} from '../../../../../components/withLocalize';
import compose from '../../../../../libs/compose';
import ROUTES from '../../../../../ROUTES';
import * as Illustrations from '../../../../../components/Icon/Illustrations';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../../../components/withWindowDimensions';
import styles from '../../../../../styles/styles';
import FixedFooter from '../../../../../components/FixedFooter';
import Button from '../../../../../components/Button';
import PressableWithDelayToggle from '../../../../../components/Pressable/PressableWithDelayToggle';
import Text from '../../../../../components/Text';
import Section from '../../../../../components/Section';
import ONYXKEYS from '../../../../../ONYXKEYS';
import Clipboard from '../../../../../libs/Clipboard';
import themeColors from '../../../../../styles/themes/default';
import localFileDownload from '../../../../../libs/localFileDownload';
import * as TwoFactorAuthActions from '../../../../../libs/actions/TwoFactorAuthActions';
import * as Session from "../../../../../libs/actions/Session";
import StepWrapper from "../StepWrapper/StepWrapper";

const propTypes = {
    ...withLocalizePropTypes,
    account: PropTypes.shape({
        /** User recovery codes for setting up 2-FA */
        recoveryCodes: PropTypes.string,

        /** If recovery codes are loading */
        isLoading: PropTypes.bool,
    }),
};

const defaultProps = {
    account: {
        recoveryCodes: '',
    },
};

function CodesStep({translate, setStep, account, ...props}) {
    const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(true);

    // Here, this eslint rule will make the unmount effect unreadable, possibly confusing with mount
    // eslint-disable-next-line arrow-body-style
    useEffect(() => {
        Session.toggleTwoFactorAuth(true);
        // return () => {
        //     TwoFactorAuthActions.clearTwoFactorAuthData();
        // };
    }, []);

    return (
        <StepWrapper
            title={translate('twoFactorAuth.headerTitle')}
            stepCounter={{
                step: 1,
                text: translate('twoFactorAuth.stepCodes'),
            }}>
            <ScrollView>
                <Section
                    title={translate('twoFactorAuth.keepCodesSafe')}
                    icon={Illustrations.ShieldYellow}
                    containerStyles={[styles.twoFactorAuthSection]}
                    iconContainerStyles={[styles.ml6]}
                >
                    <View style={styles.mv3}>
                        <Text>{translate('twoFactorAuth.codesLoseAccess')}</Text>
                    </View>
                    <View style={styles.twoFactorAuthCodesBox(props)}>
                        {account.isLoading ? (
                            <View style={styles.twoFactorLoadingContainer}>
                                <ActivityIndicator color={themeColors.spinner}/>
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
                                            setIsNextButtonDisabled(false);
                                        }}
                                        styles={[styles.button, styles.buttonMedium, styles.twoFactorAuthCodesButton]}
                                        textStyles={[styles.buttonMediumText]}
                                    />
                                    <PressableWithDelayToggle
                                        text={translate('common.download')}
                                        icon={Expensicons.Download}
                                        onPress={() => {
                                            localFileDownload('two-factor-auth-codes', account.recoveryCodes);
                                            setIsNextButtonDisabled(false);
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
            </ScrollView>
            <FixedFooter style={[styles.mtAuto, styles.pt2]}>
                <Button
                    success
                    text={translate('common.next')}
                    onPress={() => setStep(1)}
                    isDisabled={isNextButtonDisabled}
                />
            </FixedFooter>
        </StepWrapper>
    );
}

CodesStep.propTypes = propTypes;
CodesStep.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withWindowDimensions,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(CodesStep);
