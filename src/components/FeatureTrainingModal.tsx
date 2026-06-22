import React, {useEffect, useRef, useState} from 'react';
import type {ViewStyle} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import isInLandscapeModeUtil from '@libs/isInLandscapeMode';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {FeatureTrainingContentProps} from './FeatureTrainingContent';
import FeatureTrainingContent from './FeatureTrainingContent';
import Modal from './Modal';

const MODAL_PADDING = variables.spacing2;

type FeatureTrainingModalProps = FeatureTrainingContentProps & {
    /** Styles for the modal inner container */
    modalInnerContainerStyle?: ViewStyle;

    /** Whether to disable the modal */
    isModalDisabled?: boolean;

    /** Whether the modal should avoid the keyboard */
    avoidKeyboard?: boolean;

    /** Whether to navigate back when closing the modal */
    shouldGoBack?: boolean;

    /** Whether to call onHelp when modal is hidden completely */
    shouldCallOnHelpWhenModalHidden?: boolean;

    /** Called when the modal is dismissed with "don't show again" checked */
    onPersistDismiss?: () => void;
};

function FeatureTrainingModal({
    modalInnerContainerStyle,
    isModalDisabled = true,
    avoidKeyboard = false,
    shouldGoBack = true,
    shouldCallOnHelpWhenModalHidden = false,
    onConfirm,
    onClose,
    onHelp,
    onWillShowAgainChange,
    onPersistDismiss,
    shouldShowDismissModalOption = false,
    shouldUseScrollView: shouldUseScrollViewProp = false,
    width = variables.featureTrainingModalWidth,
    ...contentProps
}: FeatureTrainingModalProps) {
    const styles = useThemeStyles();
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const {windowWidth, windowHeight} = useWindowDimensions();
    const shouldUseScrollView = shouldUseScrollViewProp || isInLandscapeModeUtil(windowWidth, windowHeight);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const pendingCloseRef = useRef(false);
    const hasHelpButtonBeenPressed = useRef(false);
    const willShowAgainRef = useRef(true);

    const handleWillShowAgainChange = (value: boolean) => {
        willShowAgainRef.current = value;
        onWillShowAgainChange?.(value);
    };

    useEffect(() => {
        const handle = TransitionTracker.runAfterTransitions({
            callback: () => {
                if (!isModalDisabled) {
                    setIsModalVisible(false);
                    return;
                }
                setIsModalVisible(true);
            },
        });
        return () => handle.cancel();
    }, [isModalDisabled]);

    const pendingCloseModalAction = () => {
        Log.hmmm(`[FeatureTrainingModal] Modal hidden - shouldGoBack: ${shouldGoBack}, hasOnClose: ${!!onClose}`);
        if (shouldGoBack) {
            Log.hmmm('[FeatureTrainingModal] Navigating back');
            Navigation.goBack();
        }
        if (onClose) {
            Log.hmmm('[FeatureTrainingModal] Calling onClose callback');
            onClose();
        } else {
            Log.hmmm('[FeatureTrainingModal] No onClose callback provided');
        }
    };

    const closeModal = () => {
        Log.hmmm(`[FeatureTrainingModal] closeModal called - shouldGoBack: ${shouldGoBack}, hasOnClose: ${!!onClose}`);
        Log.hmmm('[FeatureTrainingModal] Setting modal invisible');
        if (shouldShowDismissModalOption && !willShowAgainRef.current) {
            onPersistDismiss?.();
        }
        pendingCloseRef.current = true;
        setIsModalVisible(false);
    };

    const handleContentHelp = () => {
        if (shouldCallOnHelpWhenModalHidden) {
            setIsModalVisible(false);
            hasHelpButtonBeenPressed.current = true;
            return;
        }
        onHelp?.();
    };

    return (
        <Modal
            avoidKeyboard={avoidKeyboard}
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
            onModalHide={() => {
                if (pendingCloseRef.current) {
                    pendingCloseRef.current = false;
                    pendingCloseModalAction();
                }
                if (!shouldCallOnHelpWhenModalHidden || !hasHelpButtonBeenPressed.current) {
                    return;
                }
                onHelp?.();
            }}
            shouldDisableBottomSafeAreaPadding={shouldUseScrollView}
            shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode={!shouldUseScrollView}
        >
            <FeatureTrainingContent
                {...contentProps}
                width={width}
                shouldShowDismissModalOption={shouldShowDismissModalOption}
                shouldUseScrollView={shouldUseScrollViewProp}
                onConfirm={onConfirm}
                onClose={closeModal}
                onHelp={handleContentHelp}
                onWillShowAgainChange={handleWillShowAgainChange}
            />
        </Modal>
    );
}

export default FeatureTrainingModal;

export type {FeatureTrainingModalProps};
