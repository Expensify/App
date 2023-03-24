import React from 'react';
import {View, Pressable} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../../styles/styles';
import colors from '../../../../styles/colors';
import Avatar from '../../../../components/Avatar';
import compose from '../../../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import {withPersonalDetails} from '../../../../components/OnyxProvider';
import ControlSelection from '../../../../libs/ControlSelection';
import Text from '../../../../components/Text';
import participantPropTypes from '../../../../components/participantPropTypes';
import * as ReportUtils from '../../../../libs/ReportUtils';

const propTypes = {
    /** Styles for the outermost View */
    // eslint-disable-next-line react/forbid-prop-types
    wrapperStyles: PropTypes.arrayOf(PropTypes.object),

    /** Personal details of the user */
    item: participantPropTypes.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    wrapperStyles: [styles.reactionListItem],
};

const ReactionListItem = (props) => {
    const avatarSource = ReportUtils.getAvatar(props.item.avatar, props.item.login);

    return (
        <View style={props.wrapperStyles}>
            <View style={[styles.alignSelfStart, styles.mr3]}>
                <Avatar
                    containerStyles={[styles.actionAvatar]}
                    source={avatarSource}
                />
            </View>
            <View style={[styles.chatItemRight]}>
                <Text numberOfLines={1} style={styles.h3}>{props.item.displayName}</Text>
                <Text style={{color: colors.greenSupportingText}}>{props.item.login}</Text>
            </View>
        </View>
    );
};

ReactionListItem.propTypes = propTypes;
ReactionListItem.defaultProps = defaultProps;
ReactionListItem.displayName = 'ReactionListItem';

export default compose(
    withLocalize,
    withPersonalDetails(),
)(ReactionListItem);
