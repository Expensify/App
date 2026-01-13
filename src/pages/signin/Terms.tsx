import React from 'react';
import {View} from 'react-native';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

function Terms() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.renderHTML, styles.mb4]}>
            <RenderHTML html={translate('termsOfUse.terms')} />
        </View>
    );
}

export default Terms;
