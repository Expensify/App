import lodashGet from 'lodash/get';
import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import reportActionPropTypes from './reportActionPropTypes';
import ReportActionItemFragment from './ReportActionItemFragment';
import styles from '../../../styles/styles';
import ReportActionItemDate from './ReportActionItemDate';
import Avatar from '../../../components/Avatar';
import personalDetailsPropType from '../../personalDetailsPropType';
import compose from '../../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import {withPersonalDetails} from '../../../components/OnyxProvider';
import ControlSelection from '../../../libs/ControlSelection';
import * as ReportUtils from '../../../libs/ReportUtils';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import CONST from '../../../CONST';
import SubscriptAvatar from '../../../components/SubscriptAvatar';
import reportPropTypes from '../../reportPropTypes';
import * as UserUtils from '../../../libs/UserUtils';
import PressableWithoutFeedback from '../../../components/Pressable/PressableWithoutFeedback';
import UserDetailsTooltip from '../../../components/UserDetailsTooltip';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** All of the personalDetails */
    personalDetailsList: PropTypes.objectOf(personalDetailsPropType),

    /** Styles for the outermost View */
    // eslint-disable-next-line react/forbid-prop-types
    wrapperStyles: PropTypes.arrayOf(PropTypes.object),

    /** Children view component for this action item */
    children: PropTypes.node.isRequired,

    /** Report for this action */
    report: reportPropTypes,

    /** Show header for action */
    showHeader: PropTypes.bool,

    /** Determines if the avatar is displayed as a subscript (positioned lower than normal) */
    shouldShowSubscriptAvatar: PropTypes.bool,

    /** If the message has been flagged for moderation */
    hasBeenFlagged: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    personalDetailsList: {},
    wrapperStyles: [styles.chatItem],
    showHeader: true,
    shouldShowSubscriptAvatar: false,
    hasBeenFlagged: false,
    report: undefined,
};

const showUserDetails = (accountID) => {
    Navigation.navigate(ROUTES.getProfileRoute(accountID));
};

function ReportActionItemSingle(props) {
    const actorEmail = lodashGet(props.action, 'actorEmail', '').replace(CONST.REGEX.MERGED_ACCOUNT_PREFIX, '');
    const actorAccountID = props.action.actorAccountID;
    const {avatar, displayName, pendingFields} = props.personalDetailsList[actorAccountID] || {};
    const avatarSource = UserUtils.getAvatar(avatar, actorAccountID);

    // Since the display name for a report action message is delivered with the report history as an array of fragments
    // we'll need to take the displayName from personal details and have it be in the same format for now. Eventually,
    // we should stop referring to the report history items entirely for this information.
    const personArray = displayName
        ? [
              {
                  type: 'TEXT',
                  text: displayName,
              },
          ]
        : props.action.person;

    return (
        <View style={props.wrapperStyles}>
            <PressableWithoutFeedback
                style={[styles.alignSelfStart, styles.mr3]}
                onPressIn={ControlSelection.block}
                onPressOut={ControlSelection.unblock}
                onPress={() => showUserDetails(actorAccountID)}
                accessibilityLabel={actorEmail}
                accessibilityRole="button"
            >
                <OfflineWithFeedback pendingAction={lodashGet(pendingFields, 'avatar', null)}>
                    {props.shouldShowSubscriptAvatar ? (
                        <SubscriptAvatar
                            mainAvatar={{source: avatarSource, type: CONST.ICON_TYPE_AVATAR}}
                            secondaryAvatar={ReportUtils.getIcons(props.report, {})[props.report.isOwnPolicyExpenseChat ? 0 : 1]}
                            mainTooltip={actorEmail}
                            secondaryTooltip={ReportUtils.getPolicyName(props.report)}
                            noMargin
                        />
                    ) : (
                        <UserDetailsTooltip accountID={actorAccountID}>
                            <View>
                                <Avatar
                                    containerStyles={[styles.actionAvatar]}
                                    source={avatarSource}
                                />
                            </View>
                        </UserDetailsTooltip>
                    )}
                </OfflineWithFeedback>
            </PressableWithoutFeedback>
            <View style={[styles.chatItemRight]}>
                {props.showHeader ? (
                    <View style={[styles.chatItemMessageHeader]}>
                        <PressableWithoutFeedback
                            style={[styles.flexShrink1, styles.mr1]}
                            onPressIn={ControlSelection.block}
                            onPressOut={ControlSelection.unblock}
                            onPress={() => showUserDetails(actorAccountID)}
                            accessibilityLabel={actorEmail}
                            accessibilityRole="button"
                        >
                            {_.map(personArray, (fragment, index) => (
                                <ReportActionItemFragment
                                    key={`person-${props.action.reportActionID}-${index}`}
                                    accountID={actorAccountID}
                                    fragment={fragment}
                                    isAttachment={props.action.isAttachment}
                                    isLoading={props.action.isLoading}
                                    isSingleLine
                                />
                            ))}
                        </PressableWithoutFeedback>
                        <ReportActionItemDate created={props.action.created} />
                    </View>
                ) : null}
                <View style={props.hasBeenFlagged ? styles.blockquote : {}}>{props.children}</View>
            </View>
        </View>
    );
}

ReportActionItemSingle.propTypes = propTypes;
ReportActionItemSingle.defaultProps = defaultProps;
ReportActionItemSingle.displayName = 'ReportActionItemSingle';

export default compose(withLocalize, withPersonalDetails())(ReportActionItemSingle);
