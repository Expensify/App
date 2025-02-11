import React, {useEffect, useMemo} from 'react';
import Animated, {Keyframe, runOnJS} from 'react-native-reanimated';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import SettlementButton from '.';
import type SettlementButtonProps from './types';

type AnimatedSettlementButtonProps = SettlementButtonProps & {
    isPaidAnimationRunning: boolean;
    onAnimationFinish: () => void;
    onLoadingEnd?: () => void;
    isApprovedAnimationRunning: boolean;
    shouldAddTopMargin?: boolean;
    canIOUBePaid: boolean;
};

function AnimatedSettlementButton({
    isPaidAnimationRunning,
    isApprovedAnimationRunning,
    onAnimationFinish,
    onLoadingEnd,
    shouldAddTopMargin = false,
    isDisabled,
    canIOUBePaid,
    wrapperStyle,
    ...settlementButtonProps
}: AnimatedSettlementButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const isAnimationRunning = isPaidAnimationRunning || isApprovedAnimationRunning;
    const buttonDuration = CONST.ANIMATION_PAID_DURATION;
    const marginTop = styles.expenseAndReportPreviewTextButtonContainer.gap;
    const [canShow, setCanShow] = React.useState(true);

    const buttonAnimation = useMemo(
        () =>
            new Keyframe({
                from: {
                    opacity: 1,
                    transform: [{scale: 1}],
                },
                to: {
                    opacity: 0,
                    transform: [{scale: 0}],
                },
            })
                .duration(buttonDuration)
                .withCallback(() => {
                    'worklet';

                    runOnJS(onAnimationFinish)();
                }),
        [buttonDuration, onAnimationFinish],
    );

    const containerExitingAnimation = useMemo(
        () =>
            new Keyframe({
                from: {
                    height: variables.componentSizeNormal,
                },
                to: {
                    height: 0,
                },
            }).duration(buttonDuration * 2),
        [buttonDuration],
    );

    let icon;
    if (isApprovedAnimationRunning) {
        icon = Expensicons.ThumbsUp;
    } else if (isPaidAnimationRunning) {
        icon = Expensicons.Checkmark;
    }

    useEffect(() => {
        if (!isAnimationRunning) {
            setCanShow(true);
            return;
        }
        const frame = setTimeout(() => setCanShow(false), CONST.ANIMATION_HIDE_DELAY);
        return () => clearTimeout(frame);
    }, [isAnimationRunning]);

    return (
        <Animated.View
            exiting={isAnimationRunning ? containerExitingAnimation : undefined}
            style={[shouldAddTopMargin && {marginTop}, {height: variables.componentSizeNormal}, styles.justifyContentCenter, styles.overflowHidden, wrapperStyle]}
        >
            {isAnimationRunning && canShow && (
                <Animated.View exiting={buttonAnimation}>
                    <Button
                        text={isApprovedAnimationRunning ? translate('iou.approved') : translate('iou.paymentComplete')}
                        success
                        icon={icon}
                    />
                </Animated.View>
            )}
            {!isAnimationRunning && (
                <SettlementButton
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...settlementButtonProps}
                    wrapperStyle={wrapperStyle}
                    isDisabled={isAnimationRunning || isDisabled}
                />
            )}
        </Animated.View>
    );
}

AnimatedSettlementButton.displayName = 'AnimatedSettlementButton';

export default AnimatedSettlementButton;
