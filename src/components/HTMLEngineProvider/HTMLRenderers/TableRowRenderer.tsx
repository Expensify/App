import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {showContextMenuForReport, useShowContextMenuActions, useShowContextMenuState} from '@components/ShowContextMenuContext';

import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {openLink} from '@libs/actions/Link';

import CONST from '@src/CONST';

import type {CustomRendererProps, TBlock, TNode} from 'react-native-render-html';

import {useContext} from 'react';
import {View} from 'react-native';

import TableChildrenRenderer, {getElementChildren} from './TableChildrenRenderer';
import TableLinkColumnContext from './TableLinkColumnContext';
import {getRowLinkURL} from './TableRowLink';

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
    const theme = useTheme();
    const {translate} = useLocalize();
    const {environmentURL} = useEnvironment();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const {anchor, report, action, originalReportID} = useShowContextMenuState();
    const {onShowContextMenu, checkIfContextMenuActive} = useShowContextMenuActions();

    // Header rows (inside <thead>) use header padding; body rows use the compact min-height.
    const isHeaderRow = tnode.parent?.tagName === 'thead';
    const linkColumnIndex = useContext(TableLinkColumnContext);
    const rowLinkURL = getRowLinkURL(tnode, linkColumnIndex);

    const rowStyle = [isHeaderRow ? styles.htmlTableHeaderRow : styles.htmlTableRow, isLastRowOfTable(tnode) && styles.htmlTableLastRow];

    // Every row of a table with a link column reserves the chevron width so the columns stay aligned, but only a row
    // that actually navigates shows the chevron.
    const chevron =
        linkColumnIndex === undefined ? null : (
            <View style={styles.htmlTableChevronCell}>
                {!!rowLinkURL && (
                    <Icon
                        src={icons.ArrowRight}
                        fill={theme.icon}
                        size={CONST.ICON_SIZE.SMALL}
                    />
                )}
            </View>
        );

    if (!rowLinkURL) {
        return (
            <View style={rowStyle}>
                <TableChildrenRenderer tnode={tnode} />
                {chevron}
            </View>
        );
    }

    return (
        <PressableWithoutFeedback
            style={rowStyle}
            hoverStyle={styles.htmlTableRowHovered}
            onPress={() => openLink(rowLinkURL, environmentURL)}
            onLongPress={(event) => onShowContextMenu(() => showContextMenuForReport(event, anchor, report?.reportID, action, checkIfContextMenuActive, originalReportID))}
            role={CONST.ROLE.BUTTON}
            accessibilityLabel={translate('iou.viewDetails')}
            sentryLabel={CONST.SENTRY_LABEL.HTML_RENDERER.TABLE_ROW}
            shouldUseHapticsOnLongPress
            isNested
        >
            <TableChildrenRenderer tnode={tnode} />
            {chevron}
        </PressableWithoutFeedback>
    );
}

export default TableRowRenderer;
