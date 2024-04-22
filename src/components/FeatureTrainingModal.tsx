import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import useLocalize from '@hooks/useLocalize';
import useOnboardingLayout from '@hooks/useOnboardingLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import Button from './Button';
import CheckboxWithLabel from './CheckboxWithLabel';
import Modal from './Modal';
import SafeAreaConsumer from './SafeAreaConsumer';
import Text from './Text';

const MODAL_PADDING = variables.spacing2;

type FeatureTrainingModalProps = {
    title?: string;

    description?: string;

    shouldShowDismissModalOption?: boolean;

    /** Animation for the tutorial */
    renderIllustration: () => React.ReactElement | null;

    confirmText: string;

    /** A callback to call when user confirms the tutorial */
    onConfirm?: () => void;

    helpText?: string;

    /** Link to navigate to when user wants to learn more */
    onHelp?: () => void;
};

function FeatureTrainingModal({
    title = '',
    description = '',
    shouldShowDismissModalOption = false,
    renderIllustration,
    confirmText = '',
    onConfirm = () => {},
    helpText = '',
    onHelp = () => {},
}: FeatureTrainingModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useOnboardingLayout();
    const [isModalVisible, setIsModalVisible] = useState(true);
    const [willShowAgain, setWillShowAgain] = useState(true);

    const toggleWillShowAgain = useCallback((checked?: boolean) => setWillShowAgain(!checked), []);

    const closeAndConfirmModal = useCallback(() => {
        User.dismissTrackTrainingModal();
        setIsModalVisible(false);
        Navigation.goBack();
        onConfirm?.();
    }, [onConfirm]);

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <Modal
                    isVisible={isModalVisible}
                    type={shouldUseNarrowLayout ? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE : CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
                    onClose={closeAndConfirmModal}
                    innerContainerStyle={{
                        boxShadow: 'none',
                        borderRadius: 16,
                        paddingBottom: 20,
                        paddingTop: shouldUseNarrowLayout ? undefined : MODAL_PADDING,
                        ...(shouldUseNarrowLayout
                            ? // Override styles defined by MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE
                              // To make it take as little space as possible.
                              {
                                  flex: undefined,
                                  width: 'auto',
                              }
                            : {}),
                    }}
                >
                    <GestureHandlerRootView>
                        <View style={[styles.mh100, shouldUseNarrowLayout && styles.welcomeVideoNarrowLayout, safeAreaPaddingBottomStyle]}>
                            <View style={shouldUseNarrowLayout ? {padding: MODAL_PADDING} : {paddingHorizontal: MODAL_PADDING}}>{renderIllustration()}</View>
                            <View style={[shouldUseNarrowLayout ? [styles.mt5, styles.mh8] : [styles.mt5, styles.mh5]]}>
                                {title && description && (
                                    <View style={[shouldUseNarrowLayout ? [styles.gap1, styles.mb8] : [styles.mb10]]}>
                                        <Text style={[styles.textHeadlineH1, styles.textXXLarge]}>{title}</Text>
                                        <Text style={styles.textSupporting}>{description}</Text>
                                    </View>
                                )}
                                {shouldShowDismissModalOption && (
                                    <CheckboxWithLabel
                                        label={translate('featureTraining.doNotShowAgain')}
                                        accessibilityLabel={translate('featureTraining.doNotShowAgain')}
                                        style={[styles.mv4]}
                                        isChecked={!willShowAgain}
                                        onInputChange={toggleWillShowAgain}
                                    />
                                )}
                                {helpText && (
                                    <Button
                                        large
                                        style={[styles.mb1]}
                                        onPress={onHelp}
                                        text={helpText}
                                    />
                                )}
                                <Button
                                    large
                                    success
                                    pressOnEnter
                                    onPress={closeAndConfirmModal}
                                    text={confirmText}
                                />
                            </View>
                        </View>
                    </GestureHandlerRootView>
                </Modal>
            )}
        </SafeAreaConsumer>
    );
}

export default FeatureTrainingModal;
