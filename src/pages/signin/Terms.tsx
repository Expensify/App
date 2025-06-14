import React, {useMemo} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {View} from 'react-native';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

function Terms() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [linkStyles, containerStyles] = useMemo<Array<StyleProp<TextStyle>>>(
        () => [
            [styles.textExtraSmallSupporting, styles.link],
            [styles.textExtraSmallSupporting, styles.mb4],
        ],
        [styles],
    );

    return <RenderHTML html={translate('termsOfUse.terms')} />;
}

Terms.displayName = 'Terms';

export default Terms;
