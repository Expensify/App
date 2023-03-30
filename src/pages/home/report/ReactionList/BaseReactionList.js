import React from 'react';
import {View, FlatList} from 'react-native';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import ReactionListItem from './ReactionListItem';
import styles from '../../../../styles/styles';
import HeaderReactionList from './HeaderReactionList';
import CONST from '../../../../CONST';
import participantPropTypes from '../../../../components/participantPropTypes';
import {
    propTypes as reactionPropTypes,
    defaultProps as reactionDefaultProps,
} from './HeaderReactionList/reactionPropTypes';

const propTypes = {

    /**
    *  Array of personal detail objects
    */
    users: PropTypes.arrayOf(participantPropTypes),

    /**
     * Returns true if the current account has reacted to the report action (with the given skin tone).
     */
    hasUserReacted: PropTypes.bool,

    ...reactionPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    ...reactionDefaultProps,
};

const renderItem = ({item}) => <ReactionListItem item={item} />;
const keyExtractor = (item, index) => `${item.login}+${index}`;
const getItemLayout = (_, index) => ({
    index,
    length: CONST.REACTION_LIST_ITEM_HEIGHT,
    offset: CONST.REACTION_LIST_ITEM_HEIGHT * index,
});

// const BaseReactionList = props => (props.isVisible) && (
const BaseReactionList = (props) => {
    if (!props.isVisible) {
        return null;
    }
    return (
        <View style={styles.reactionListContainer}>
            <HeaderReactionList
                onClose={props.onClose}
                emojiName={props.emojiName}
                emojiCodes={props.emojiCodes}
                emojiCount={props.emojiCount}
                hasUserReacted={props.hasUserReacted}
                sizeScale={props.sizeScale}
            />
            <FlatList
                data={props.users}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                getItemLayout={getItemLayout}
                style={[styles.pb3, styles.pt2]}
            />
        </View>
    );
};

BaseReactionList.propTypes = propTypes;
BaseReactionList.defaultProps = defaultProps;
BaseReactionList.displayName = 'BaseReactionList';

export default withLocalize(BaseReactionList);
