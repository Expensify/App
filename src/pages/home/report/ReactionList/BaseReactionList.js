import React from 'react';
import {View, FlatList} from 'react-native';
import PropTypes from 'prop-types';
import getReportActionContextMenuStyles from '../../../../styles/getReportActionContextMenuStyles';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';

import compose from '../../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';
import {withBetas} from '../../../../components/OnyxProvider';
import Text from '../../../../components/Text';
import ReactionListItem from './ReactionListItem';
import styles from '../../../../styles/styles';
import colors from '../../../../styles/colors';
import HeaderReactionList from './HeaderReactionList';

const propTypes = {

    contentRef: PropTypes.oneOfType([PropTypes.node, PropTypes.object, PropTypes.func]),

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    contentRef: null,
};
class BaseReactionList extends React.Component {
    constructor(props) {
        super(props);
        this.wrapperStyle = getReportActionContextMenuStyles(this.props.isMini);

        this.state = {
            keepOpen: false,
        };
    }

    renderItem({item}) {
        return <ReactionListItem item={item} />;
    }

    render() {
        return (this.props.isVisible || this.state.keepOpen) && (
            <View
                ref={this.props.contentRef}
                style={[{
                    width: '100%', minWidth: 400, minHeight: 100, maxHeight: 500,
                }]}
            >
                <HeaderReactionList onClose={this.props.onClose} />
                <Text style={[styles.ph5, styles.pv4, {color: colors.greenSupportingText}]}>{`:${this.props.emojiName}:`}</Text>
                <FlatList
                    data={this.props.users}
                    renderItem={this.renderItem}
                    keyExtractor={item => item.accountID}
                    style={styles.mb3}
                />
            </View>
        );
    }
}

BaseReactionList.propTypes = propTypes;
BaseReactionList.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withBetas(),
    withWindowDimensions,
)(BaseReactionList);
