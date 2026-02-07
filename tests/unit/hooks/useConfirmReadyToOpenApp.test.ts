import {renderHook} from '@testing-library/react-native';
import useConfirmReadyToOpenApp from '@hooks/useConfirmReadyToOpenApp';
import {confirmReadyToOpenApp} from '@libs/actions/App';

jest.mock('@libs/actions/App', () => ({
    confirmReadyToOpenApp: jest.fn(),
}));

describe('useConfirmReadyToOpenApp', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should call confirmReadyToOpenApp on mount', () => {
        // Given the hook is rendered
        renderHook(() => useConfirmReadyToOpenApp());

        // Then confirmReadyToOpenApp should be called once
        expect(confirmReadyToOpenApp).toHaveBeenCalledTimes(1);
    });

    it('should not call confirmReadyToOpenApp on re-renders', () => {
        // Given the hook is rendered
        const {rerender} = renderHook(() => useConfirmReadyToOpenApp());
        expect(confirmReadyToOpenApp).toHaveBeenCalledTimes(1);

        // When the component re-renders
        rerender({});

        // Then confirmReadyToOpenApp should still only have been called once
        expect(confirmReadyToOpenApp).toHaveBeenCalledTimes(1);
    });

    it('should call confirmReadyToOpenApp again when remounted', () => {
        // Given the hook is rendered and unmounted
        const {unmount} = renderHook(() => useConfirmReadyToOpenApp());
        expect(confirmReadyToOpenApp).toHaveBeenCalledTimes(1);
        unmount();

        // When the hook is rendered again (new mount)
        renderHook(() => useConfirmReadyToOpenApp());

        // Then confirmReadyToOpenApp should be called again
        expect(confirmReadyToOpenApp).toHaveBeenCalledTimes(2);
    });
});
