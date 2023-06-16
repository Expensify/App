import React from 'react';
import {View, Text} from 'react-native';
import Button from './Button';
import AvatarWithDisplayName from './AvatarWithDisplayName';
import ExpensifyWordmark from './ExpensifyWordmark';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import reportPropTypes from '../pages/reportPropTypes';
import CONST from '../CONST';
import variables from '../styles/variables';
import styles from '../styles/styles';
import * as Session from '../libs/actions/Session';

const propTypes = {
    /** The report currently being looked at */
    report: reportPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    report: {},
};

function AnonymousReportFooter(props){
    const [availableWidth, setAvailableWidth] = React.useState(null);

    const isSmallSizeLayout = availableWidth && availableWidth < variables.anonymousReportFooterBreakpoint;

    const onLayout = (event) => {
        const {width} = event.nativeEvent.layout;
        setAvailableWidth(width);
    };

    return (
        <View onLayout={onLayout} style={styles.anonymousRoomFooter(isSmallSizeLayout)}>
            <View style={[styles.flexRow]}>
                <AvatarWithDisplayName
                    report={props.report}
                    size={CONST.AVATAR_SIZE.MEDIUM}
                    isAnonymous
                />
            </View>
            <View style={styles.anonymousRoomFooterWordmarkAndLogoContainer(isSmallSizeLayout)}>
                <View style={[styles.mr4, styles.flexShrink1]}>
                    <View style={[isSmallSizeLayout ? styles.alignItemsStart : styles.alignItemsEnd]}>
                        <ExpensifyWordmark style={styles.anonymousRoomFooterLogo} />
                    </View>
                    <Text style={[styles.textNormal, styles.textWhite]}>{props.translate('anonymousReportFooter.logoTagline')}</Text>
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
};

AnonymousReportFooter.propTypes = propTypes;
AnonymousReportFooter.defaultProps = defaultProps;
AnonymousReportFooter.displayName = 'AnonymousReportFooter';

export default withLocalize(AnonymousReportFooter);
