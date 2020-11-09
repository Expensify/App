import React, {
    useEffect,
    useRef,
    useCallback,
    forwardRef
} from 'react';
import {Text} from 'react-native';
import PropTypes from 'prop-types';
import BaseInvertedFlatList from './BaseInvertedFlatList';

const propTypes = {
    // Passed via forwardRef so we can access the FlatList ref
    innerRef: PropTypes.func.isRequired,
};

const COMMENT_SEPARATOR_STRING = 'mgoofgq42l';

// This is copied from https://codesandbox.io/s/react-native-dsyse
// It's a HACK alert since FlatList has inverted scrolling on web
const InvertedFlatList = (props) => {
    const ref = useRef(null);

    const invertedWheelEvent = useCallback((e) => {
        ref.current.getScrollableNode().scrollTop -= e.deltaY;
        e.preventDefault();
    }, []);

    const copyTextEvent = useCallback((e) => {
        const selection = document.getSelection();
        const reverseSelection = selection.toString().split(COMMENT_SEPARATOR_STRING).reverse().join('');
        e.clipboardData.setData('text/plain', reverseSelection);
        e.preventDefault();
    }, []);

    useEffect(() => {
        props.innerRef(ref.current);
    }, []);

    useEffect(() => {
        const currentRef = ref.current;
        if (currentRef != null) {
            currentRef
                .getScrollableNode()
                .addEventListener('wheel', invertedWheelEvent);

            currentRef
                .getScrollableNode()
                .addEventListener('copy', copyTextEvent);

            currentRef.setNativeProps({
                style: {
                    transform: 'translate3d(0,0,0) scaleY(-1)'
                },
            });
        }

        return () => {
            if (currentRef != null) {
                currentRef
                    .getScrollableNode()
                    .removeEventListener('wheel', invertedWheelEvent);

                currentRef
                    .getScrollableNode()
                    .removeEventListener('copy', copyTextEvent);
            }
        };
    }, [ref, invertedWheelEvent, copyTextEvent]);

    return (
        <BaseInvertedFlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            shouldMeasureItems
            ItemSeparatorComponent={() => (
                <Text
                    style={{
                        color: 'transparent',
                        height: 0,
                        userSelect: 'none',
                    }}
                >
                    {COMMENT_SEPARATOR_STRING}
                </Text>
            )}
        />
    );
};

InvertedFlatList.propTypes = propTypes;

export default forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <InvertedFlatList {...props} innerRef={ref} />
));
