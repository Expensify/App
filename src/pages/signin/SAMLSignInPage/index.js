import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** The credentials of the logged in person */
    credentials: PropTypes.shape({
        /** The email/phone the user logged in with */
        login: PropTypes.string,
    }),
};

const defaultProps = {
    credentials: {},
};

function SAMLSignInPage({credentials}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    useEffect(() => {
        window.open(`${CONFIG.EXPENSIFY.SAML_URL}?email=${credentials.login}&referer=${CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER}`, '_self');
    }, [credentials.login]);

    return (
        <View style={styles.deeplinkWrapperContainer}>
            <View style={styles.deeplinkWrapperMessage}>
                <View style={styles.mb2}>
                    <Icon
                        width={200}
                        height={164}
                        src={Illustrations.RocketBlue}
                    />
                </View>
                <Text style={[styles.textHeadline, styles.textXXLarge, styles.textAlignCenter]}>{translate('samlSignIn.launching')}</Text>
                <View style={[styles.mt2, styles.mh2, styles.fontSizeNormal, styles.textAlignCenter]}>
                    <Text style={[styles.textAlignCenter]}>{translate('samlSignIn.oneMoment')}</Text>
                </View>
            </View>
            <View style={styles.deeplinkWrapperFooter}>
                <Icon
                    width={154}
                    height={34}
                    fill={theme.success}
                    src={Expensicons.ExpensifyWordmark}
                />
            </View>
        </View>
    );
}

SAMLSignInPage.propTypes = propTypes;
SAMLSignInPage.defaultProps = defaultProps;
SAMLSignInPage.displayName = 'SAMLSignInPage';

export default withOnyx({
    credentials: {key: ONYXKEYS.CREDENTIALS},
})(SAMLSignInPage);
