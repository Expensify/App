import React from 'react';
import {View} from 'react-native';
import ImageSVG from '@components/ImageSVG';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import type IconAsset from '@src/types/utils/IconAsset';

const ILLUSTRATION_SIZE = 68;

type HomeSectionEmptyStateProps = {
    /** Illustration rendered above the text. */
    illustration: IconAsset | undefined;

    /** Title shown below the illustration. */
    title: string;

    /** Supporting description shown below the title. */
    description: string;

    /** Optional test identifier for the container. */
    testID?: string;
};

function HomeSectionEmptyState({illustration, title, description, testID}: HomeSectionEmptyStateProps) {
    const styles = useThemeStyles();

    return (
        <View
            testID={testID}
            style={styles.forYouEmptyStateContainer}
        >
            <ImageSVG
                src={illustration}
                width={ILLUSTRATION_SIZE}
                height={ILLUSTRATION_SIZE}
            />
            <View style={styles.forYouEmptyStateTextContainer}>
                <Text style={styles.forYouEmptyStateTitle}>{title}</Text>
                <Text style={styles.forYouEmptyStateDescription}>{description}</Text>
            </View>
        </View>
    );
}

export default HomeSectionEmptyState;
