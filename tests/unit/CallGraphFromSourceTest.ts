import type {FileAnalysis} from '../../scripts/callGraphFromSource';

import {analyzeSource, MODULE_UNIT_NAME} from '../../scripts/callGraphFromSource';

const FILE = 'src/pages/SearchPage.tsx';
const ONYX_IMPORT = "import Onyx from 'react-native-onyx';";
const ONYX_UTILS_IMPORT = "import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';";

function unitId(name: string): string {
    return `${FILE}#${name}`;
}

function readUnitIds(analysis: FileAnalysis): string[] {
    return analysis.reads.map((read) => read.unitId);
}

function localEdges(analysis: FileAnalysis): Array<[string, string]> {
    return analysis.calls.flatMap((call) => (call.callee.kind === 'local' ? [[call.from, call.callee.unitId] as [string, string]] : []));
}

function moduleEdges(analysis: FileAnalysis): Array<[string, string, string]> {
    return analysis.calls.flatMap((call) => (call.callee.kind === 'module' ? [[call.from, call.callee.source, call.callee.name] as [string, string, string]] : []));
}

function findUnit(analysis: FileAnalysis, name: string) {
    return analysis.units.find((candidate) => candidate.name === name);
}

function localReferences(analysis: FileAnalysis): Array<[string, string, string | null]> {
    return analysis.references.flatMap((reference) =>
        reference.target.kind === 'local' ? [[reference.from, reference.target.unitId, reference.via] as [string, string, string | null]] : [],
    );
}

function moduleReferences(analysis: FileAnalysis): Array<[string, string, string, string | null]> {
    return analysis.references.flatMap((reference) =>
        reference.target.kind === 'module' ? [[reference.from, reference.target.source, reference.target.name, reference.via] as [string, string, string, string | null]] : [],
    );
}

