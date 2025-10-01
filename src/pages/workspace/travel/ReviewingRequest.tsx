import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FeatureList from '@components/FeatureList';
import {PendingTravel} from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';

function ReviewingRequest() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    return (
        <View>
            <FeatureList
                menuItems={[]}
                title={translate('workspace.moreFeatures.travel.reviewingRequest.title')}
                subtitle={translate('workspace.moreFeatures.travel.reviewingRequest.subtitle')}
                footer={
                    <Button
                        text={translate('workspace.moreFeatures.travel.reviewingRequest.ctaText')}
                        style={[styles.w100]}
                        isDisabled
                        large
                    />
                }
                illustrationBackgroundColor={colors.tangerine700}
                illustration={PendingTravel}
                illustrationStyle={styles.emptyStateCardIllustration}
                illustrationContainerStyle={[styles.emptyStateCardIllustrationContainer, styles.justifyContentStart]}
                titleStyles={styles.textHeadlineH1}
            />
        </View>
    );
}

ReviewingRequest.displayName = 'ReviewingRequest';
export default ReviewingRequest;
