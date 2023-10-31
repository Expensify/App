import PropTypes from 'prop-types';
import React from 'react';
import {Text, View} from 'react-native';
import reportPropTypes from '@pages/reportPropTypes';
import useThemeStyles from '@styles/useThemeStyles';
import * as Session from '@userActions/Session';
import AvatarWithDisplayName from './AvatarWithDisplayName';
import Button from './Button';
import ExpensifyWordmark from './ExpensifyWordmark';
import participantPropTypes from './participantPropTypes';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes,

    isSmallSizeLayout: PropTypes.bool,

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    ...withLocalizePropTypes,
};

const defaultProps = {
    report: {},
    isSmallSizeLayout: false,
    personalDetails: {},
};

function AnonymousReportFooter(props) {
    const styles = useThemeStyles();
    return (
        <View style={styles.anonymousRoomFooter(props.isSmallSizeLayout)}>
            <View style={[styles.flexRow, styles.flexShrink1]}>
                <AvatarWithDisplayName
                    report={props.report}
                    personalDetails={props.personalDetails}
                    isAnonymous
                    shouldEnableDetailPageNavigation
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
