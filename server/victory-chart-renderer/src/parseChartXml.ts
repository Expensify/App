import {TRenderEngine} from '@native-html/render';
import type {TNode} from '@native-html/render';
import VICTORY_HTML_ELEMENT_MODELS from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/victoryHtmlElementModels';

const renderEngine = new TRenderEngine({
    customizeHTMLModels: (defaultModels) => ({
        ...defaultModels,
        ...VICTORY_HTML_ELEMENT_MODELS,
    }),
    htmlParserOptions: {
        decodeEntities: true,
        // Chart XML uses self-closing custom tags (<victorybar ... />). Without this,
        // htmlparser2 treats them as unclosed opens and nests every sibling.
        recognizeSelfClosing: true,
    },
});

function findVictoryChartRoot(tnode: TNode): TNode | null {
    if (tnode.tagName === 'victorychart') {
        return tnode;
    }

    for (const child of tnode.children) {
        const match = findVictoryChartRoot(child);
        if (match) {
            return match;
        }
    }

    return null;
}

function parseChartXml(xmlString: string): TNode {
    const document = renderEngine.buildTTree(xmlString);
    const victoryChart = findVictoryChartRoot(document);

    if (!victoryChart) {
        throw new Error('Chart XML must contain a <victorychart> root element');
    }

    return victoryChart;
}

export default parseChartXml;
