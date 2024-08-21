import React, {useCallback} from 'react';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import useLocalize from '@hooks/useLocalize';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';

const VIDEO_ASPECT_RATIO = 1560 / 1280;

function TrackTrainingPage() {
    const {translate} = useLocalize();

    const onHelp = useCallback(() => {
        Link.openExternalLink(CONST.FEATURE_TRAINING[CONST.FEATURE_TRAINING.CONTENT_TYPES.TRACK_EXPENSE]?.LEARN_MORE_LINK);
    }, []);

    return (
        <FeatureTrainingModal
            shouldShowDismissModalOption
            confirmText={translate('common.buttonConfirm')}
            helpText={translate('common.learnMore')}
            onHelp={onHelp}
            videoURL={CONST.FEATURE_TRAINING[CONST.FEATURE_TRAINING.CONTENT_TYPES.TRACK_EXPENSE]?.VIDEO_URL}
            videoAspectRatio={VIDEO_ASPECT_RATIO}
        />
    );
}

TrackTrainingPage.displayName = 'TrackTrainingPage';

export default TrackTrainingPage;
