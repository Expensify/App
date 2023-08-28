import React from 'react';
import {View, Text} from 'react-native';
import PropTypes from 'prop-types';
import Button from './Button';
import AvatarWithDisplayName from './AvatarWithDisplayName';
import ExpensifyWordmark from './ExpensifyWordmark';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import reportPropTypes from '../pages/reportPropTypes';
import CONST from '../CONST';
import styles from '../styles/styles';
import * as Session from '../libs/actions/Session';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes,

    isSmallSizeLayout: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    report: {},
    isSmallSizeLayout: false,
};

function AnonymousReportFooter(props) {
    return (
        <View style={styles.anonymousRoomFooter(props.isSmallSizeLayout)}>
            <View style={[styles.flexRow, styles.flexShrink1]}>
                <AvatarWithDisplayName
                    report={props.report}
                    size={CONST.AVATAR_SIZE.MEDIUM}
                    isAnonymous
                />
            </View>
            <View style={styles.anonymousRoomFooterWordmarkAndLogoContainer(props.isSmallSizeLayout)}>
                <View style={[props.isSmallSizeLayout ? styles.mr1 : styles.mr4, styles.flexShrink1]}>
                    <View style={[props.isSmallSizeLayout ? styles.alignItemsStart : styles.alignItemsEnd]}>
                        <ExpensifyWordmark style={styles.anonymousRoomFooterLogo} />
                    </View>
                    <Text style={styles.anonymousRoomFooterLogoTaglineText}>{props.translate('anonymousReportFooter.logoTagline')}</Text>
                </View>
                <View style={[styles.anonymousRoomFooterSignInButton]}>
                    <Button
                        medium
                        success
                        text={props.translate('common.signIn')}
                        onPress={() => Session.signOutAndRedirectToSignIn()}
                    />
                </View>
            </View>
        </View>
    );
}

AnonymousReportFooter.propTypes = propTypes;
AnonymousReportFooter.defaultProps = defaultProps;
AnonymousReportFooter.displayName = 'AnonymousReportFooter';

export default withLocalize(AnonymousReportFooter);
