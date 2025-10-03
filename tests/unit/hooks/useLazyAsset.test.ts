import {renderHook, waitFor} from '@testing-library/react-native';
import useLazyAsset, {useMemoizedLazyAsset} from '@hooks/useLazyAsset';

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

        // Initially, asset should be undefined (not loaded yet)
        expect(result.current.asset).toBeUndefined();
        expect(result.current.isLoaded).toBe(false);
        expect(result.current.isLoading).toBe(true);
        expect(result.current.hasError).toBe(false);
    });

    it('should handle successful asset loading', async () => {
        const importFn = jest.fn(() => Promise.resolve({default: mockAsset}));

        const {result} = renderHook(() => useLazyAsset(importFn));

        // Initially should be undefined
        expect(result.current.asset).toBeUndefined();
        expect(result.current.isLoading).toBe(true);

        // Wait for asset to load
        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true);
        });

        // Should have loaded the asset successfully
        expect(result.current.hasError).toBe(false);
        expect(result.current.asset).toEqual(mockAsset);
        expect(result.current.isLoading).toBe(false);
    });

    it('should handle loading errors gracefully', async () => {
        const importFn = jest.fn(() => Promise.reject(new Error('Failed to load')));

        const {result} = renderHook(() => useLazyAsset(importFn));

        // Initially should be undefined
        expect(result.current.asset).toBeUndefined();

        // Wait for error to be processed
        await waitFor(() => {
            expect(result.current.hasError).toBe(true);
        });

        // Should remain undefined on error without fallback
        expect(result.current.asset).toBeUndefined();
        expect(result.current.hasError).toBe(true);
        expect(result.current.isLoaded).toBe(false);
        expect(result.current.isLoading).toBe(false);
    });

    it('should handle fallback assets on error', async () => {
        const importFn = jest.fn(() => Promise.reject(new Error('Failed to load')));

        const {result} = renderHook(() => useLazyAsset(importFn, mockFallbackAsset));

        // Initially should be undefined
        expect(result.current.asset).toBeUndefined();

        // Wait for fallback to be applied
        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true);
        });

        // Should use fallback asset on error
        expect(result.current.asset).toEqual(mockFallbackAsset);
        expect(result.current.hasError).toBe(true);
        expect(result.current.isLoaded).toBe(true);
        expect(result.current.isLoading).toBe(false);
    });

    it('should handle component unmounting safely', () => {
        const importFn = jest.fn(() => Promise.resolve({default: mockAsset}));

        const {result, unmount} = renderHook(() => useLazyAsset(importFn));

        // Initially should be undefined
        expect(result.current.asset).toBeUndefined();

        // Should not throw when unmounting
        expect(() => unmount()).not.toThrow();
    });

    it('should work with different import functions', async () => {
        const importFn1 = jest.fn(() => Promise.resolve({default: mockAsset}));
        const importFn2 = jest.fn(() => Promise.resolve({default: mockFallbackAsset}));

        const {result, rerender} = renderHook((props: {importFn: () => Promise<{default: {type: string; id: string}}>}) => useLazyAsset(props.importFn), {
            initialProps: {importFn: importFn1},
        });

        // Initially should be undefined
        expect(result.current.asset).toBeUndefined();

        // Wait for first asset to load
        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true);
        });
        expect(result.current.asset).toEqual(mockAsset);

        // Change import function
        rerender({importFn: importFn2});

        // Wait for new asset to load
        await waitFor(() => {
            expect(result.current.asset).toEqual(mockFallbackAsset);
        });

        expect(result.current.asset).toEqual(mockFallbackAsset);
        expect(result.current.isLoaded).toBe(true);
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

        // Initially should be undefined
        expect(result.current.asset).toBeUndefined();
        expect(result.current.isLoaded).toBe(false);
        expect(result.current.isLoading).toBe(true);
        expect(result.current.hasError).toBe(false);
    });

    it('should handle errors with fallback', async () => {
        const importFn = jest.fn(() => Promise.reject(new Error('Failed')));

        const {result} = renderHook(() => useMemoizedLazyAsset(importFn, mockFallbackAsset));

        // Initially should be undefined
        expect(result.current.asset).toBeUndefined();

        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true);
        });

        // Should use fallback on error
        expect(result.current.asset).toEqual(mockFallbackAsset);
        expect(result.current.hasError).toBe(true);
        expect(result.current.isLoaded).toBe(true);
        expect(result.current.isLoading).toBe(false);
    });

    it('should handle function reference changes', async () => {
        const importFn1 = jest.fn(() => Promise.resolve({default: mockAsset}));
        const importFn2 = jest.fn(() => Promise.resolve({default: mockFallbackAsset}));

        const {result, rerender} = renderHook((props: {importFn: () => Promise<{default: {type: string; id: string}}>}) => useMemoizedLazyAsset(props.importFn), {
            initialProps: {importFn: importFn1},
        });

        // Initially should be undefined
        expect(result.current.asset).toBeUndefined();

        // Wait for first asset to load
        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true);
        });
        expect(result.current.asset).toEqual(mockAsset);

        // Change to different function
        rerender({importFn: importFn2});

        await waitFor(() => {
            expect(result.current.asset).toEqual(mockFallbackAsset);
        });

        expect(result.current.asset).toEqual(mockFallbackAsset);
        expect(result.current.isLoaded).toBe(true);
    });
});
