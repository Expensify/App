import React, {useCallback} from 'react';
import {View} from 'react-native';
import FeatureTrainingModal from '@components/FeatureTrainingModal';
import Lottie from '@components/Lottie';
import LottieAnimations from '@components/LottieAnimations';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import * as ReportUtils from '@libs/ReportUtils';
import * as IOU from '@userActions/IOU';
import * as Link from '@userActions/Link';
import CONST from '@src/CONST';

function TrackTrainingPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();

    const renderIllustration = useCallback(
        () => (
            <View style={[styles.flex1, styles.alignItemsCenter]}>
                <Lottie
                    source={LottieAnimations.Hands}
                    style={styles.h100}
                    webStyle={isSmallScreenWidth ? styles.h100 : undefined}
                    autoPlay
                    loop
                />
            </View>
        ),
        [isSmallScreenWidth, styles.alignItemsCenter, styles.flex1, styles.h100],
    );

    const onHelp = useCallback(() => {
        Link.openExternalLink(CONST.FEATURE_TRAINING[CONST.FEATURE_TRAINING.CONTENT_TYPES.TRACK_EXPENSE]?.LEARN_MORE_LINK);
    }, []);

    const onConfirm = useCallback(() => {
        interceptAnonymousUser(() =>
            IOU.startMoneyRequest(
                CONST.IOU.TYPE.TRACK_EXPENSE,
                // When starting to create a track expense from the global FAB, we need to retrieve selfDM reportID.
                // If it doesn't exist, we generate a random optimistic reportID and use it for all of the routes in the creation flow.
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                ReportUtils.findSelfDMReportID() || ReportUtils.generateReportID(),
            ),
        );
    }, []);

    return (
        <FeatureTrainingModal
            shouldShowDismissModalOption
            confirmText={translate('common.buttonConfirm')}
            onConfirm={onConfirm}
            helpText={translate('common.learnMore')}
            onHelp={onHelp}
            renderIllustration={renderIllustration}
        />
    );
}

TrackTrainingPage.displayName = 'TrackTrainingPage';

export default TrackTrainingPage;
