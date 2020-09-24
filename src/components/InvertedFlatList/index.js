import React, {forwardRef, createContext, Component} from 'react';
import {View} from 'react-native';
import {VariableSizeList} from 'react-window';
import styles from '../../style/StyleSheet';

const ReactWindowContext = createContext({});
const DEFAULT_ROW_HEIGHT = 42;

/**
 * This is the innermost element and we are passing it as a custom
 * component so that we can overwrite some styles and simulate
 * an inverse FlatList with items starting from the bottom of the
 * scroll position by adding additional margin. react-window has no
 * inverted feature so this works around the existing API.
 */
const innerElement = forwardRef((props, ref) => (
    <ReactWindowContext.Consumer>
        {({dimensions}) => {
            const innerHeight = props.style.height;
            const top = dimensions.top || 0;
            const height = dimensions.height || 0;
            const difference = height - top - innerHeight;

            return (
                <div
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    ref={ref}
                    style={{
                        ...props.style,
                        position: 'relative',
                        marginTop: difference > 0 ? difference : 0,
                    }}
                />
            );
        }}
    </ReactWindowContext.Consumer>
));

/**
 * This component is a recreation of FlatList for web.
 * FlatList when used with an "inverted" prop does not work
 * correctly on web but works fine for mobile so we are
 * using react-window here to create our inverted list
 * scroller to improve performance on web.
 */
class InvertedFlatList extends Component {
    constructor(props) {
        super(props);

        this.getSize = this.getSize.bind(this);

        // Stores each item's computed height after it renders
        // once and is reference for the life of the component
        this.sizeMap = {};
        this.state = {listHeight: 0};
    }

    componentDidMount() {
        // Set the height of the list after the component mounts
        // and then scroll to the bottom.
        this.setState({listHeight: this.list.offsetHeight}, () => {
            this.scrollToEnd();
        });

        // This allows us to call this.listRef.scrollToEnd() from
        // the parent component where this will be used.
        this.props.forwardedRef({
            scrollToEnd: () => this.scrollToEnd(),
        });
    }

    shouldComponentUpdate(prevProps, prevState) {
        // We only need to update when the data length changes
        // or the list height changes (since we are calculating the
        // height on the first render pass)
        return prevProps.data.length !== this.props.data.length
            || prevState.listHeight !== this.state.listHeight;
    }

    /**
     * Returns a previously recorded size or the default.
     *
     * The default is not a minimum, but the initial height
     * to pass to react-window so that we can calculate and
     * cache the actual height.
     *
     * @param {Number} index
     * @returns {Number}
     */
    getSize(index) {
        return this.sizeMap[index] || DEFAULT_ROW_HEIGHT;
    }

    /**
     * ScrollToEnd implementation. Similar to FlatListInstance.scrollToEnd()
     */
    scrollToEnd() {
        this.listRef.scrollToItem(this.props.data.length - 1, 'end');
    }

    render() {
        return (
            <ReactWindowContext.Provider
                // These values are passed via context as there seems to
                // be no way to pass additional props to the innerElement
                // controlled by react-window
                value={{dimensions: this.list ? this.list.getBoundingClientRect() : {}}}
            >
                <View
                    style={styles.flex1}
                    ref={el => this.list = el}
                >
                    <VariableSizeList
                        height={this.state.listHeight}
                        itemCount={this.props.data.length}
                        itemSize={this.getSize}
                        width="100%"
                        ref={el => this.listRef = el}
                        overscanCount={1}
                        innerRef={el => this.innerRef = el}
                        outerRef={el => this.outerRef = el}
                        innerElementType={innerElement}
                    >
                        {({index, style}) => (
                            // Do not modify or remove these styles they are
                            // required by react-window to function correctly
                            <div style={style}>
                                {this.props.renderItem({
                                    item: this.props.data[index],
                                    index,
                                    onLayout: ({nativeEvent}) => {
                                        const computedHeight = nativeEvent.layout.height;
                                        if (computedHeight === DEFAULT_ROW_HEIGHT) {
                                            throw new Error('InvertedFlatList rendered row height equal to the constant default height.');
                                        }
                                        const prevSize = this.sizeMap[index] || 0;
                                        if (prevSize !== computedHeight) {
                                            this.sizeMap[index] = computedHeight;
                                            this.listRef.resetAfterIndex(0);
                                        }
                                    },

                                    // Default row height is a magic number. In the event that we
                                    // have a row that is the exact same size we will get caught in
                                    // an infinite loop. Avoid setting row heights to this.
                                    needsLayoutCalculation: style.height === DEFAULT_ROW_HEIGHT,
                                })}
                            </div>
                        )}
                    </VariableSizeList>
                </View>
            </ReactWindowContext.Provider>
        );
    }
}

export default forwardRef((props, forwardedRef) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <InvertedFlatList {...props} forwardedRef={forwardedRef} />
));
