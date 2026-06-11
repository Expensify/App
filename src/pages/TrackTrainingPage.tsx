import React from 'react';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import useLocalize from '@hooks/useLocalize';
import {openExternalLink} from '@userActions/Link';
import {setNameValuePair} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const VIDEO_ASPECT_RATIO = 1560 / 1280;

function TrackTrainingPage() {
    const {translate} = useLocalize();

    const onHelp = () => {
        openExternalLink(CONST.FEATURE_TRAINING[CONST.FEATURE_TRAINING.CONTENT_TYPES.TRACK_EXPENSE]?.LEARN_MORE_LINK);
    };

    const onPersistDismiss = () => {
        setNameValuePair(ONYXKEYS.NVP_HAS_SEEN_TRACK_TRAINING, true, false);
    };

    return (
        <FeatureTrainingModal
            shouldShowDismissModalOption
            confirmText={translate('common.buttonConfirm')}
            helpText={translate('common.learnMore')}
            onHelp={onHelp}
            onPersistDismiss={onPersistDismiss}
            videoURL={CONST.FEATURE_TRAINING[CONST.FEATURE_TRAINING.CONTENT_TYPES.TRACK_EXPENSE]?.VIDEO_URL}
            illustrationAspectRatio={VIDEO_ASPECT_RATIO}
        />
    );
}

export default TrackTrainingPage;
