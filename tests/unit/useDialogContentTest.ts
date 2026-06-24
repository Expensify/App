/**
 * @jest-environment jsdom
 */
import {renderHook} from '@testing-library/react-native';
import useDialogContent from '@components/Modal/v2/compound/useDialogContent';
import CONST from '@src/CONST';

describe('useDialogContent', () => {
    it("defaults role='dialog' and aria-modal=true (modal contract per WAI-ARIA APG)", () => {
        const {result} = renderHook(() => useDialogContent());
        expect(result.current.dialogProps.role).toBe(CONST.ROLE.DIALOG);
        expect(result.current.dialogProps['aria-modal']).toBe(true);
    });

    it("aria-modal=true also for role='alertdialog'", () => {
        const {result} = renderHook(() => useDialogContent({role: CONST.ROLE.ALERTDIALOG}));
        expect(result.current.dialogProps['aria-modal']).toBe(true);
        expect(result.current.dialogProps.role).toBe(CONST.ROLE.ALERTDIALOG);
    });

    it('omits aria-modal when modal:false (non-modal dialog)', () => {
        const {result} = renderHook(() => useDialogContent({modal: false}));
        expect(result.current.dialogProps['aria-modal']).toBeUndefined();
    });

    it('wires accessibilityLabelledBy and accessibilityDescribedBy to the generated title/description IDs', () => {
        const {result} = renderHook(() => useDialogContent());
        const {dialogProps, titleProps, descriptionProps} = result.current;
        expect(typeof titleProps.nativeID).toBe('string');
        expect(typeof descriptionProps.nativeID).toBe('string');
        expect(dialogProps.accessibilityLabelledBy).toBe(titleProps.nativeID);
        expect(dialogProps.accessibilityDescribedBy).toBe(descriptionProps.nativeID);
    });

    it('uses caller-supplied IDs verbatim when provided', () => {
        const {result} = renderHook(() =>
            useDialogContent({
                contentID: 'c',
                titleID: 't',
                descriptionID: 'd',
            }),
        );
        expect(result.current.dialogProps.nativeID).toBe('c');
        expect(result.current.titleProps.nativeID).toBe('t');
        expect(result.current.descriptionProps.nativeID).toBe('d');
    });

    it('forwards accessibilityLabel when present', () => {
        const {result} = renderHook(() => useDialogContent({accessibilityLabel: 'Confirm deletion'}));
        expect(result.current.dialogProps.accessibilityLabel).toBe('Confirm deletion');
    });

    it('generates stable IDs across re-renders', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- renderHook's rerender(props) signature requires the wrapper to accept a props param even when unused.
        const {result, rerender} = renderHook((_props: Record<string, never>) => useDialogContent(), {initialProps: {}});
        const first = {
            content: result.current.dialogProps.nativeID,
            title: result.current.titleProps.nativeID,
            description: result.current.descriptionProps.nativeID,
        };
        rerender({});
        expect(result.current.dialogProps.nativeID).toBe(first.content);
        expect(result.current.titleProps.nativeID).toBe(first.title);
        expect(result.current.descriptionProps.nativeID).toBe(first.description);
    });
});
