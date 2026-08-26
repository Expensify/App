import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {CountdownTime, TrialReminderVariant} from '@hooks/useTrialPaymentReminder';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import Button from './ButtonComposed';
import ImageSVG from './ImageSVG';
import Modal from './Modal';
import Text from './Text';

type TrialPaymentReminderModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** The variant of the modal to display */
    variant: TrialReminderVariant;

    /** Number of days remaining for 'nearEnd' variant */
    daysRemaining?: number;

    /** Countdown time for 'countdown' variant */
    countdownTime?: CountdownTime;

    /** Called when user presses Close */
    onClose: () => void;

    /** Called when user presses Add payment card */
    onAddPaymentCard: () => void;
};

function padZero(num: number): string {
    return num.toString().padStart(2, '0');
}

function TrialPaymentReminderModal({isVisible, variant, daysRemaining, countdownTime, onClose, onAddPaymentCard}: TrialPaymentReminderModalProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['ArmWithCardPos']);
    const {translate} = useLocalize();

    return (
        <Modal
            onClose={onClose}
            onBackdropPress={() => {}}
            isVisible={isVisible}
            shouldTreatModalAsCovering
            type={shouldUseNarrowLayout ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            innerContainerStyle={styles.pv0}
            shouldHandleNavigationBack
        >
            <View style={[styles.alignItemsCenter, styles.wAuto, styles.trialReminderIllustrationContainer, styles.pb7]}>
                <ImageSVG
                    src={illustrations.ArmWithCardPos}
                    contentFit="contain"
                />
            </View>
            <View style={[styles.m5]}>
                {variant === CONST.TRIAL_REMINDER_VARIANT.NEAR_END && daysRemaining !== undefined && (
                    <Text style={[styles.textSuccess, styles.textStrong, styles.mb2]}>{translate('trialPaymentReminder.trialEndsInDays', {count: daysRemaining})}</Text>
                )}
                {variant === CONST.TRIAL_REMINDER_VARIANT.COUNTDOWN && !!countdownTime && (
                    <Text style={[styles.textSuccess, styles.textStrong, styles.mb2]}>
                        {translate('trialPaymentReminder.trialEndsCountdown', {
                            hours: padZero(countdownTime.hours),
                            minutes: padZero(countdownTime.minutes),
                            seconds: padZero(countdownTime.seconds),
                        })}
                    </Text>
                )}

                <Text style={[styles.textHeadlineH1, styles.mb3]}>{translate('trialPaymentReminder.title')}</Text>
                <Text style={[styles.textSupporting]}>{translate('trialPaymentReminder.subtitle')}</Text>

                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    style={[styles.mt5]}
                    onPress={onAddPaymentCard}
                >
                    <Button.KeyboardShortcut />
                    <Button.Text>{translate('trialPaymentReminder.addPaymentCardButton')}</Button.Text>
                </Button>
                <Button
                    size={CONST.BUTTON_SIZE.LARGE}
                    style={[styles.mt3]}
                    onPress={onClose}
                >
                    <Button.Text>{translate('trialPaymentReminder.closeButton')}</Button.Text>
                </Button>
            </View>
        </Modal>
    );
}

export default TrialPaymentReminderModal;
