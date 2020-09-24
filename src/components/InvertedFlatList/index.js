import React, {forwardRef, createContext} from 'react';
import {View} from 'react-native';
import {VariableSizeList} from 'react-window';

const ReactWindowContext = createContext({});
const MINIMUM_ROW_HEIGHT = 42;

/**
 * This is the innermost element and we are passing it as a custom
 * component so that we can overwrite some styles and simulate
 * an inverse FlatList with items starting from the bottom of the
 * scroll position. react-window has no "reverse" feature so we've
 * built something similar around the existing API.
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
 * This component is an alternate implementation of FlatList for web.
 * FlatList with an inverted prop does not work correctly on web but
 * works fine for mobile so we are using react-window here to create
 * our inverted list scroller so eke out extra performance on web.
 */
class InvertedFlatList extends React.Component {
    constructor(props) {
        super(props);

        this.sizeMap = {};

        this.state = {
            listHeight: 0,
        };

        this.getSize = this.getSize.bind(this);
    }

    componentDidMount() {
        // Set the height of the list after the component mounts
        // and then scroll to the bottom.
        this.setState({listHeight: this.list.offsetHeight}, () => {
            this.scrollToEnd();
        });

        this.props.forwardedRef({
            scrollToEnd: () => this.scrollToEnd(),
        });
    }

    shouldComponentUpdate(prevProps, prevState) {
        return prevProps.data.length !== this.props.data.length
            || prevState.listHeight !== this.state.listHeight;
    }

    /**
     * @param {Number} index
     * @returns {Number}
     */
    getSize(index) {
        return this.sizeMap[index] || MINIMUM_ROW_HEIGHT;
    }

    /**
     * Scroll to end implementation for web.
     */
    scrollToEnd() {
        this.listRef.scrollToItem(this.props.data.length - 1, 'end');
    }

    render() {
        return (
            <ReactWindowContext.Provider
                value={{dimensions: this.list ? this.list.getBoundingClientRect() : {}}}
            >
                <View
                    style={{flex: 1}}
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
                            <div style={style}>
                                {this.props.renderItem({
                                    item: this.props.data[index],
                                    index,
                                    onLayout: ({nativeEvent}) => {
                                        const prevSize = this.sizeMap[index] || 0;
                                        if (prevSize !== nativeEvent.layout.height) {
                                            this.sizeMap[index] = nativeEvent.layout.height;
                                            this.listRef.resetAfterIndex(0);
                                        }
                                    },

                                    // Minimum row height is a magic number. In the event that we
                                    // have a row that is the exact same size we will get caught in
                                    // an infinite loop. Do not set row heights to this!
                                    needsLayoutCalculation: style.height === MINIMUM_ROW_HEIGHT,
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
