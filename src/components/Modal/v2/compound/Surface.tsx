import React from 'react';
import type {ReactNode} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import AnimatedSurface from '@components/Overlay/AnimatedSurface';
import type {AnimationSpec} from '@components/Overlay/AnimatedSurface';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import easing from './easing';
import SwipeToDismiss from './SwipeToDismiss';
import type {AnimationIn, AnimationOut, SwipeDirection} from './types';

type SurfaceProps = {
    role: typeof CONST.ROLE.DIALOG | typeof CONST.ROLE.ALERTDIALOG;
    labelledBy?: string;
    describedBy?: string;
    accessibilityLabel?: string;
    nativeID?: string;
    animationIn: AnimationIn;
    animationOut: AnimationOut;
    animationInTiming: number;
    animationOutTiming: number;
    style?: StyleProp<ViewStyle>;
    innerStyle?: StyleProp<ViewStyle>;
    swipeDirections?: readonly SwipeDirection[];
    onSwipeDismiss?: () => void;
    children: ReactNode;
};

const ENTER_SPECS: Record<AnimationIn, AnimationSpec> = {
    fadeIn: {
        from: {opacity: 0, translateX: 0, translateY: 0},
        to: {opacity: 1, translateX: 0, translateY: 0},
    },
    slideInRight: {
        from: {opacity: 1, translateX: '100%', translateY: 0},
        to: {opacity: 1, translateX: '0%', translateY: 0},
    },
    slideInUp: {
        from: {opacity: 1, translateX: 0, translateY: '100%'},
        to: {opacity: 1, translateX: 0, translateY: '0%'},
    },
    slideAndFadeInRight: {
        from: {opacity: 0, translateX: CONST.MODAL.RHP_ENTER_OFFSET_PX_WEB, translateY: 0},
        to: {opacity: 1, translateX: 0, translateY: 0},
    },
};

const EXIT_SPECS: Record<AnimationOut, AnimationSpec> = {
    fadeOut: {
        from: {opacity: 1, translateX: 0, translateY: 0},
        to: {opacity: 0, translateX: 0, translateY: 0},
    },
    slideOutRight: {
        from: {opacity: 1, translateX: '0%', translateY: 0},
        to: {opacity: 1, translateX: '100%', translateY: 0},
    },
    slideOutDown: {
        from: {opacity: 1, translateX: 0, translateY: '0%'},
        to: {opacity: 1, translateX: 0, translateY: '100%'},
    },
    slideAndFadeOutRight: {
        from: {opacity: 1, translateX: 0, translateY: 0},
        to: {opacity: 0, translateX: CONST.MODAL.RHP_ENTER_OFFSET_PX_WEB, translateY: 0},
    },
};

function Surface({
    role,
    labelledBy,
    describedBy,
    accessibilityLabel,
    nativeID,
    animationIn,
    animationOut,
    animationInTiming,
    animationOutTiming,
    style,
    innerStyle,
    swipeDirections,
    onSwipeDismiss,
    children,
}: SurfaceProps) {
    const styles = useThemeStyles();
    return (
        <View
            pointerEvents="box-none"
            style={style}
        >
            <SwipeToDismiss
                swipeDirections={swipeDirections}
                onSwipeDismiss={onSwipeDismiss}
            >
                <AnimatedSurface
                    role={role}
                    aria-modal
                    accessibilityLabel={accessibilityLabel}
                    accessibilityLabelledBy={labelledBy}
                    accessibilityDescribedBy={describedBy}
                    nativeID={nativeID}
                    enterSpec={ENTER_SPECS[animationIn]}
                    exitSpec={EXIT_SPECS[animationOut]}
                    enterTiming={animationInTiming}
                    exitTiming={animationOutTiming}
                    easing={easing}
                    style={[styles.modalAnimatedContainer, innerStyle]}
                >
                    {children}
                </AnimatedSurface>
            </SwipeToDismiss>
        </View>
    );
}

export default Surface;
