import parseVictoryLabelNode from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/victoryLabelParser';
import processVictoryChartTree from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/parsers/processVictoryChartTree';
import {
    formatAsOfDateTimeForTimezone,
    getLocalizedAsOfVictoryChartLabelText,
    parseUtcAsOfDateTime,
} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/formatAsOfVictoryChartLabel';
import type {TNode} from 'react-native-render-html';

function createNode(tagName: string, attributes: Record<string, string> = {}, children: TNode[] = []): TNode {
    return {tagName, attributes, children} as unknown as TNode;
}

describe('formatAsOfVictoryChartLabel', () => {
    it('parses server UTC chart timestamps', () => {
        const utcDate = parseUtcAsOfDateTime('Jun 5, 2026 at 06:47 PM');
        expect(utcDate?.toISOString()).toBe('2026-06-05T18:47:00.000Z');
    });

    it('parses server UTC chart timestamps without a leading zero on the hour', () => {
        const utcDate = parseUtcAsOfDateTime('Jun 12, 2026 at 8:48 AM');
        expect(utcDate?.toISOString()).toBe('2026-06-12T08:48:00.000Z');
    });

    it('parses ISO UTC chart timestamps', () => {
        const utcDate = parseUtcAsOfDateTime('2026-06-05T18:47:00Z');
        expect(utcDate?.toISOString()).toBe('2026-06-05T18:47:00.000Z');
    });

    it('formats the timestamp in the viewer timezone without a timezone label', () => {
        const utcDate = parseUtcAsOfDateTime('Jun 5, 2026 at 06:47 PM');
        expect(utcDate).not.toBeNull();

        const formatted = formatAsOfDateTimeForTimezone(utcDate as Date, 'America/Los_Angeles');
        expect(formatted).toBe('Jun 5, 2026 at 11:47 AM');
    });

    it('rewrites As of labels and leaves other labels unchanged', () => {
        const localized = getLocalizedAsOfVictoryChartLabelText('As of: Jun 5, 2026 at 06:47 PM', 'America/Los_Angeles');
        expect(localized).toBe('As of: Jun 5, 2026 at 11:47 AM');

        expect(getLocalizedAsOfVictoryChartLabelText('Top employees by spend', 'America/Los_Angeles')).toBe('Top employees by spend');
        expect(getLocalizedAsOfVictoryChartLabelText('As of: Jun 5, 2026 at 06:47 PM')).toBe('As of: Jun 5, 2026 at 06:47 PM');
    });
});

describe('victoryLabelParser As of localization', () => {
    it('localizes As of labels when a viewer timezone is provided', () => {
        const node = createNode('victorylabel', {
            x: '32',
            y: '62',
            text: 'As of: Jun 5, 2026 at 06:47 PM',
        });

        const result = parseVictoryLabelNode(node, null, null, 'America/Los_Angeles');
        expect(result.labelItems?.at(0)?.text).toBe('As of: Jun 5, 2026 at 11:47 AM');
    });
});

describe('processVictoryChartTree As of localization', () => {
    it('localizes As of labels in a parsed chart tree', () => {
        const tree = createNode('victorychart', {}, [
            createNode('victorylabel', {x: '32', y: '40', text: 'Top employees by spend'}),
            createNode('victorylabel', {x: '32', y: '62', text: 'As of: Jun 5, 2026 at 06:47 PM'}),
            createNode('victorybar', {data: "[{x: 'Carlos Martins', y: 500}]"}),
        ]);

        const result = processVictoryChartTree(tree, null, null, 'America/Los_Angeles');
        expect(result.labelItems.at(0)?.text).toBe('Top employees by spend');
        expect(result.labelItems.at(1)?.text).toBe('As of: Jun 5, 2026 at 11:47 AM');
    });
});
