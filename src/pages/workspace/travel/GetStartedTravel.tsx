import BookTravelButton from '@components/BookTravelButton';
import EmptyStateComponent from '@components/EmptyStateComponent';
import type {EmptyStateButton} from '@components/EmptyStateComponent/types';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type GetStartedTravelProps = {
    policyID: string;
    canWriteTravelFeature: boolean;
    showReadOnlyModal: () => void;
};

function GetStartedTravel({policyID, canWriteTravelFeature, showReadOnlyModal}: GetStartedTravelProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['PendingTravel']);

    const readOnlyButtons: EmptyStateButton[] = [
        {
            buttonText: translate('workspace.moreFeatures.travel.getStarted.ctaText'),
            buttonAction: showReadOnlyModal,
            success: true,
            innerStyles: styles.buttonOpacityDisabled,
            hoverStyles: styles.buttonOpacityDisabled,
        },
    ];

    return (
        <EmptyStateComponent
            headerMedia={illustrations.PendingTravel}
            headerContentStyles={styles.travelCardIllustration}
            title={translate('workspace.moreFeatures.travel.getStarted.title')}
            subtitle={translate('workspace.moreFeatures.travel.getStarted.subtitle')}
            buttons={canWriteTravelFeature ? undefined : readOnlyButtons}
        >
            {canWriteTravelFeature && (
                <View style={[styles.gap2, styles.mt6, styles.flexRow, styles.flexWrap, styles.justifyContentCenter]}>
                    <BookTravelButton
                        text={translate('workspace.moreFeatures.travel.getStarted.ctaText')}
                        activePolicyID={policyID}
                        shouldShowVerifyAccountModal={false}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.TRAVEL.GET_STARTED_BUTTON}
                    />
                </View>
            )}
        </EmptyStateComponent>
    );
}

export default GetStartedTravel;
