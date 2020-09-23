import _ from 'underscore';
import React, {forwardRef} from 'react';
import {View} from 'react-native';
import {VariableSizeList} from 'react-window-reversed';


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
        this.setState({listHeight: this.list.offsetHeight}, () => {
            // This is unfortunate, but it's really difficult to tell when the initial
            // set of items have rendered and until then there's no guarantee that we
            // will scroll to the exact bottom of the list due to how the programmatic
            // scroll in react-window works.

            // eslint-disable-next-line no-underscore-dangle
            _.defer(() => this.listRef._outerRef.scrollTo({top: this.listRef._outerRef.scrollHeight}), 0);
        });
    }

    shouldComponentUpdate(prevProps, prevState) {
        return prevProps.data.length !== this.props.data.length
            || prevState.listHeight !== this.state.listHeight;
    }

    /**
     * @TODO this shouldn't really be specific to report actions
     *
     * @param {Number} index
     * @returns {Number}
     */
    getSize(index) {
        const {action} = this.props.data[index];
        if (action.actionName !== 'ADDCOMMENT') {
            return 0;
        }

        return this.sizeMap[index] || 42;
    }

    render() {
        return (
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
                    overscanCount={5}
                    reversed
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
                                needsLayoutCalculation: style.height === 42,
                            })}
                        </div>
                    )}
                </VariableSizeList>
            </View>
        );
    }
}

export default forwardRef((props, forwardedRef) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <InvertedFlatList {...props} forwardedRef={forwardedRef} />
));
