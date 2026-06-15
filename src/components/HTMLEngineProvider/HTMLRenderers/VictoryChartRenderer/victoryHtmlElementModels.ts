import {HTMLContentModel, HTMLElementModel} from '@native-html/render';

const VICTORY_HTML_ELEMENT_MODELS = {
    victorychart: HTMLElementModel.fromCustomModel({
        tagName: 'victorychart',
        contentModel: HTMLContentModel.block,
    }),
    victorybar: HTMLElementModel.fromCustomModel({
        tagName: 'victorybar',
        contentModel: HTMLContentModel.block,
    }),
    victoryline: HTMLElementModel.fromCustomModel({
        tagName: 'victoryline',
        contentModel: HTMLContentModel.block,
    }),
    victoryaxis: HTMLElementModel.fromCustomModel({
        tagName: 'victoryaxis',
        contentModel: HTMLContentModel.block,
    }),
    victorylabel: HTMLElementModel.fromCustomModel({
        tagName: 'victorylabel',
        contentModel: HTMLContentModel.textual,
    }),
    victorylegend: HTMLElementModel.fromCustomModel({
        tagName: 'victorylegend',
        contentModel: HTMLContentModel.block,
    }),
    victorygroup: HTMLElementModel.fromCustomModel({
        tagName: 'victorygroup',
        contentModel: HTMLContentModel.block,
    }),
    victorypie: HTMLElementModel.fromCustomModel({
        tagName: 'victorypie',
        contentModel: HTMLContentModel.block,
    }),
    shiftedlinesegment: HTMLElementModel.fromCustomModel({
        tagName: 'shiftedlinesegment',
        contentModel: HTMLContentModel.block,
    }),
} as const;

export default VICTORY_HTML_ELEMENT_MODELS;
