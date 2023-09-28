import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import compose from '../../../libs/compose';
import ONYXKEYS from '../../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import CONFIG from '../../../CONFIG';
import Icon from '../../../components/Icon';
import Text from '../../../components/Text';
import * as Expensicons from '../../../components/Icon/Expensicons';
import * as Illustrations from '../../../components/Icon/Illustrations';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';

const propTypes = {
    /** The credentials of the logged in person */
    credentials: PropTypes.shape({
        /** The email/phone the user logged in with */
        login: PropTypes.string,
    }),
    ...withLocalizePropTypes,
}
const defaultProps = {
    credentials: {},
};

function SAMLSignInPage(props) {
    useEffect(() => {
        window.open(`${CONFIG.EXPENSIFY.SAML_URL}?email=${props.credentials.login}&referer=${CONFIG.EXPENSIFY.EXPENSIFY_CASH_REFERER}`, '_self')

    }, []);

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
                <Text style={[styles.textHeadline, styles.textXXLarge, styles.textAlignCenter]}>{props.translate('samlSignIn.launching')}</Text>
                <View style={[styles.mt2, styles.mh2, styles.fontSizeNormal, styles.textAlignCenter]}>
                    <Text style={[styles.textAlignCenter]}>{props.translate('samlSignIn.oneMoment')}</Text>
                </View>
            </View>
            <View style={styles.deeplinkWrapperFooter}>
                <Icon
                    width={154}
                    height={34}
                    fill={themeColors.success}
                    src={Expensicons.ExpensifyWordmark}
                />
            </View>
        </View>
    );
}

SAMLSignInPage.propTypes = propTypes;
SAMLSignInPage.defaultProps = defaultProps;

export default compose (
    withLocalize,
    withOnyx({
        credentials: {key: ONYXKEYS.CREDENTIALS},
    }),
)(SAMLSignInPage);
