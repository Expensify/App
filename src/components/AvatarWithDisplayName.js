import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {CONST} from 'expensify-common/lib/CONST';
import reportPropTypes from '../pages/reportPropTypes';
import participantPropTypes from './participantPropTypes';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import styles from '../styles/styles';
import SubscriptAvatar from './SubscriptAvatar';
import * as ReportUtils from '../libs/ReportUtils';
import Avatar from './Avatar';
import DisplayNames from './DisplayNames';
import compose from '../libs/compose';

const propTypes = {
    /* Onyx Props */

    /** The report currently being looked at */
    report: reportPropTypes,

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }),

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    ...windowDimensionsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    personalDetails: {},
    policies: {},
    report: null,
};

const AvatarWithDisplayName = (props) => {
    const title = ReportUtils.getReportName(props.report, props.policies);

    const subtitle = ReportUtils.getChatRoomSubtitle(props.report, props.policies);

    // We hide the button when we are chatting with an automated Expensify account since it's not possible to contact
    // these users via alternative means. It is possible to request a call with Concierge, so we leave the option for them.
    const shouldShowSubscript = props.report.type === CONST.REPORT.TYPE.EXPENSE;
    const icons = ReportUtils.getIcons(props.report, props.personalDetails, props.policies);
    return (
        <View style={[styles.appContentHeader]} nativeID="drag-area">
            <View style={[styles.appContentHeaderTitle, !props.isSmallScreenWidth && styles.pl5]}>
                {Boolean(props.report && title) && (
                    <View
                        style={[
                            styles.flex1,
                            styles.flexRow,
                            styles.alignItemsCenter,
                            styles.justifyContentBetween,
                        ]}
                    >
                        {shouldShowSubscript ? (
                            <SubscriptAvatar
                                mainAvatar={icons[0]}
                                secondaryAvatar={icons[1]}
                                mainTooltip={props.report.ownerEmail}
                                secondaryTooltip={subtitle}
                            />
                        ) : (
                            <Avatar
                                source={icons[0]}
                            />
                        )}
                        <View style={[styles.flex1, styles.flexColumn]}>
                            <DisplayNames
                                fullTitle={title}
                                tooltipEnabled
                                numberOfLines={1}
                                textStyles={[styles.headerText, styles.pre]}
                            />
                            <Text
                                style={[
                                    styles.sidebarLinkText,
                                    styles.optionAlternateText,
                                    styles.textLabelSupporting,
                                    styles.pre,
                                ]}
                                numberOfLines={1}
                            >
                                {subtitle}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};
AvatarWithDisplayName.propTypes = propTypes;
AvatarWithDisplayName.displayName = 'AvatarWithDisplayName';
AvatarWithDisplayName.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
)(AvatarWithDisplayName);
