import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

const ILLUSTRATION_NAMES = ['ConciergeBot'] as const;
const ILLUSTRATION_SIZE = 68;

function AskConciergeEmptyState() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(ILLUSTRATION_NAMES);

    return (
        <View
            testID="AskConciergeEmptyState"
            style={[styles.alignItemsCenter, styles.gap3, styles.ph5]}
        >
            <ImageSVG
                src={illustrations.ConciergeBot}
                width={ILLUSTRATION_SIZE}
                height={ILLUSTRATION_SIZE}
            />
            <Text
                variant="h1"
                textAlign="center"
            >
                {translate('reportActionsView.askMeAnything')}
            </Text>
            <Text
                textAlign="center"
                style={[styles.textSupporting, styles.ph5]}
            >
                {translate('common.concierge.welcomeDescription')}
            </Text>
        </View>
    );
}

export default AskConciergeEmptyState;
