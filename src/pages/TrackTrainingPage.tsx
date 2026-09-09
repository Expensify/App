import CenteredModalLayout from '@components/CenteredModalLayout';
import FeatureTraining from '@components/FeatureTraining';

import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';

import {openExternalLink} from '@userActions/Link';
import {setNameValuePair} from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useRef} from 'react';

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

    return (
        <CenteredModalLayout onBackdropPress={handleClose}>
            <FeatureTraining
                onConfirm={handleClose}
                onClose={handleClose}
                onWillShowAgainChange={(willShowAgain) => {
                    willShowAgainRef.current = willShowAgain;
                }}
            >
                <FeatureTraining.Illustration
                    videoURL={CONST.FEATURE_TRAINING[CONST.FEATURE_TRAINING.CONTENT_TYPES.TRACK_EXPENSE]?.VIDEO_URL}
                    aspectRatio={VIDEO_ASPECT_RATIO}
                />
                <FeatureTraining.Body>
                    <FeatureTraining.DismissOption />
                    <FeatureTraining.HelpButton onPress={onHelp}>{translate('common.learnMore')}</FeatureTraining.HelpButton>
                    <FeatureTraining.ConfirmButton>{translate('common.buttonConfirm')}</FeatureTraining.ConfirmButton>
                </FeatureTraining.Body>
            </FeatureTraining>
        </CenteredModalLayout>
    );
}

export default TrackTrainingPage;
