import {renderHook} from '@testing-library/react-native';
import useSubStep from '../../src/hooks/useSubStep';

function MockSubStepComponent() {}
function MockSubStepComponent2() {}

const mockOnFinished = jest.fn();

describe('useSubStep hook', () => {
    it('returns componentToRender, isEditing, nextScreen, moveTo', () => {
        const {result} = renderHook(() => useSubStep({bodyContent: [MockSubStepComponent], onFinished: mockOnFinished, startFrom: 0}));

        const {componentToRender, isEditing, moveTo, nextScreen} = result.current;

        expect(componentToRender).toBe(MockSubStepComponent);
        expect(isEditing).toBe(false);
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
        const {result, rerender} = renderHook(() => useSubStep({bodyContent: [MockSubStepComponent2, MockSubStepComponent, MockSubStepComponent], onFinished: mockOnFinished, startFrom: 1}));

        const {moveTo} = result.current;

        moveTo(0);

        rerender();

        const {componentToRender} = result.current;

        expect(componentToRender).toBe(MockSubStepComponent2);
    });
});
