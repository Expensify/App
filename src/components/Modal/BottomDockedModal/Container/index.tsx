import React, {useMemo} from 'react';
import {View} from 'react-native';
import Animated, {runOnJS} from 'react-native-reanimated';
import {SlideIn, SlideOut} from '@components/Modal/BottomDockedModal/animations';
import type ModalProps from '@components/Modal/BottomDockedModal/types';
import type {ContainerProps} from '@components/Modal/BottomDockedModal/types';
import useThemeStyles from '@hooks/useThemeStyles';

function Container({style, animationInDelay = 100, animationInTiming = 300, animationOutTiming = 300, onCloseCallBack, onOpenCallBack, ...props}: Partial<ModalProps> & ContainerProps) {
    const styles = useThemeStyles();

    const Entering = useMemo(() => {
        return SlideIn.delay(animationInDelay)
            .duration(animationInTiming)
            .withCallback(() => {
                'worklet';

                runOnJS(onOpenCallBack)();
            });
    }, [animationInDelay, animationInTiming, onOpenCallBack]);

    const Exiting = useMemo(() => {
        return SlideOut.duration(animationOutTiming).withCallback(() => {
            'worklet';

            runOnJS(onCloseCallBack)();
        });
    }, [animationOutTiming, onCloseCallBack]);

    return (
        <View
            style={[style, styles.modalContainer]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            <Animated.View
                style={styles.modalAnimatedContainer}
                entering={Entering}
                exiting={Exiting}
            >
                {props.children}
            </Animated.View>
        </View>
    );
}

Container.displayName = 'ModalContainer';
export default Container;
