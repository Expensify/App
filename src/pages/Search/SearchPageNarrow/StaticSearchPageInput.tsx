// Static twin of SearchPageInputNarrow - used for fast perceived performance.
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
            dataSet={{dragArea: false}}
            style={[styles.flex1, styles.appBG]}
        >
            <View style={[styles.flexRow, styles.ml5, styles.mb4, styles.mr3]}>
                <View style={[styles.flex1, styles.zIndex10]}>
                    <View style={[styles.searchRouterTextInputContainer, styles.searchAutocompleteInputResults, styles.br2, styles.justifyContentCenter, styles.searchInputSkeleton]}>
                        <Text
                            style={[{color: theme.textSupporting}]}
                            numberOfLines={1}
                        >
                            {translate('search.searchPlaceholder')}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

export default StaticSearchPageInput;
