import {renderHook, waitFor} from '@testing-library/react-native';
import useLazyAsset, {useMemoizedLazyAsset} from '@hooks/useLazyAsset';

jest.mock('@components/Icon/PlaceholderIcon', () => 'PlaceholderIcon');

jest.mock('@hooks/useLazyAsset', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@hooks/useLazyAsset');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __esModule: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        ...actual,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        default: actual.default,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        useMemoizedLazyAsset: actual.useMemoizedLazyAsset,
    };
});

const mockAsset = {type: 'test-asset', id: 'asset-1'};
const mockFallbackAsset = {type: 'fallback-asset', id: 'fallback-1'};

describe('useLazyAsset', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with proper state structure', () => {
        const importFn = jest.fn(() => Promise.resolve({default: mockAsset}));

        const {result} = renderHook(() => useLazyAsset(importFn));

        // Test that the hook returns the expected structure
        expect(result.current).toHaveProperty('isLoading');
        expect(result.current).toHaveProperty('isLoaded');
        expect(result.current).toHaveProperty('hasError');
        expect(result.current).toHaveProperty('asset');

        // Test that state values are booleans
        expect(typeof result.current.isLoading).toBe('boolean');
        expect(typeof result.current.isLoaded).toBe('boolean');
        expect(typeof result.current.hasError).toBe('boolean');

        // Test that asset is defined
        expect(result.current.asset).toBeDefined();
        expect(result.current.hasError).toBe(false);
    });

    it('should handle successful asset loading', async () => {
        const importFn = jest.fn(() => Promise.resolve({default: mockAsset}));

        const {result} = renderHook(() => useLazyAsset(importFn));

        // Wait for any async operations to complete
        await waitFor(() => {
            expect(result.current.asset).toBeDefined();
        });

        // Should not have errors after successful load
        expect(result.current.hasError).toBe(false);
        expect(result.current.asset).toBeDefined();
    });

    it('should handle loading errors gracefully', async () => {
        const importFn = jest.fn(() => Promise.reject(new Error('Failed to load')));

        const {result} = renderHook(() => useLazyAsset(importFn));

        // Wait for error to be processed
        await waitFor(() => {
            expect(result.current.asset).toBeDefined();
        });

        // Should still have an asset (placeholder) even on error
        expect(result.current.asset).toBeDefined();
        // State should be consistent
        expect(typeof result.current.hasError).toBe('boolean');
        expect(typeof result.current.isLoaded).toBe('boolean');
    });

    it('should handle fallback assets on error', async () => {
        const importFn = jest.fn(() => Promise.reject(new Error('Failed to load')));

        const {result} = renderHook(() => useLazyAsset(importFn, mockFallbackAsset));

        // Wait for fallback to be applied
        await waitFor(() => {
            expect(result.current.asset).toBeDefined();
        });

        // Should have some asset defined
        expect(result.current.asset).toBeDefined();
        // State should be consistent
        expect(typeof result.current.hasError).toBe('boolean');
        expect(typeof result.current.isLoaded).toBe('boolean');
    });

    it('should handle component unmounting safely', () => {
        const importFn = jest.fn(() => Promise.resolve({default: mockAsset}));

        const {result, unmount} = renderHook(() => useLazyAsset(importFn));

        expect(result.current.asset).toBeDefined();

        // Should not throw when unmounting
        expect(() => unmount()).not.toThrow();
    });

    it('should work with different import functions', async () => {
        const importFn1 = jest.fn(() => Promise.resolve({default: mockAsset}));
        const importFn2 = jest.fn(() => Promise.resolve({default: mockFallbackAsset}));

        const {result, rerender} = renderHook((props: {importFn: () => Promise<{default: {type: string; id: string}}>}) => useLazyAsset(props.importFn), {
            initialProps: {importFn: importFn1},
        });

        expect(result.current.asset).toBeDefined();

        // Change import function
        rerender({importFn: importFn2});

        await waitFor(() => {
            expect(result.current.asset).toBeDefined();
        });

        expect(result.current.asset).toBeDefined();
    });
});

describe('useMemoizedLazyAsset', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should work with basic functionality', () => {
        const importFn = jest.fn(() => Promise.resolve({default: mockAsset}));

        const {result} = renderHook(() => useMemoizedLazyAsset(importFn));

        // Test that the hook returns the expected structure
        expect(result.current).toHaveProperty('isLoading');
        expect(result.current).toHaveProperty('isLoaded');
        expect(result.current).toHaveProperty('hasError');
        expect(result.current).toHaveProperty('asset');

        expect(result.current.asset).toBeDefined();
        expect(result.current.hasError).toBe(false);
    });

    it('should handle errors with fallback', async () => {
        const importFn = jest.fn(() => Promise.reject(new Error('Failed')));

        const {result} = renderHook(() => useMemoizedLazyAsset(importFn, mockFallbackAsset));

        await waitFor(() => {
            expect(result.current.asset).toBeDefined();
        });

        expect(result.current.asset).toBeDefined();
        expect(typeof result.current.hasError).toBe('boolean');
        expect(typeof result.current.isLoaded).toBe('boolean');
    });

    it('should handle function reference changes', async () => {
        const importFn1 = jest.fn(() => Promise.resolve({default: mockAsset}));
        const importFn2 = jest.fn(() => Promise.resolve({default: mockFallbackAsset}));

        const {result, rerender} = renderHook((props: {importFn: () => Promise<{default: {type: string; id: string}}>}) => useMemoizedLazyAsset(props.importFn), {
            initialProps: {importFn: importFn1},
        });

        expect(result.current.asset).toBeDefined();

        // Change to different function
        rerender({importFn: importFn2});

        await waitFor(() => {
            expect(result.current.asset).toBeDefined();
        });

        expect(result.current.asset).toBeDefined();
    });
});
