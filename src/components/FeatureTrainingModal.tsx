import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import isInLandscapeModeUtil from '@libs/isInLandscapeMode';
import Log from '@libs/Log';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {ViewStyle} from 'react-native';

import React, {useEffect, useRef, useState} from 'react';

import type {FeatureTrainingContentProps} from './FeatureTrainingContent';

import FeatureTrainingContent from './FeatureTrainingContent';
import Modal from './Modal';

const MODAL_PADDING = variables.spacing2;

type FeatureTrainingModalProps = FeatureTrainingContentProps & {
    /** Styles for the modal inner container */
    modalInnerContainerStyle?: ViewStyle;
};

function FeatureTrainingModal({modalInnerContainerStyle, onConfirm, onClose, shouldUseScrollView: shouldUseScrollViewProp = false, ...contentProps}: FeatureTrainingModalProps) {
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
            <FeatureTrainingContent
                {...contentProps}
                shouldUseScrollView={shouldUseScrollViewProp}
                onConfirm={onConfirm}
                onClose={closeModal}
            />
        </Modal>
    );
}

export default FeatureTrainingModal;
