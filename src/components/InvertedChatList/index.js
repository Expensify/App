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

    componentDidMount() {
        this.props.innerRef({
            scrollToIndex: this.scrollToBottom.bind(this),
        });
    }

    /**
     * FlatList on web cannot be inverted as it messes up text selection.
     * Additionally, it's not possible to easily scroll to the bottom so we
     * are reimplementing this method here.
     */
    scrollToBottom() {
        console.log('scrolling to bottom!');
        setTimeout(() => {
            const offset = this.flatList.getScrollableNode().scrollHeight;
            this.flatList.scrollToOffset({offset: offset, animated: false});
        }, 200);
    }

    renderItem({item, index}) {
        const displayAsGroup = isConsecutiveActionMadeByPreviousActor({
            actions: this.props.data,
            index,
        });
        return this.props.renderItem({item, displayAsGroup});
    }

    render() {
        return (
            <FlatList
                {...this.props}
                renderItem={this.renderItem}
                ref={el => this.flatList = el}
                onContentSizeChange={() => {
                    this.scrollToBottom();
                }}
            />
        );
    }
}

InvertedChatList.propTypes = propTypes;

export default forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <InvertedChatList {...props} innerRef={ref} />
));
