import ScrollView from '@components/ScrollView';

import useThemeStyles from '@hooks/useThemeStyles';

import {View} from 'react-native';

import type HTMLTableScrollProps from './types';

/**
 * Web/default horizontal scroller for HTML tables. A plain ScrollView scrolls fine here because web is not affected by
 * the native responder issue that requires the custom pan gesture in the native variant. The rows are wrapped in a
 * column View because a horizontal ScrollView's content container lays its children out in a row by default.
 */
function HTMLTableScroll({viewportWidth, contentWidth, children}: HTMLTableScrollProps) {
    const styles = useThemeStyles();

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{width: viewportWidth}}
        >
            <View style={[styles.htmlTable, {width: contentWidth}]}>{children}</View>
        </ScrollView>
    );
}

export default HTMLTableScroll;
