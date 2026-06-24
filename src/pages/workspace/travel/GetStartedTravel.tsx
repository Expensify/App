import React from 'react';
import BookTravelButton from '@components/BookTravelButton';
import Button from '@components/Button';
import FeatureList from '@components/FeatureList';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';

type GetStartedTravelProps = {
    policyID: string;
    canWriteTravelFeature: boolean;
    showReadOnlyModal: () => void;
};

function GetStartedTravel({policyID, canWriteTravelFeature, showReadOnlyModal}: GetStartedTravelProps) {
    const handleCtaPress = () => {};

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['PendingTravel']);

    return (
        <FeatureList
            menuItems={[]}
            title={translate('workspace.moreFeatures.travel.getStarted.title')}
            subtitle={translate('workspace.moreFeatures.travel.getStarted.subtitle')}
            onCtaPress={handleCtaPress}
            illustrationBackgroundColor={colors.tangerine700}
            illustration={illustrations.PendingTravel}
            illustrationStyle={styles.travelCardIllustration}
            illustrationContainerStyle={[styles.emptyStateCardIllustrationContainer, styles.justifyContentCenter, styles.cardSectionIllustrationContainer]}
            titleStyles={styles.textHeadlineH1}
            footer={
                canWriteTravelFeature ? (
                    <BookTravelButton
                        text={translate('workspace.moreFeatures.travel.getStarted.ctaText')}
                        activePolicyID={policyID}
                        shouldShowVerifyAccountModal={false}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.TRAVEL.GET_STARTED_BUTTON}
                        large
                    />
                ) : (
                    <Button
                        text={translate('workspace.moreFeatures.travel.getStarted.ctaText')}
                        onPress={showReadOnlyModal}
                        accessibilityLabel={translate('travel.bookTravel')}
                        style={styles.w100}
                        innerStyles={styles.buttonOpacityDisabled}
                        hoverStyles={styles.buttonOpacityDisabled}
                        success
                        large
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.TRAVEL.GET_STARTED_BUTTON}
                    />
                )
            }
            containerStyles={{marginHorizontal: 0}}
        />
    );
}

export default GetStartedTravel;
