import React, {useCallback} from 'react';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import useLocalize from '@hooks/useLocalize';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import * as ReportUtils from '@libs/ReportUtils';
import * as IOU from '@userActions/IOU';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';

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
            videoURL={CONST.WELCOME_VIDEO_URL}
        />
    );
}

TrackTrainingPage.displayName = 'TrackTrainingPage';

export default TrackTrainingPage;
