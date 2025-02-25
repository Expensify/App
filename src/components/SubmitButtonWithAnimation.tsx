import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import {OnyxEntry} from 'react-native-onyx';
import Animated, {runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import {submitReport} from '@libs/actions/IOU';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import Button from './Button';
import {Send} from './Icon/Expensicons';

interface SubmitButtonWithAnimationProps {
    isWaitingForSubmissionFromCurrentUser?: boolean;
    iouReport: OnyxEntry<OnyxTypes.Report>;
    shouldDisableSubmitButton: boolean;
    startSubmitAnimation: () => void;
    isSubmitAnimationRunning: boolean;
    onAnimationFinish: () => void;
}

function SubmitButtonWithAnimation({
    isWaitingForSubmissionFromCurrentUser,
    iouReport,
    shouldDisableSubmitButton,
    startSubmitAnimation,
    isSubmitAnimationRunning,
    onAnimationFinish,
}: SubmitButtonWithAnimationProps) {
    const {translate} = useLocalize();
    const height = useSharedValue(40);
    const opacity = useSharedValue(1);

    const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
    const [showSubmittedText, setShowSubmittedText] = useState(false);

    const containerStyles = useAnimatedStyle(() => ({
        height: height.value,
        opacity: opacity.value,
        overflow: 'hidden',
    }));

    useEffect(() => {
        if (!isSubmitAnimationRunning) {
            height.value = 40;
            opacity.value = 1;
            return;
        }

        // Step 1: Show loading indicator for 1 second
        setShowLoadingIndicator(true);
        setTimeout(() => {
            setShowLoadingIndicator(false);
            setShowSubmittedText(true);
        }, 1000);

        // Step 2: Show "Submitted" text for 1 second
        setTimeout(() => {
            opacity.value = withTiming(0, {duration: CONST.ANIMATION_SUBMITTED_TEXT_DELAY});
            height.value = withTiming(0, {duration: CONST.ANIMATION_SUBMITTED_HEIGHT_DURATION}, () => runOnJS(onAnimationFinish)());
        }, CONST.ANIMATION_SUBMITTED_TEXT_DURATION);
    }, [isSubmitAnimationRunning, onAnimationFinish, height, opacity]);

    return (
        <Animated.View style={containerStyles}>
            <Button
                success={isWaitingForSubmissionFromCurrentUser}
                icon={showSubmittedText ? Send : undefined}
                text={showSubmittedText ? translate('common.submitted') : translate('common.submit')}
                isLoading={showLoadingIndicator}
                onPress={() => {
                    startSubmitAnimation();
                    iouReport && submitReport(iouReport);
                }}
                isDisabled={shouldDisableSubmitButton}
            />
        </Animated.View>
    );
}

SubmitButtonWithAnimation.displayName = 'SubmitButtonWithAnimation';

export default SubmitButtonWithAnimation;
