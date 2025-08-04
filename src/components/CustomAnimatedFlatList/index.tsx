import type {PropsWithChildren} from 'react';
import React, {forwardRef, useRef} from 'react';
import type {FlatListProps, LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import {FlatList} from 'react-native';
import type {AnimatedProps, AnimatedStyle, ILayoutAnimationBuilder} from 'react-native-reanimated';
import Animated, {LayoutAnimationConfig} from 'react-native-reanimated';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

type CellRendererComponentProps = {
    onLayout?: ((event: LayoutChangeEvent) => void) | undefined;
    children: React.ReactNode;
    style?: StyleProp<AnimatedStyle<ViewStyle>>;
};

const createCellRendererComponent = (
    CellRendererComponentProp?: React.FC<PropsWithChildren> | null,
    itemLayoutAnimationRef?: React.MutableRefObject<ILayoutAnimationBuilder | undefined>,
) => {
    function CellRendererComponent(props: CellRendererComponentProps) {
        return (
            <Animated.View
                // TODO TYPESCRIPT This is temporary cast is to get rid of .d.ts file.
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
                layout={itemLayoutAnimationRef?.current as any}
                onLayout={props.onLayout}
                style={props.style}
            >
                {CellRendererComponentProp ? <CellRendererComponentProp>{props.children}</CellRendererComponentProp> : props.children}
            </Animated.View>
        );
    }

    return CellRendererComponent;
};

type ReanimatedFlatListPropsWithLayout<T> = {
    /**
     * Lets you pass layout animation directly to the FlatList item.
     */
    itemLayoutAnimation?: ILayoutAnimationBuilder;
    /**
     * Lets you skip entering and exiting animations of FlatList items when on FlatList mount or unmount.
     */
    skipEnteringExitingAnimations?: boolean;
} & AnimatedProps<FlatListProps<T>>;

// Since createAnimatedComponent return type is ComponentClass that has the props of the argument,
// but not things like NativeMethods, etc. we need to add them manually by extending the type.
type AnimatedFlatListComplement<T> = {
    getNode(): FlatList<T>;
} & FlatList<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CustomAnimatedFlatListAdditionalProps<Item = any> = Omit<ReanimatedFlatListPropsWithLayout<Item>, 'CellRendererComponent'> & {
    CellRendererComponent?: React.FC<PropsWithChildren> | null;
};

// We need explicit any here, because this is the exact same type that is used in React Native types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FlatListForwardRefRender<Item = any>(props: ReanimatedFlatListPropsWithLayout<Item> & CustomAnimatedFlatListAdditionalProps<Item>, ref: React.ForwardedRef<FlatList>) {
    const {itemLayoutAnimation, skipEnteringExitingAnimations, ...restProps} = props;

    // Set default scrollEventThrottle, because user expects
    // to have continuous scroll events and
    // react-native defaults it to 50 for FlatLists.
    // We set it to 1, so we have peace until
    // there are 960 fps screens.
    if (!('scrollEventThrottle' in restProps)) {
        // eslint-disable-next-line react-compiler/react-compiler
        restProps.scrollEventThrottle = 1;
    }

    const itemLayoutAnimationRef = useRef(itemLayoutAnimation);
    itemLayoutAnimationRef.current = itemLayoutAnimation;

    const CellRendererComponent = React.useMemo(
        () => createCellRendererComponent(props.CellRendererComponent, itemLayoutAnimationRef),
        [itemLayoutAnimationRef, props.CellRendererComponent],
    );

    const animatedFlatList = (
        // @ts-expect-error In its current type state, createAnimatedComponent cannot create generic components.
        <AnimatedFlatList
            ref={ref}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            CellRendererComponent={CellRendererComponent}
        />
    );

    if (skipEnteringExitingAnimations === undefined) {
        return animatedFlatList;
    }

    return (
        <LayoutAnimationConfig
            skipEntering
            skipExiting
        >
            {animatedFlatList}
        </LayoutAnimationConfig>
    );
}

/** This is a copy of the Animated.Flatlist implementation to implement a custom CellRendererComponent */
const CustomAnimatedFlatList = forwardRef(FlatListForwardRefRender) as <
    // We need explicit any here, because this is the exact same type that is used in React Native types.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ItemT = any,
>(
    props: ReanimatedFlatListPropsWithLayout<ItemT> & {
        ref?: React.ForwardedRef<FlatList>;
    } & CustomAnimatedFlatListAdditionalProps,
) => React.ReactElement;

type ReanimatedFlatList<T> = typeof AnimatedFlatList & AnimatedFlatListComplement<T>;

export {type ReanimatedFlatList};

export default CustomAnimatedFlatList;
