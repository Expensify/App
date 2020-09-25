import React, {useEffect, useRef, useCallback, forwardRef} from "react";
import BaseInvertedFlatList from './BaseInvertedFlatList';

// This is copied from https://codesandbox.io/s/react-native-dsyse
// It's a HACK alert since FlatList has inverted scrolling on web
const InvertedFlatList = (props) => {
    const ref = useRef(null);

    const invertedWheelEvent = useCallback(e => {
        ref.current.getScrollableNode().scrollTop -= e.deltaY;
        e.preventDefault();
    }, []);

    useEffect(() => {
        props.forwardedRef(ref);
    }, []);

    useEffect(() => {
        const currentRef = ref.current;
        if (currentRef != null) {
            currentRef
                .getScrollableNode()
                .addEventListener("wheel", invertedWheelEvent);

            currentRef.setNativeProps({
                style: {
                    transform: "translate3d(0,0,0) scaleY(-1)"
                }
            });
        }

        return () => {
            if (currentRef != null) {
                currentRef
                    .getScrollableNode()
                    .removeEventListener("wheel", invertedWheelEvent);
            }
        };
    }, [ref, invertedWheelEvent]);

    return (
        <BaseInvertedFlatList
            {...props}
            ref={ref}
        />
    );
};

export default forwardRef((props, ref) => (
    <InvertedFlatList {...props} forwardedRef={ref} />
));
