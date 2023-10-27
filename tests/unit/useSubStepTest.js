import {renderHook} from '@testing-library/react-native';
import useSubStep from '../../src/hooks/useSubStep';

function MockSubStepComponent() {}
function MockSubStepComponent2() {}

const mockOnFinished = jest.fn();

describe('useSubStep hook', () => {
    it('returns componentToRender, isEditing, currentIndex, prevScreen, nextScreen, moveTo', () => {
        const {result} = renderHook(() => useSubStep({bodyContent: [MockSubStepComponent], onFinished: mockOnFinished, startFrom: 0}));

        const {componentToRender, isEditing, moveTo, nextScreen, prevScreen, screenIndex} = result.current;

        expect(componentToRender).toBe(MockSubStepComponent);
        expect(isEditing).toBe(false);
        expect(screenIndex).toBe(0);
        expect(typeof prevScreen).toBe('function');
        expect(typeof nextScreen).toBe('function');
        expect(typeof moveTo).toBe('function');
    });

    it('calls onFinished when it is the last step', () => {
        const {result} = renderHook(() => useSubStep({bodyContent: [MockSubStepComponent], onFinished: mockOnFinished, startFrom: 0}));

        const {nextScreen} = result.current;

        nextScreen();

        expect(mockOnFinished).toHaveBeenCalledTimes(1);
    });

    it('returns component at requested substep when calling moveTo', () => {
        const {result, rerender} = renderHook(() => useSubStep({bodyContent: [MockSubStepComponent2, MockSubStepComponent, MockSubStepComponent], onFinished: mockOnFinished, startFrom: 2}));

        const {moveTo} = result.current;

        moveTo(0);

        rerender();

        const {componentToRender} = result.current;

        expect(componentToRender).toBe(MockSubStepComponent2);
    });

    it('returns substep component at the previous index when calling prevScreen (if possible)', () => {
        const {result, rerender} = renderHook(() => useSubStep({bodyContent: [MockSubStepComponent2, MockSubStepComponent, MockSubStepComponent], onFinished: mockOnFinished, startFrom: 1}));

        const {prevScreen, screenIndex} = result.current;

        expect(screenIndex).toBe(1);
        prevScreen();

        rerender();

        const {componentToRender, screenIndex: newScreenIndex} = result.current;
        expect(newScreenIndex).toBe(0);

        expect(componentToRender).toBe(MockSubStepComponent2);
    });

    it('stays on the first substep component when calling prevScreen on the first screen', () => {
        const {result, rerender} = renderHook(() => useSubStep({bodyContent: [MockSubStepComponent2, MockSubStepComponent, MockSubStepComponent], onFinished: mockOnFinished, startFrom: 0}));

        const {componentToRender, prevScreen, screenIndex} = result.current;

        expect(screenIndex).toBe(0);
        expect(componentToRender).toBe(MockSubStepComponent2);

        prevScreen();

        rerender();

        const {componentToRender: newComponentToRender, screenIndex: newScreenIndex} = result.current;

        expect(newScreenIndex).toBe(0);
        expect(newComponentToRender).toBe(MockSubStepComponent2);
    });
});
