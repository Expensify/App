import useThemeStyles from '@hooks/useThemeStyles';

import type {CustomRendererProps, TBlock} from 'react-native-render-html';

import {ScrollView, View} from 'react-native';

import TableChildrenRenderer from './TableChildrenRenderer';

function TableRenderer({tnode}: CustomRendererProps<TBlock>) {
    const styles = useThemeStyles();

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.w100}
            contentContainerStyle={styles.htmlTableScrollContainerContent}
        >
            <View style={styles.htmlTable}>
                <TableChildrenRenderer tnode={tnode} />
            </View>
        </ScrollView>
    );
}

export default TableRenderer;
