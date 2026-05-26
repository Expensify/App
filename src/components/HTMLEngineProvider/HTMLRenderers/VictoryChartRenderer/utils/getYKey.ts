import type {TNode} from 'react-native-render-html';
import {Y_KEY_PREFIX} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import type {YKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import getHierarchyID from './getHierarchyID';

/**
 * Get the Y-axis key for a given node.
 */
function getYKey(tnode: TNode): YKey {
    return `${Y_KEY_PREFIX}${getHierarchyID(tnode)}`;
}

export default getYKey;
