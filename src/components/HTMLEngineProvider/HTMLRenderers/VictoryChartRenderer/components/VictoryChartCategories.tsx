import React from 'react';
import type {TNode} from 'react-native-render-html';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';
import VictoryChartPie from './VictoryChartPie';

type VictoryChartCategoriesProps = {
    tnode: TNode;
    timezone: SelectedTimezone;
};

type CategoriesComponent = (props: VictoryChartCategoriesProps) => React.ReactElement | null;

/**
 * Dispatches a chart child node to its categories renderer based on the HTML tag name.
 * To support a new categories type, add its tag name here and create the renderer component.
 */
const CATEGORIES_RENDERERS: Partial<Record<string, CategoriesComponent>> = {
    victorypie: VictoryChartPie,
};

function VictoryChartCategories({tnode, timezone}: VictoryChartCategoriesProps) {
    const CategoriesRenderer = CATEGORIES_RENDERERS[tnode.tagName ?? ''];

    if (!CategoriesRenderer) {
        return null;
    }

    return (
        <CategoriesRenderer
            tnode={tnode}
            timezone={timezone}
        />
    );
}

export default VictoryChartCategories;
