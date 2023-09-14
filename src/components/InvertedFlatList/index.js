import React, {forwardRef} from 'react';
import PropTypes from 'prop-types';
import {DeviceEventEmitter, FlatList, StyleSheet} from 'react-native';
import _ from 'underscore';
import BaseInvertedFlatList from './BaseInvertedFlatList';
import styles from '../../styles/styles';
import CONST from '../../CONST';

const propTypes = {
    /** Passed via forwardRef so we can access the FlatList ref */
    innerRef: PropTypes.shape({
        current: PropTypes.instanceOf(FlatList),
    }).isRequired,

    /** Any additional styles to apply */
    // eslint-disable-next-line react/forbid-prop-types
    contentContainerStyle: PropTypes.any,

    /** Same as for FlatList */
    onScroll: PropTypes.func,
};

// This is adapted from https://codesandbox.io/s/react-native-dsyse
// It's a HACK alert since FlatList has inverted scrolling on web
class InvertedFlatList extends React.Component {
    constructor(props) {
        super(props);

        this.list = undefined;
        this.lastScrollEvent = null;
        this.scrollEndTimeout = null;
        this.updateInProgress = false;
        this.eventHandler = null;

        this.handleScroll = this.handleScroll.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.onScrollEnd = this.onScrollEnd.bind(this);
    }

    componentDidMount() {
        if (!_.isFunction(this.props.innerRef)) {
            // eslint-disable-next-line no-param-reassign
            this.props.innerRef.current = this.list;
        } else {
            this.props.innerRef(this.list);
        }
    }

    componentWillUnmount() {
        if (this.scrollEndTimeout) {
            clearTimeout(this.scrollEndTimeout);
        }

        if (this.eventHandler) {
            this.eventHandler.remove();
        }
    }

    /**
     * Emits when the scrolling is in progress. Also,
     * invokes the onScroll callback function from props.
     *
     * @param {Event} event - The onScroll event from the FlatList
     */
    onScroll(event) {
        this.props.onScroll(event);

        if (!this.updateInProgress) {
            this.updateInProgress = true;
            this.eventHandler = DeviceEventEmitter.emit(CONST.EVENTS.SCROLLING, true);
        }
    }

    /**
     * Emits when the scrolling has ended.
     */
    onScrollEnd() {
        this.eventHandler = DeviceEventEmitter.emit(CONST.EVENTS.SCROLLING, false);
        this.updateInProgress = false;
    }

    /**
     * Decides whether the scrolling has ended or not. If it has ended,
     * then it calls the onScrollEnd function. Otherwise, it calls the
     * onScroll function and pass the event to it.
     *
     * This is a temporary work around, since react-native-web doesn't
     * support onScrollBeginDrag and onScrollEndDrag props for FlatList.
     * More info:
     * https://github.com/necolas/react-native-web/pull/1305
     *
     * This workaround is taken from below and refactored to fit our needs:
     * https://github.com/necolas/react-native-web/issues/1021#issuecomment-984151185
     *
     * @param {Event} event - The onScroll event from the FlatList
     */
    handleScroll(event) {
        this.onScroll(event);
        const timestamp = Date.now();

        if (this.scrollEndTimeout) {
            clearTimeout(this.scrollEndTimeout);
        }

        if (this.lastScrollEvent) {
            this.scrollEndTimeout = setTimeout(() => {
                if (this.lastScrollEvent !== timestamp) {
                    return;
                }
                // Scroll has ended
                this.lastScrollEvent = null;
                this.onScrollEnd();
            }, 250);
        }

        this.lastScrollEvent = timestamp;
    }

    render() {
        return (
            <BaseInvertedFlatList
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
                inverted
                ref={(el) => (this.list = el)}
                shouldMeasureItems
                contentContainerStyle={StyleSheet.compose(this.props.contentContainerStyle, styles.justifyContentEnd)}
                onScroll={this.handleScroll}
            />
        );
    }
}

InvertedFlatList.propTypes = propTypes;
InvertedFlatList.defaultProps = {
    contentContainerStyle: {},
    onScroll: () => {},
};

export default forwardRef((props, ref) => (
    <InvertedFlatList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));