describe('analyzeSource, units and read attribution', () => {
    it('attributes a read in a plain module function to that function, which is not render code', () => {
        const analysis = analyzeSource(FILE, `${ONYX_IMPORT} export function buildPayload(reportID) { return Onyx.get(reportID); }`);

        expect(readUnitIds(analysis)).toEqual([unitId('buildPayload')]);
        expect(findUnit(analysis, 'buildPayload')?.isRenderEntry).toBe(false);
    });

    it('attributes a read in a component body to the component, which is render code', () => {
        const analysis = analyzeSource(FILE, `${ONYX_IMPORT} function Row() { const value = Onyx.get(key); return <View value={value} />; }`);

        expect(readUnitIds(analysis)).toEqual([unitId('Row')]);
        expect(findUnit(analysis, 'Row')?.isRenderEntry).toBe(true);
    });

    it('attributes a read in an event handler to the handler, not to the component around it', () => {
        const analysis = analyzeSource(FILE, `${ONYX_IMPORT} function Row() { const onPress = () => Onyx.get(key); return <View onPress={onPress} />; }`);

        expect(readUnitIds(analysis)).toEqual([unitId('Row.onPress')]);
        expect(findUnit(analysis, 'Row.onPress')?.isRenderEntry).toBe(false);
    });

    it('treats an IIFE as transparent, so the read belongs to the component', () => {
        const analysis = analyzeSource(FILE, `${ONYX_IMPORT} function Row() { const value = (() => Onyx.get(key))(); return <View value={value} />; }`);

        expect(readUnitIds(analysis)).toEqual([unitId('Row')]);
    });

    it('treats a synchronous array callback as transparent, so the read belongs to the component', () => {
        const analysis = analyzeSource(FILE, `${ONYX_IMPORT} function Row() { const values = ids.map((id) => Onyx.get(id)); return <View values={values} />; }`);

        expect(readUnitIds(analysis)).toEqual([unitId('Row')]);
    });

    it('treats a useMemo callback as transparent, so the read belongs to the component', () => {
        const analysis = analyzeSource(FILE, `${ONYX_IMPORT} function Row() { const value = useMemo(() => Onyx.get(key), []); return <View value={value} />; }`);

        expect(readUnitIds(analysis)).toEqual([unitId('Row')]);
    });

    it('keeps a useCallback body as a unit of its own', () => {
        const analysis = analyzeSource(FILE, `${ONYX_IMPORT} function Row() { const onPress = useCallback(() => Onyx.get(key), []); return <View onPress={onPress} />; }`);

        expect(readUnitIds(analysis)).toEqual([unitId('Row.onPress')]);
    });

    it('names a wrapped component after its binding', () => {
        const analysis = analyzeSource(FILE, `${ONYX_IMPORT} const Row = memo(() => { const value = Onyx.get(key); return <View value={value} />; });`);

        expect(readUnitIds(analysis)).toEqual([unitId('Row')]);
        expect(findUnit(analysis, 'Row')?.isRenderEntry).toBe(true);
    });

    it('treats a hook body as render code', () => {
        const analysis = analyzeSource(FILE, `${ONYX_UTILS_IMPORT} export function useSwitchToDelegator() { return OnyxUtils.get(key); }`);

        expect(findUnit(analysis, 'useSwitchToDelegator')?.isRenderEntry).toBe(true);
    });

    it('attributes a read at module scope to the module unit, which runs at import time', () => {
        const analysis = analyzeSource(FILE, `${ONYX_IMPORT} const initialValue = Onyx.get(key);`);

        expect(readUnitIds(analysis)).toEqual([unitId(MODULE_UNIT_NAME)]);
        expect(findUnit(analysis, MODULE_UNIT_NAME)?.isRenderEntry).toBe(false);
    });

    it('finds aliased reads', () => {
        const analysis = analyzeSource(FILE, `${ONYX_UTILS_IMPORT} const {get: readOnyx} = OnyxUtils; export function buildPayload() { return readOnyx(key); }`);

        expect(analysis.reads).toEqual([{unitId: unitId('buildPayload'), method: 'readOnyx', line: 1}]);
    });

    it('ignores a local object that happens to expose a get', () => {
        const analysis = analyzeSource(FILE, 'const store = {get: () => undefined}; function Row() { const value = store.get(key); return <View value={value} />; }');

        expect(analysis.reads).toEqual([]);
    });
});

describe('analyzeSource, call edges', () => {
    it('records a call to a function declared later in the file', () => {
        const analysis = analyzeSource(FILE, 'function Row() { helper(); return <View />; } function helper() {}');

        expect(localEdges(analysis)).toEqual([[unitId('Row'), unitId('helper')]]);
    });

    it('records a call inside a handler as an edge out of the handler', () => {
        const analysis = analyzeSource(FILE, 'function Row() { const onPress = () => helper(); return <View onPress={onPress} />; } function helper() {}');

        expect(localEdges(analysis)).toEqual([[unitId('Row.onPress'), unitId('helper')]]);
    });

    it('records a call inside an array callback as an edge out of the component', () => {
        const analysis = analyzeSource(FILE, 'function Row() { const values = ids.map((id) => helper(id)); return <View values={values} />; } function helper(id) { return id; }');

        expect(localEdges(analysis)).toEqual([[unitId('Row'), unitId('helper')]]);
    });

    it('records a named import as a cross-file edge', () => {
        const analysis = analyzeSource(FILE, "import {navigateToConciergeChat} from '@userActions/Report'; function Row() { navigateToConciergeChat(); return <View />; }");

        expect(moduleEdges(analysis)).toEqual([[unitId('Row'), '@userActions/Report', 'navigateToConciergeChat']]);
    });

    it('records a default import called directly as an edge to that module default', () => {
        const analysis = analyzeSource(FILE, "import navigateToConciergeChat from '@userActions/navigateToConciergeChat'; function Row() { navigateToConciergeChat(); return <View />; }");

        expect(moduleEdges(analysis)).toEqual([[unitId('Row'), '@userActions/navigateToConciergeChat', 'default']]);
    });

    it('records a member call on a default import as an edge to the named member', () => {
        const analysis = analyzeSource(FILE, "import Navigation from '@libs/Navigation/Navigation'; function Row() { Navigation.navigate(route); return <View />; }");

        expect(moduleEdges(analysis)).toEqual([[unitId('Row'), '@libs/Navigation/Navigation', 'navigate']]);
    });

    it('records a member call on a namespace import the same way', () => {
        const analysis = analyzeSource(FILE, "import * as ReportUtils from '@libs/ReportUtils'; function Row() { ReportUtils.getReportName(report); return <View />; }");

        expect(moduleEdges(analysis)).toEqual([[unitId('Row'), '@libs/ReportUtils', 'getReportName']]);
    });

    it('leaves an unresolvable call unresolved rather than guessing', () => {
        const analysis = analyzeSource(FILE, 'function Row(props) { props.onDone(); return <View />; }');

        expect(analysis.calls.map((call) => call.callee.kind)).toEqual(['unresolved']);
    });
});

