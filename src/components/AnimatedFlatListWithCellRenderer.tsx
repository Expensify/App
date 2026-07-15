/**
 * This is a copy of the FlatList implementation from 'react-native-reanimated' in order to implement a custom CellRendererComponent.
 * This should be updated when the original implementation updates
 * Taken from: https://github.com/software-mansion/react-native-reanimated/blob/main/packages/react-native-reanimated/src/component/FlatList.tsx
 */
import type {Ref} from 'react';
import type {FlatListProps, CellRendererProps as RNCellRendererProps} from 'react-native';
import type {AnimatedProps, ILayoutAnimationBuilder} from 'react-native-reanimated';

import React, {createContext, useContext} from 'react';
import {FlatList} from 'react-native';
import Animated, {LayoutAnimationConfig} from 'react-native-reanimated';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

type CellRendererComponentProps<T> = React.ComponentType<RNCellRendererProps<T>> | null | undefined;

type CellRendererConfig = {
    itemLayoutAnimation?: ILayoutAnimationBuilder;
    outerCellRenderer?: CellRendererComponentProps<unknown>;
};

const CellRendererConfigContext = createContext<CellRendererConfig>({});

/**
 * Module-scope cell renderer so OXC's React Compiler can discover and memoize it.
 * `itemLayoutAnimation` and the optional outer renderer are read from context because
 * FlatList only passes standard cell props to `CellRendererComponent`.
 */
function CellRendererComponentImpl(props: RNCellRendererProps<unknown>) {
    const {itemLayoutAnimation, outerCellRenderer: OuterCellRenderer} = useContext(CellRendererConfigContext);

    return (
        <Animated.View
            // TODO TYPESCRIPT This is temporary cast is to get rid of .d.ts file.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
            layout={itemLayoutAnimation as any}
            onLayout={props.onLayout}
            style={OuterCellRenderer ? undefined : props.style}
        >
            {OuterCellRenderer ? <OuterCellRenderer {...props}>{props.children}</OuterCellRenderer> : props.children}
        </Animated.View>
    );
}

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnimatedFlatListWithCellRendererProps<Item = any> = Omit<ReanimatedFlatListPropsWithLayout<Item>, 'CellRendererComponent' | 'onScroll' | 'inverted'> & {
    CellRendererComponent?: CellRendererComponentProps<Item>;
    onScroll?: FlatListProps<Item>['onScroll'];
    inverted?: boolean | null | undefined;
    ref?: Ref<FlatList>;
};

/**
 * Non-generic implementation so OXC's React Compiler can memoize the component.
 * OXC bails on type params inside components ("Unsupported declaration type for hoisting").
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FlatListRenderImpl(props: AnimatedFlatListWithCellRendererProps<unknown>) {
    const {itemLayoutAnimation, skipEnteringExitingAnimations, ref, CellRendererComponent: outerCellRenderer, ...restProps} = props;

    // Set default scrollEventThrottle, because user expects
    // to have continuous scroll events and
    // react-native defaults it to 50 for FlatLists.
    // We set it to 1, so we have peace until
    // there are 960 fps screens.
    if (!('scrollEventThrottle' in restProps)) {
        restProps.scrollEventThrottle = 1;
    }

    const cellRendererConfig: CellRendererConfig = {itemLayoutAnimation, outerCellRenderer};

    const animatedFlatList = (
        <CellRendererConfigContext.Provider value={cellRendererConfig}>
            <AnimatedFlatList
                ref={ref}
                {...restProps}
                CellRendererComponent={CellRendererComponentImpl}
            />
        </CellRendererConfigContext.Provider>
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

// We need explicit any here, because this is the exact same type that is used in React Native types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FlatListRender<Item = any>(props: AnimatedFlatListWithCellRendererProps<Item>) {
    return <FlatListRenderImpl {...(props as AnimatedFlatListWithCellRendererProps<unknown>)} />;
}

const AnimatedFlatListWithCellRenderer = FlatListRender as <
    // We need explicit any here, because this is the exact same type that is used in React Native types.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ItemT = any,
>(
    props: AnimatedFlatListWithCellRendererProps<ItemT>,
) => React.ReactElement;

export type {AnimatedFlatListWithCellRendererProps};

export default AnimatedFlatListWithCellRenderer;
