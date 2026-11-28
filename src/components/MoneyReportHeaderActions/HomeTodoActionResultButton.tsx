import Button from '@components/Button';
import {usePaymentAnimationsContext} from '@components/PaymentAnimationsContext';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';

import CONST from '@src/CONST';

import React, {useEffect, useEffectEvent, useRef} from 'react';
import {View} from 'react-native';

/**
 * Replaces the report's action button with a green button that shows the action's result during a Home to-do review,
 * right before the review moves on to the next report. It matches the result the settlement button shows elsewhere.
 */
type HomeTodoActionResultButtonProps = {
    /** The report the action was taken on */
    reportID: string | undefined;

    /** Keeps the space of the button this one replaces, so the buttons beside it stay in place */
    minWidth: number;
};

function HomeTodoActionResultButton({reportID, minWidth}: HomeTodoActionResultButtonProps) {
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isApprovedAnimationRunning, isPaidAnimationRunning, stopAnimation} = usePaymentAnimationsContext();
    const icons = useMemoizedLazyExpensifyIcons(['ThumbsUp', 'Checkmark', 'Send']);

    let icon = icons.Send;
    let text = translate('common.submitted');
    if (isApprovedAnimationRunning) {
        icon = icons.ThumbsUp;
        text = translate('iou.approved');
    } else if (isPaidAnimationRunning) {
        icon = icons.Checkmark;
        text = translate('iou.paymentComplete');
    }

    // The header stays mounted when the review swaps reports, so the result must not carry over to the next report.
    const resultReportIDRef = useRef(reportID);
    const endResult = useEffectEvent(() => stopAnimation());
    useEffect(() => {
        if (resultReportIDRef.current === reportID) {
            return;
        }
        endResult();
    }, [reportID]);

    // Restores the action button if the review does not move on, e.g. when the server rejects the action
    useEffect(() => {
        const timer = setTimeout(() => endResult(), CONST.HOME_TODO_REVIEW_ANIMATION.RESULT_FALLBACK_DURATION);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={StyleUtils.getMinimumWidth(minWidth)}>
            <Button variant={CONST.BUTTON_VARIANT.SUCCESS}>
                <Button.Icon src={icon} />
                <Button.Text>{text}</Button.Text>
            </Button>
        </View>
    );
}

export default HomeTodoActionResultButton;
