import {renderHook, waitFor} from '@testing-library/react-native';
import React from 'react';
import type {SvgProps} from 'react-native-svg/lib/typescript';
import useLazyAsset, {useMemoizedLazyAsset} from '@hooks/useLazyAsset';
import type IconAsset from '@src/types/utils/IconAsset';

jest.mock('@components/Icon/PlaceholderIcon', () => {
    // eslint-disable-next-line @typescript-eslint/no-shadow, @typescript-eslint/no-unsafe-assignment
    const React = require('react');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return React.memo(() =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
        React.createElement('svg', {
            dataTestId: 'placeholder-icon',
        }),
    );
});

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

// Create proper IconAsset mocks that satisfy the type constraint
const mockAsset: IconAsset = React.memo((props: SvgProps) => {
    return React.createElement('svg', {
        ...props,
        dataTestId: 'mock-asset',
        dataType: 'test-asset',
    });
});

const mockFallbackAsset: IconAsset = React.memo((props: SvgProps) => {
    return React.createElement('svg', {
        ...props,
        dataTestId: 'mock-fallback-asset',
        dataType: 'fallback-asset',
    });
});

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
        expect(result.current.asset).toBe(mockAsset);
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
        expect(result.current.asset).toBe(mockFallbackAsset);
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

        const {result, rerender} = renderHook((props: {importFn: () => Promise<{default: IconAsset}>}) => useLazyAsset(props.importFn), {
            initialProps: {importFn: importFn1},
        });

        // Initially should be undefined
        expect(result.current.asset).toBeUndefined();

        // Wait for first asset to load
        await waitFor(() => {
            expect(result.current.isLoaded).toBe(true);
        });
        expect(result.current.asset).toBe(mockAsset);

        // Change import function
        rerender({importFn: importFn2});

        // Wait for new asset to load
        await waitFor(() => {
            expect(result.current.asset).toBe(mockFallbackAsset);
        });

        expect(result.current.asset).toBe(mockFallbackAsset);
        expect(result.current.isLoaded).toBe(true);
    });

    it('ignores stale results when importFn changes mid-flight', async () => {
        let resolveFirst!: (v: {default: IconAsset}) => void;
        const firstPromise = new Promise<{default: IconAsset}>((resolve) => {
            resolveFirst = resolve;
        });
        const importFn1 = jest.fn(() => firstPromise);

        let resolveSecond!: (v: {default: IconAsset}) => void;
        const secondPromise = new Promise<{default: IconAsset}>((resolve) => {
            resolveSecond = resolve;
        });
        const importFn2 = jest.fn(() => secondPromise);

        const {result, rerender} = renderHook((props: {importFn: () => Promise<{default: IconAsset}>}) => useLazyAsset(props.importFn), {
            initialProps: {importFn: importFn1},
        });

        // Switch to the new import function before resolving the first
        rerender({importFn: importFn2});

        // Resolve the newer request first and ensure it wins
        resolveSecond({default: mockFallbackAsset});
        await waitFor(() => expect(result.current.asset).toBe(mockFallbackAsset));

        // Now resolve the earlier request; it should be ignored (no regression)
        resolveFirst({default: mockAsset});
        await waitFor(() => expect(result.current.asset).toBe(mockFallbackAsset));
    });

    it('resets isLoading when importFn changes', async () => {
        const importFn1 = jest.fn(() => Promise.resolve({default: mockAsset}));
        const importFn2 = jest.fn(() => Promise.resolve({default: mockFallbackAsset}));

        const {result, rerender} = renderHook((props: {importFn: () => Promise<{default: IconAsset}>}) => useLazyAsset(props.importFn), {
            initialProps: {importFn: importFn1},
        });

        await waitFor(() => expect(result.current.isLoaded).toBe(true));

        // Changing importFn should trigger a new load cycle
        rerender({importFn: importFn2});
        expect(result.current.isLoading).toBe(true);
        await waitFor(() => expect(result.current.asset).toBe(mockFallbackAsset));
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
        expect(result.current).toHaveProperty('asset');

        // Initially should return PlaceholderIcon while loading
        expect(result.current.asset).toBeDefined();
        expect(typeof result.current.asset).toBe('object');
    });

    it('should handle successful asset loading', async () => {
        const importFn = jest.fn(() => Promise.resolve({default: mockAsset}));

        const {result} = renderHook(() => useMemoizedLazyAsset(importFn));

        // Initially should return PlaceholderIcon while loading
        expect(result.current.asset).toBeDefined();
        expect(result.current.asset).not.toBe(mockAsset);

        // Wait for asset to load
        await waitFor(() => {
            expect(result.current.asset).toBe(mockAsset);
        });

        expect(result.current.asset).toBe(mockAsset);
    });

    it('should handle errors with fallback', async () => {
        const importFn = jest.fn(() => Promise.reject(new Error('Failed')));

        const {result} = renderHook(() => useMemoizedLazyAsset(importFn, mockFallbackAsset));

        // Initially should return PlaceholderIcon while loading
        expect(result.current.asset).toBeDefined();
        expect(result.current.asset).not.toBe(mockFallbackAsset);

        await waitFor(() => {
            expect(result.current.asset).toBe(mockFallbackAsset);
        });

        // Should use fallback on error
        expect(result.current.asset).toBe(mockFallbackAsset);
    });

    it('should handle errors without fallback', async () => {
        const importFn = jest.fn(() => Promise.reject(new Error('Failed')));

        const {result} = renderHook(() => useMemoizedLazyAsset(importFn));

        // Initially should return PlaceholderIcon while loading
        expect(result.current.asset).toBeDefined();

        // Wait a bit to ensure error handling completes
        await waitFor(() => {
            // Without fallback, asset should remain PlaceholderIcon on error
            expect(result.current.asset).toBeDefined();
        });
    });

    it('should handle function reference changes', async () => {
        const importFn1 = jest.fn(() => Promise.resolve({default: mockAsset}));
        const importFn2 = jest.fn(() => Promise.resolve({default: mockFallbackAsset}));

        const {result, rerender} = renderHook((props: {importFn: () => Promise<{default: IconAsset}>}) => useMemoizedLazyAsset(props.importFn), {
            initialProps: {importFn: importFn1},
        });

        // Initially should return PlaceholderIcon while loading
        expect(result.current.asset).toBeDefined();
        expect(result.current.asset).not.toBe(mockAsset);

        // Wait for first asset to load
        await waitFor(() => {
            expect(result.current.asset).toBe(mockAsset);
        });

        // Change to different function
        rerender({importFn: importFn2});

        await waitFor(() => {
            expect(result.current.asset).toBe(mockFallbackAsset);
        });

        expect(result.current.asset).toBe(mockFallbackAsset);
    });

    it('returns PlaceholderIcon while loading', () => {
        // Our Jest mock for PlaceholderIcon exports the component directly (no default)
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const PlaceholderIcon = require('@components/Icon/PlaceholderIcon') as IconAsset;
        const importFn: () => Promise<{default: IconAsset}> = () => new Promise(() => {});
        const {result} = renderHook(() => useMemoizedLazyAsset(importFn));
        expect(result.current.asset).toBe(PlaceholderIcon);
    });
});
