import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

// Static twin of SearchPageInput for narrow layout - used for fast perceived performance.
// Keep hooks and Onyx subscriptions to an absolute minimum; add new ones only
// when strictly necessary. UI must stay visually identical to the interactive version.
import React from 'react';
import {View} from 'react-native';

function StaticSearchPageInput() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.flex1, styles.border, styles.borderRadiusComponentNormal, styles.appBG, styles.p2, styles.justifyContentCenter, styles.h11]}>
            <Text
                style={[styles.textLabel, styles.textSupporting]}
                numberOfLines={1}
            >
                {translate('search.searchPlaceholder')}
            </Text>
        </View>
    );
}

export default StaticSearchPageInput;