describe('analyzeSource, exports', () => {
    it('records the default export unit when it is a function', () => {
        const analysis = analyzeSource(FILE, 'export default function Row() { return <View />; }');

        expect(analysis.defaultExportUnitId).toBe(unitId('Row'));
    });

    it('records a default export that points at a wrapped component', () => {
        const analysis = analyzeSource(FILE, 'const Row = memo(() => <View />); export default Row;');

        expect(analysis.defaultExportUnitId).toBe(unitId('Row'));
    });

    it('records named and star re-exports', () => {
        const analysis = analyzeSource(FILE, "export {buildPayload} from './Payload'; export * from './Other';");

        expect(analysis.reExports).toEqual([
            {name: 'buildPayload', source: './Payload'},
            {name: '*', source: './Other'},
        ]);
    });
});

/**
 * A function passed as a value has no call edge, because passing it is not calling it. Recording where
 * it was handed off is what separates "no path to render" from "nothing was traced at all".
 */
describe('analyzeSource, value references', () => {
    it('records a function passed as an object property, naming the call that receives it', () => {
        const analysis = analyzeSource(FILE, 'function useThing() { const onReconnect = () => {}; useNetwork({onReconnect}); }');

        expect(localReferences(analysis)).toEqual([[unitId('useThing'), unitId('useThing.onReconnect'), 'useNetwork']]);
    });

    it('records the same handoff written longhand', () => {
        const analysis = analyzeSource(FILE, 'function useThing() { const refresh = () => {}; useNetwork({onReconnect: refresh}); }');

        expect(localReferences(analysis)).toEqual([[unitId('useThing'), unitId('useThing.refresh'), 'useNetwork']]);
    });

    it('records a function passed as a JSX prop, naming the prop', () => {
        const analysis = analyzeSource(FILE, 'function Row() { const onPress = () => {}; return <View onPress={onPress} />; }');

        expect(localReferences(analysis)).toEqual([[unitId('Row'), unitId('Row.onPress'), 'onPress']]);
    });

    it('records a reference to an imported function', () => {
        const analysis = analyzeSource(FILE, "import openReport from '@userActions/Report'; function Row() { return <View onPress={openReport} />; }");

        expect(moduleReferences(analysis)).toEqual([[unitId('Row'), '@userActions/Report', 'default', 'onPress']]);
    });

    it('does not record a callee, which is a call rather than a handoff', () => {
        const analysis = analyzeSource(FILE, 'function helper() {} function submit() { helper(); }');

        expect(localReferences(analysis)).toEqual([]);
        expect(localEdges(analysis)).toEqual([[unitId('submit'), unitId('helper')]]);
    });

    it('does not record declarations, property keys or the export that names a function', () => {
        const analysis = analyzeSource(FILE, 'function helper() {} const handlers = {helper: 1}; export default helper;');

        expect(localReferences(analysis)).toEqual([]);
    });
});
