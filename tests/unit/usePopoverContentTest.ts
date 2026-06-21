/**
 * @jest-environment jsdom
 */
import {renderHook} from '@testing-library/react-native';
import usePopoverContent from '@components/Popover/v2/content/usePopoverContent';
import variables from '@styles/variables';

jest.mock('@components/Overlay/hooks/useAnchoredPosition', () => () => ({
    style: {top: 100, left: 200},
    available: {width: 320, height: 480},
    isPositioned: true,
    onContentLayout: () => {},
}));

jest.mock('@hooks/useThemeStyles', () => () => ({
    pAbsolute: {position: 'absolute'},
}));

describe('usePopoverContent', () => {
    const baseInput = {
        anchorRect: {top: 10, bottom: 20, left: 30, right: 40, width: 10, height: 10},
    };

    it("defaults role to 'region' when none is provided", () => {
        const {result} = renderHook(() => usePopoverContent(baseInput));
        expect(result.current.contentProps.role).toBe('region');
    });

    it.each(['menu', 'tooltip', 'region', 'dialog'] as const)("passes role='%s' through to contentProps unchanged", (role) => {
        const {result} = renderHook(() => usePopoverContent({...baseInput, role}));
        expect(result.current.contentProps.role).toBe(role);
    });

    it('falls back accessibilityLabelledBy to triggerID when titleID is absent (Disclosure pattern)', () => {
        const {result} = renderHook(() => usePopoverContent({...baseInput, triggerID: 'tr-1'}));
        expect(result.current.contentProps.accessibilityLabelledBy).toBe('tr-1');
    });

    it('prefers titleID over triggerID when both are supplied', () => {
        const {result} = renderHook(() => usePopoverContent({...baseInput, triggerID: 'tr-1', titleID: 'title-1'}));
        expect(result.current.contentProps.accessibilityLabelledBy).toBe('title-1');
    });

    it('wires accessibilityDescribedBy to descriptionID', () => {
        const {result} = renderHook(() => usePopoverContent({...baseInput, descriptionID: 'desc-1'}));
        expect(result.current.contentProps.accessibilityDescribedBy).toBe('desc-1');
    });

    it('uses caller-supplied contentID for nativeID', () => {
        const {result} = renderHook(() => usePopoverContent({...baseInput, contentID: 'content-x'}));
        expect(result.current.contentProps.nativeID).toBe('content-x');
    });

    it('generates a stable nativeID when none is supplied', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- renderHook's rerender(props) signature requires the wrapper to accept a props param even when unused.
        const {result, rerender} = renderHook((_props: Record<string, never>) => usePopoverContent(baseInput), {initialProps: {}});
        const first = result.current.contentProps.nativeID;
        expect(typeof first).toBe('string');
        rerender({});
        expect(result.current.contentProps.nativeID).toBe(first);
    });

    it('opacity guard: positionProps.style.opacity reflects isPositioned (hides surface until measured)', () => {
        const {result} = renderHook(() => usePopoverContent(baseInput));
        expect(result.current.positionProps.style.opacity).toBe(1);
    });

    it('reports available height/width from the anchored-position hook', () => {
        const {result} = renderHook(() => usePopoverContent(baseInput));
        expect(result.current.available).toEqual({width: 320, height: 480});
    });

    it('forwards accessibilityLabel', () => {
        const {result} = renderHook(() => usePopoverContent({...baseInput, accessibilityLabel: 'Filters'}));
        expect(result.current.contentProps.accessibilityLabel).toBe('Filters');
    });

    // Sanity import to ensure the styles util mock is wired (silences unused-import warnings in some configs).
    it('exists in the public API surface', () => {
        expect(typeof variables).toBe('object');
    });
});
