import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import isInLandscapeModeUtil from '@libs/isInLandscapeMode';
import Log from '@libs/Log';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';
import type {ViewStyle} from 'react-native';

import React, {useEffect, useRef, useState} from 'react';

import FeatureTraining from './FeatureTraining';
import Modal from './Modal';

const MODAL_PADDING = variables.spacing2;

type FeatureTrainingModalProps = {
    /** Called when the user confirms the tutorial */
    onConfirm?: (willShowAgain: boolean) => void;

    /** Called when the modal closes */
    onClose?: () => void;

    /** Whether the modal should close after confirm */
    shouldCloseOnConfirm?: boolean;

    /** Whether the modal content should render inside a ScrollView */
    shouldUseScrollView?: boolean;

    /** Modal content width */
    width?: number;

    /** Style for the modal inner container */
    modalInnerContainerStyle?: ViewStyle;

    /** Composed feature training content */
    children?: ReactNode;
};

function FeatureTrainingModal({
    modalInnerContainerStyle,
    onConfirm,
    onClose,
    shouldCloseOnConfirm = true,
    shouldUseScrollView: shouldUseScrollViewProp = false,
    width,
    children,
}: FeatureTrainingModalProps) {
    const styles = useThemeStyles();
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const {windowWidth, windowHeight} = useWindowDimensions();
    const shouldUseScrollView = shouldUseScrollViewProp || isInLandscapeModeUtil(windowWidth, windowHeight);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const pendingCloseRef = useRef(false);

    useEffect(() => {
        const handle = TransitionTracker.runAfterTransitions({
            callback: () => {
                setIsModalVisible(true);
            },
        });
        return () => handle.cancel();
    }, []);

    const pendingCloseModalAction = () => {
        Log.hmmm(`[FeatureTrainingModal] Modal hidden - hasOnClose: ${!!onClose}`);
        if (onClose) {
            Log.hmmm('[FeatureTrainingModal] Calling onClose callback');
            onClose();
        } else {
            Log.hmmm('[FeatureTrainingModal] No onClose callback provided');
        }
    };

    const closeModal = () => {
        Log.hmmm(`[FeatureTrainingModal] closeModal called - hasOnClose: ${!!onClose}`);
        Log.hmmm('[FeatureTrainingModal] Setting modal invisible');
        pendingCloseRef.current = true;
        setIsModalVisible(false);
    };

    const handleModalHide = () => {
        if (!pendingCloseRef.current) {
            return;
        }

        pendingCloseRef.current = false;
        pendingCloseModalAction();
    };

    return (
        <Modal
            isVisible={isModalVisible}
            shouldTreatModalAsCovering
            type={onboardingIsMediumOrLargerScreenWidth ? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE : CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
            onClose={closeModal}
            innerContainerStyle={{
                boxShadow: 'none',
                ...(shouldUseScrollView ? styles.pb0 : styles.pb5),
                paddingTop: onboardingIsMediumOrLargerScreenWidth ? undefined : MODAL_PADDING,
                ...(onboardingIsMediumOrLargerScreenWidth
                    ? {
                          flex: undefined,
                          width: 'auto',
                      }
                    : {}),
                ...modalInnerContainerStyle,
            }}
            onModalHide={handleModalHide}
            shouldDisableBottomSafeAreaPadding={shouldUseScrollView}
            shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode={!shouldUseScrollView}
        >
            <FeatureTraining
                shouldUseScrollView={shouldUseScrollViewProp}
                onConfirm={(willShowAgain) => {
                    onConfirm?.(willShowAgain);
                    if (!shouldCloseOnConfirm) {
                        return;
                    }
                    closeModal();
                }}
                onClose={closeModal}
                width={width}
            >
                {children}
            </FeatureTraining>
        </Modal>
    );
}

export default FeatureTrainingModal;
