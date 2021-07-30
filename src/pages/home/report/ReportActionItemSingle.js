import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemFragment from './ReportActionItemFragment';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import ReportActionItemDate from './ReportActionItemDate';
import Avatar from '../../../components/Avatar';
import personalDetailsPropType from '../../personalDetailsPropType';
import compose from '../../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import {withPersonalDetails} from '../../../components/OnyxProvider';

const propTypes = {
    /** All the data of the action */
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    /** All of the personalDetails */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    /** Styles for the outermost View */
    wrapperStyles: PropTypes.arrayOf(PropTypes.object),

    /** Children view component for this action item */
    children: PropTypes.node.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    personalDetails: {},
    wrapperStyles: [styles.chatItem],
};

const showUserDetails = (email) => {
    Navigation.navigate(`${ROUTES.DETAILS}/${email}`);
};

const ReportActionItemSingle = ({
    action,
    personalDetails,
    children,
    wrapperStyles,
    toLocalPhone,
}) => {
    const {avatar, displayName, login} = personalDetails[action.actorEmail] || {};
    const avatarUrl = action.automatic
        ? `${CONST.CLOUDFRONT_URL}/images/icons/concierge_2019.svg`

        // Use avatar in personalDetails if we have one then fallback to avatar provided by the action
        : (avatar || action.avatar);

    // Since the display name for a report action message is delivered with the report history as an array of fragments
    // we'll need to take the displayName from personal details and have it be in the same format for now. Eventually,
    // we should stop referring to the report history items entirely for this information.
    const personArray = displayName
        ? [{type: 'TEXT', text: Str.isSMSLogin(login) ? toLocalPhone(displayName) : displayName}]
        : action.person;

    return (
        <View style={wrapperStyles}>
            <Pressable onPress={() => showUserDetails(action.actorEmail)}>
                <Avatar
                    imageStyles={[styles.actionAvatar]}
                    source={avatarUrl}
                />
            </Pressable>
            <View style={[styles.chatItemRight]}>
                <View style={[styles.chatItemMessageHeader]}>
                    <Pressable style={[styles.flexShrink1]} onPress={() => showUserDetails(action.actorEmail)}>
                        {_.map(personArray, (fragment, index) => (
                            <ReportActionItemFragment
                                key={`person-${action.sequenceNumber}-${index}`}
                                fragment={fragment}
                                tooltipText={action.actorEmail}
                                isAttachment={action.isAttachment}
                                isLoading={action.loading}
                                isSingleLine
                            />
                        ))}
                    </Pressable>
                    <ReportActionItemDate timestamp={action.timestamp} />
                </View>
                {children}
            </View>
        </View>
    );
};

ReportActionItemSingle.propTypes = propTypes;
ReportActionItemSingle.defaultProps = defaultProps;
ReportActionItemSingle.displayName = 'ReportActionItemSingle';

export default compose(
    withLocalize,
    withPersonalDetails,
)(ReportActionItemSingle);
