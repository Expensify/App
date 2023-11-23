import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import ValidateCodeForm from './ValidateCodeForm';

const propTypes = {
    /** Function that returns whether the user is using SAML or magic codes to log in */
    setIsUsingMagicCode: PropTypes.func.isRequired,
};

const defaultProps = {};

function ChooseSSOOrMagicCode({setIsUsingMagicCode}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {isSmallScreenWidth} = useWindowDimensions();
    const [isUsingRecoveryCode, setIsUsingRecoveryCode] = useState(false);

    return (
        <>
            <View>
                <Text style={[styles.loginHeroBody, styles.mb5, styles.textNormal, !isSmallScreenWidth ? styles.textAlignLeft : {}]}>{translate('samlSignIn.welcomeSAMLEnabled')}</Text>
                <Button
                    isDisabled={isOffline}
                    success
                    style={[styles.mv3]}
                    text={translate('samlSignIn.useSingleSignOn')}
                    onPress={() => {
                        Navigation.navigate(ROUTES.SAML_SIGN_IN);
                    }}
                />

                <View style={[styles.mt5]}>
                    <Text style={[styles.loginHeroBody, styles.mb5, styles.textNormal, !isSmallScreenWidth ? styles.textAlignLeft : {}]}>
                        {translate('samlSignIn.orContinueWithMagicCode')}
                    </Text>
                </View>

                <ValidateCodeForm
                    setIsUsingMagicCode={setIsUsingMagicCode}
                    isUsingRecoveryCode={isUsingRecoveryCode}
                    setIsUsingRecoveryCode={setIsUsingRecoveryCode}
                />
            </View>
        </>
    );
}

ChooseSSOOrMagicCode.propTypes = propTypes;
ChooseSSOOrMagicCode.defaultProps = defaultProps;
ChooseSSOOrMagicCode.displayName = 'ChooseSSOOrMagicCode';

export default withOnyx()(ChooseSSOOrMagicCode);
