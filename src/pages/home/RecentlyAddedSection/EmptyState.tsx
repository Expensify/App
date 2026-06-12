import React from 'react';
import {View} from 'react-native';
import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

const ILLUSTRATION_SIZE = 68;

function EmptyState() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['MoneyReceipts']);

    return (
        <View
            testID="recentlyAddedEmptyState"
            style={styles.forYouEmptyStateContainer}
        >
            <ImageSVG
                src={illustrations.MoneyReceipts}
                width={ILLUSTRATION_SIZE}
                height={ILLUSTRATION_SIZE}
            />
            <View style={styles.forYouEmptyStateTextContainer}>
                <Text style={styles.forYouEmptyStateDescription}>{translate('homePage.recentlyAddedSection.emptyStateMessage')}</Text>
            </View>
        </View>
    );
}

export default EmptyState;
