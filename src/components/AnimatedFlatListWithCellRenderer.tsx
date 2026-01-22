/**
 * This is a copy of the FlatList implementation from 'react-native-reanimated' in order to implement a custom CellRendererComponent.
 * This should be updated when the original implementation updates
 * Taken from: https://github.com/software-mansion/react-native-reanimated/blob/main/packages/react-native-reanimated/src/component/FlatList.tsx
 */
// eslint-disable-next-line no-restricted-imports
import React, {forwardRef, useRef} from 'react';
import type {FlatListProps, CellRendererProps as RNCellRendererProps} from 'react-native';
import {FlatList} from 'react-native';
import type {AnimatedProps, ILayoutAnimationBuilder} from 'react-native-reanimated';
import Animated, {LayoutAnimationConfig} from 'react-native-reanimated';

// eslint-disable-next-line @typescript-eslint/no-deprecated
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

type CellRendererComponentProps<T> = React.ComponentType<RNCellRendererProps<T>> | null | undefined;

const createCellRendererComponent = <Item,>(CellRendererComponentProp?: CellRendererComponentProps<Item>, itemLayoutAnimationRef?: React.RefObject<ILayoutAnimationBuilder | undefined>) => {
    // Make CellRendererComponent specifically use the 'Item' type from its parent scope
    function CellRendererComponent(props: RNCellRendererProps<Item>) {
        return (
            <Animated.View
                // TODO TYPESCRIPT This is temporary cast is to get rid of .d.ts file.
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
                layout={itemLayoutAnimationRef?.current as any}
                onLayout={props.onLayout}
                style={CellRendererComponentProp ? undefined : props.style}
            >
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                {CellRendererComponentProp ? <CellRendererComponentProp {...props}>{props.children}</CellRendererComponentProp> : props.children}
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
type AnimatedFlatListWithCellRendererProps<Item = any> = Omit<ReanimatedFlatListPropsWithLayout<Item>, 'CellRendererComponent' | 'onScroll' | 'inverted'> & {
    CellRendererComponent?: CellRendererComponentProps<Item>;
    onScroll?: FlatListProps<Item>['onScroll'];
    inverted?: boolean | null | undefined;
};

// We need explicit any here, because this is the exact same type that is used in React Native types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FlatListForwardRefRender<Item = any>(props: AnimatedFlatListWithCellRendererProps<Item>, ref: React.ForwardedRef<FlatList>) {
    const {itemLayoutAnimation, skipEnteringExitingAnimations, ...restProps} = props;

    // Set default scrollEventThrottle, because user expects
    // to have continuous scroll events and
    // react-native defaults it to 50 for FlatLists.
    // We set it to 1, so we have peace until
    // there are 960 fps screens.
    if (!('scrollEventThrottle' in restProps)) {
        restProps.scrollEventThrottle = 1;
    }

    const itemLayoutAnimationRef = useRef(itemLayoutAnimation);
    itemLayoutAnimationRef.current = itemLayoutAnimation;

    const CellRendererComponent = React.useMemo(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => createCellRendererComponent<any>(props.CellRendererComponent, itemLayoutAnimationRef),
        [props.CellRendererComponent],
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

const AnimatedFlatListWithCellRenderer = forwardRef(FlatListForwardRefRender) as <
    // We need explicit any here, because this is the exact same type that is used in React Native types.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ItemT = any,
>(
    props: AnimatedFlatListWithCellRendererProps<ItemT> & {
        ref?: React.ForwardedRef<FlatList>;
    },
) => React.ReactElement;

type ReanimatedFlatList<T> = typeof AnimatedFlatList & AnimatedFlatListComplement<T>;

export type {ReanimatedFlatList, AnimatedFlatListWithCellRendererProps};

export default AnimatedFlatListWithCellRenderer;
