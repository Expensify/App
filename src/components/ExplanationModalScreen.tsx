import React, {useRef} from 'react';
import {View} from 'react-native';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import isInLandscapeModeUtil from '@libs/isInLandscapeMode';
import Navigation from '@libs/Navigation/Navigation';
import {completeHybridAppOnboarding} from '@userActions/Welcome';
import CONST from '@src/CONST';
import CenteredModalLayout from './CenteredModalLayout';
import FeatureTrainingContent from './FeatureTrainingContent';

function ExplanationModalScreen() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowWidth, windowHeight} = useWindowDimensions();

    // In landscape mode the content is rendered in a ScrollView which handles the bottom safe area padding itself
    const isContentScrollable = isInLandscapeModeUtil(windowWidth, windowHeight);

    const contentStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding: !isContentScrollable,
        style: [shouldUseNarrowLayout && styles.pt2, !isContentScrollable && styles.pb5],
    });

    // Mark hybrid-app onboarding complete however this screen is dismissed.
    const hasCompletedOnboarding = useRef(false);
    useBeforeRemove(() => {
        if (hasCompletedOnboarding.current) {
            return;
        }
        hasCompletedOnboarding.current = true;
        completeHybridAppOnboarding();
    });

    const handleClose = () => Navigation.goBack();

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, handleClose, {shouldBubble: false});

    return (
        <CenteredModalLayout onBackdropPress={handleClose}>
            <View style={contentStyle}>
                <FeatureTrainingContent
                    title={translate('onboarding.explanationModal.title')}
                    description={translate('onboarding.explanationModal.description')}
                    secondaryDescription={translate('onboarding.explanationModal.secondaryDescription')}
                    confirmText={translate('footer.getStarted')}
                    videoURL={CONST.WELCOME_VIDEO_URL}
                    onClose={handleClose}
                />
            </View>
        </CenteredModalLayout>
    );
}

export default ExplanationModalScreen;
