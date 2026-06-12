import React, {useRef} from 'react';
import CenteredModalLayout from '@components/CenteredModalLayout';
import FeatureTrainingContent from '@components/FeatureTrainingContent';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import {openExternalLink} from '@userActions/Link';
import {setNameValuePair} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const VIDEO_ASPECT_RATIO = 1560 / 1280;

function TrackTrainingPage() {
    const {translate} = useLocalize();

    const willShowAgainRef = useRef(true);

    const persistDismiss = () => {
        if (willShowAgainRef.current) {
            return;
        }
        setNameValuePair(ONYXKEYS.NVP_HAS_SEEN_TRACK_TRAINING, true, false);
    };

    useBeforeRemove(persistDismiss);

    const handleClose = () => Navigation.goBack();

    const onHelp = () => {
        openExternalLink(CONST.FEATURE_TRAINING[CONST.FEATURE_TRAINING.CONTENT_TYPES.TRACK_EXPENSE]?.LEARN_MORE_LINK);
    };

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, handleClose, {shouldBubble: false});

    return (
        <CenteredModalLayout onBackdropPress={handleClose}>
            <FeatureTrainingContent
                shouldShowDismissModalOption
                confirmText={translate('common.buttonConfirm')}
                helpText={translate('common.learnMore')}
                onHelp={onHelp}
                onClose={handleClose}
                onWillShowAgainChange={(willShowAgain) => {
                    willShowAgainRef.current = willShowAgain;
                }}
                videoURL={CONST.FEATURE_TRAINING[CONST.FEATURE_TRAINING.CONTENT_TYPES.TRACK_EXPENSE]?.VIDEO_URL}
                illustrationAspectRatio={VIDEO_ASPECT_RATIO}
            />
        </CenteredModalLayout>
    );
}

export default TrackTrainingPage;
