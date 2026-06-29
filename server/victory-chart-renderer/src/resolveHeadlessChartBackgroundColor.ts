import type {TNode} from 'react-native-render-html';
import parseStyles from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseStyles';
import {resolveChartContainerBgColor} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveChartThemeColor';
import themes from '@styles/theme';

function resolveHeadlessChartBackgroundColor(tnode: TNode): string {
    const {parentNodeStyles} = parseStyles(tnode);
    const resolvedBackgroundColor = resolveChartContainerBgColor(parentNodeStyles.backgroundColor, themes.light);

    if (typeof resolvedBackgroundColor === 'string') {
        return resolvedBackgroundColor;
    }

    return themes.light.cardBG;
}

export default resolveHeadlessChartBackgroundColor;
