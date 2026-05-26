import React from 'react';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {useComposerEditState, useComposerSendState} from './ComposerContext';
import SubmitDraftButton from './SubmitDraftButton';
import useComposerSubmit from './useComposerSubmit';

function ComposerSendButton({reportID}: {reportID: string}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Send', 'Checkmark']);

    const {isEditingInComposer} = useComposerEditState();
    const {isSendDisabled} = useComposerSendState();
    const {submitDraftAndClearComposer} = useComposerSubmit(reportID);

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to manage GestureDetector correctly
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const Tap = Gesture.Tap()
        .enabled(!isSendDisabled)
        .onEnd(() => {
            submitDraftAndClearComposer();
        })
        .runOnJS(true);

    const label = translate(isEditingInComposer ? 'common.saveChanges' : 'common.send');
    const icon = isEditingInComposer ? icons.Checkmark : icons.Send;

    return (
        <View
            style={styles.justifyContentEnd}
            // Keep focus on the composer when Send message is clicked.
            onMouseDown={(e) => e.preventDefault()}
        >
            <GestureDetector
                // A new GestureDetector instance must be created when switching from a large screen to a small screen
                // if not, the GestureDetector may not function correctly.
                key={`send-button-${isSmallScreenWidth ? 'small-screen' : 'normal-screen'}`}
                gesture={Tap}
            >
                <View
                    // In order to make buttons accessible, we have to wrap children in a View with accessible and accessibilityRole="button" props based on the docs: https://docs.swmansion.com/react-native-gesture-handler/docs/components/buttons/
                    accessible
                    role={CONST.ROLE.BUTTON}
                    accessibilityLabel={label}
                    collapsable={false}
                >
                    <SubmitDraftButton
                        isDisabled={isSendDisabled}
                        icon={icon}
                        label={label}
                        sentryLabel={CONST.SENTRY_LABEL.REPORT.SEND_BUTTON}
                        // Since the parent View has accessible, we need to set accessible to false here to avoid duplicate accessibility elements.
                        // On Android when TalkBack is enabled, only the parent element should be accessible, otherwise the button will not work.
                        accessible={false}
                        focusable={false}
                    />
                </View>
            </GestureDetector>
        </View>
    );
}

export default ComposerSendButton;
