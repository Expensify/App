import React from 'react';
import {Image} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeIllustrations from '@hooks/useThemeIllustrations';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

function ExampleCheckImage() {
    const styles = useThemeStyles();
    const illustrations = useThemeIllustrations();
    const {preferredLocale} = useLocalize();
    const isSpanish = (preferredLocale ?? CONST.LOCALES.DEFAULT) === CONST.LOCALES.ES;

    return (
        <Image
            resizeMode="contain"
            style={[styles.exampleCheckImage, styles.mb5]}
            source={isSpanish ? illustrations.ExampleCheckES : illustrations.ExampleCheckEN}
        />
    );
}

export default ExampleCheckImage;
