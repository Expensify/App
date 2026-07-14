import type {FlashListRef, FlashListProps} from '@shopify/flash-list';
/**
 * This is a copy of the FlashList implementation from 'react-native-reanimated' in order to implement a custom CellRendererComponent.
 * This should be updated when the original implementation updates
 * Taken from: https://github.com/software-mansion/react-native-reanimated/blob/main/packages/react-native-reanimated/src/component/FlashList.tsx
 */
import type {Ref} from 'react';
import type {CellRendererProps} from 'react-native';
import type {AnimatedProps, ILayoutAnimationBuilder} from 'react-native-reanimated';
import type {AnimatedComponentRef} from 'react-native-reanimated/src/createAnimatedComponent/commonTypes';

import {FlashList} from '@shopify/flash-list';
import React, {useRef} from 'react';
import Animated, {LayoutAnimationConfig} from 'react-native-reanimated';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

type CellRendererComponentType<Item> = React.ComponentType<CellRendererProps<Item>> | null | undefined;

const createCellRendererComponent = <Item,>(CellRendererComponentProp?: CellRendererComponentType<Item>, itemLayoutAnimationRef?: React.RefObject<ILayoutAnimationBuilder | undefined>) => {
    // Make CellRendererComponent specifically use the 'Item' type from its parent scope
    function CellRendererComponent(props: CellRendererProps<Item> & {children: React.ReactNode}) {
        return (
            <Animated.View
                // @ts-expect-error TODO TYPESCRIPT This is temporary cast is to get rid of .d.ts file.
                layout={itemLayoutAnimationRef?.current as unknown}
                onLayout={props.onLayout}
                style={CellRendererComponentProp ? undefined : props.style}
            >
                {CellRendererComponentProp ? <CellRendererComponentProp {...props}>{props.children}</CellRendererComponentProp> : props.children}
            </Animated.View>
        );
    }

    return CellRendererComponent;
};
type ReanimatedFlashListPropsWithLayout<T> = {
    /**
     * Lets you pass layout animation directly to the FlashList item.
     */
    itemLayoutAnimation?: ILayoutAnimationBuilder;
    /**
     * Lets you skip entering and exiting animations of FlashList items when on FlashList mount or unmount.
     */
    skipEnteringExitingAnimations?: boolean;
} & AnimatedProps<FlashListProps<T>>;

// Since createAnimatedComponent return type is ComponentClass that has the props of the argument,
// but not things like NativeMethods, etc. we need to add them manually by extending the type.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnimatedFlashListWithCellRendererProps<Item = any> = Omit<ReanimatedFlashListPropsWithLayout<Item>, 'CellRendererComponent' | 'onScroll' | 'inverted'> & {
    CellRendererComponent?: CellRendererComponentType<Item>;
    onScroll?: FlashListProps<Item>['onScroll'];
    inverted?: boolean | null | undefined;
    ref?: Ref<FlashListRef<Item>>;
};

// We need explicit any here, because this is the exact same type that is used in React Native types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FlashListRender<Item = any>(props: AnimatedFlashListWithCellRendererProps<Item>) {
    const {itemLayoutAnimation, skipEnteringExitingAnimations, ref, ...restProps} = props;

    // Set default scrollEventThrottle, because user expects
    // to have continuous scroll events and
    // react-native defaults it to 50 for FlashLists.
    // We set it to 1, so we have peace until
    // there are 960 fps screens.
    if (!('scrollEventThrottle' in restProps)) {
        restProps.scrollEventThrottle = 1;
    }

    const itemLayoutAnimationRef = useRef(itemLayoutAnimation);
    // eslint-disable-next-line react-hooks/refs
    itemLayoutAnimationRef.current = itemLayoutAnimation;

    const CellRendererComponent = React.useMemo(() => createCellRendererComponent<Item>(props.CellRendererComponent, itemLayoutAnimationRef), [props.CellRendererComponent]);

    const animatedFlashList = (
        <AnimatedFlashList
            {...restProps}
            ref={ref}
            CellRendererComponent={CellRendererComponent}
        />
    );

    if (skipEnteringExitingAnimations === undefined) {
        return animatedFlashList;
    }

    return (
        <LayoutAnimationConfig
            skipEntering
            skipExiting
        >
            {animatedFlashList}
        </LayoutAnimationConfig>
    );
}

const AnimatedFlashListWithCellRenderer = FlashListRender as <
    // We need explicit any here, because this is the exact same type that is used in React Native types.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ItemT = any,
>(
    props: AnimatedFlashListWithCellRendererProps<ItemT>,
) => React.ReactElement;

export type {AnimatedFlashListWithCellRendererProps};

export default AnimatedFlashListWithCellRenderer;
