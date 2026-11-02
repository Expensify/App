// Static twin of SearchPageInput for narrow layout - used for fast perceived performance.
// Keep hooks and Onyx subscriptions to an absolute minimum; add new ones only
// when strictly necessary. UI must stay visually identical to the interactive version.
import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

function StaticSearchPageInput() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    return (
        <View
            style={[
                styles.flex1,
                styles.searchRouterTextInputContainer,
                styles.searchAutocompleteInputResults,
                styles.br2,
                styles.justifyContentCenter,
                styles.searchPageInputNarrowTouchableWrapper,
            ]}
        >
            <Text
                style={[{color: theme.textSupporting}]}
                numberOfLines={1}
            >
                {translate('search.searchPlaceholder')}
            </Text>
        </View>
    );
}

export default StaticSearchPageInput;
