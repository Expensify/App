import React from 'react';
import {View, FlatList} from 'react-native';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import ReactionListItem from './ReactionListItem';
import styles from '../../../../styles/styles';
import HeaderReactionList from './HeaderReactionList';

const propTypes = {
    ...withLocalizePropTypes,
};

const defaultProps = {
    contentRef: null,
};

const renderItem = ({item}) => <ReactionListItem item={item} />;
const keyExtractor = item => `${item.accountID}`;

const BaseReactionList = props => (props.isVisible) && (
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
            style={[styles.pb3, styles.pt2]}
        />
    </View>
);

BaseReactionList.propTypes = propTypes;
BaseReactionList.defaultProps = defaultProps;
BaseReactionList.displayName = 'BaseReactionList';

export default withLocalize(BaseReactionList);
