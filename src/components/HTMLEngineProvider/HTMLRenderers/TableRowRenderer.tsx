import useThemeStyles from '@hooks/useThemeStyles';

import type {CustomRendererProps, TBlock, TNode} from 'react-native-render-html';

import {View} from 'react-native';

import TableChildrenRenderer, {getElementChildren} from './TableChildrenRenderer';

function isLastRowOfTable(tnode: TNode): boolean {
    const section = tnode.parent;
    const table = section?.parent;
    if (!section || !table) {
        return false;
    }
    const sectionRows = getElementChildren(section);
    const tableSections = getElementChildren(table);
    return sectionRows.at(-1) === tnode && tableSections.at(-1) === section;
}

function TableRowRenderer({tnode}: CustomRendererProps<TBlock>) {
    const styles = useThemeStyles();

    // Header rows (inside <thead>) use header padding; body rows use the compact min-height.
    const isHeaderRow = tnode.parent?.tagName === 'thead';

    return (
        <View style={[isHeaderRow ? styles.htmlTableHeaderRow : styles.htmlTableRow, isLastRowOfTable(tnode) && styles.htmlTableLastRow]}>
            <TableChildrenRenderer tnode={tnode} />
        </View>
    );
}

export default TableRowRenderer;
