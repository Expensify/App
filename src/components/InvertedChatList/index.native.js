import React, {forwardRef} from 'react';
import {FlatList} from 'react-native';
import PropTypes from 'prop-types';
import isConsecutiveActionMadeByPreviousActor from './isConsecutiveActionMadeByPreviousActor';

const propTypes = {
    // Passed via forwardRef so we can access the FlatList ref
    innerRef: PropTypes.func.isRequired,
};

class InvertedChatList extends React.Component {
    constructor(props) {
        super(props);
        this.renderItem = this.renderItem.bind(this);
    }

    renderItem({item, index}) {
        const displayAsGroup = isConsecutiveActionMadeByPreviousActor({
            actions: this.props.data,
            index,
            reversed: true,
        });
        return this.props.renderItem({item, displayAsGroup});
    }

    render() {
        return (
            <FlatList
                {...this.props}
                renderItem={this.renderItem}
                data={this.props.data.slice().reverse()}
                ref={this.props.innerRef}
                bounces={false}
                maxToRenderPerBatch={15}
                updateCellsBatchingPeriod={40}
                inverted

                // Setting removeClippedSubviews will break text selection on Android
                // eslint-disable-next-line react/jsx-props-no-multi-spaces
                removeClippedSubviews={false}
            />
        );
    }
}

InvertedChatList.propTypes = propTypes;

export default forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <InvertedChatList {...props} innerRef={ref} />
));
