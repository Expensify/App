import {renderHook} from '@testing-library/react-native';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';

/**
 * Test suite to verify that migrated icons and illustrations
 * display correctly after lazy loading migration.
 * Migrated illustrations tested:
 * - Computer
 * - EmptyCardState
 * - ExpensifyCardImage
 * - LaptopWithSecondScreenAndHourglass
 * - LaptopWithSecondScreenSync
 * - LaptopWithSecondScreenX
 * - RunningTurtle
 * - ExpensifyApprovedLogo
 * - TurtleInShell
 * - MultiScan
 * - Hand
 * - ReceiptUpload
 * - Shutter
 */
describe('Lazy Icons and Illustrations Migration', () => {
    describe('Loading Multiple Assets', () => {
        it('should load all migrated illustrations via useMemoizedLazyIllustrations', () => {
            // Load multiple illustrations at once
            // The chunk is loaded once and all assets are available
            const {result} = renderHook(() =>
                useMemoizedLazyIllustrations([
                    'Computer',
                    'EmptyCardState',
                    'ExpensifyCardImage',
                    'LaptopWithSecondScreenAndHourglass',
                    'LaptopWithSecondScreenSync',
                    'LaptopWithSecondScreenX',
                    'RunningTurtle',
                    'ExpensifyApprovedLogo',
                    'TurtleInShell',
                    'MultiScan',
                    'Hand',
                    'ReceiptUpload',
                    'Shutter',
                ]),
            );

            // Verify all illustrations are loaded
            expect(result.current.Computer).toBeDefined();
            expect(result.current.EmptyCardState).toBeDefined();
            expect(result.current.ExpensifyCardImage).toBeDefined();
            expect(result.current.LaptopWithSecondScreenAndHourglass).toBeDefined();
            expect(result.current.LaptopWithSecondScreenSync).toBeDefined();
            expect(result.current.LaptopWithSecondScreenX).toBeDefined();
            expect(result.current.RunningTurtle).toBeDefined();
            expect(result.current.ExpensifyApprovedLogo).toBeDefined();
            expect(result.current.TurtleInShell).toBeDefined();
            expect(result.current.MultiScan).toBeDefined();
            expect(result.current.Hand).toBeDefined();
            expect(result.current.ReceiptUpload).toBeDefined();
            expect(result.current.Shutter).toBeDefined();
        });

        it('should load ExpensifyCardImage illustration', () => {
            // Test ExpensifyCardImage specifically as it's used in CardUtils
            const {result} = renderHook(() => useMemoizedLazyIllustrations(['ExpensifyCardImage']));

            // Verify the lazy-loaded icon is defined
            expect(result.current.ExpensifyCardImage).toBeDefined();
        });

        it('should load ReceiptUpload illustration', () => {
            // Test ReceiptUpload as it's used in BaseOnboardingPurpose
            const {result} = renderHook(() => useMemoizedLazyIllustrations(['ReceiptUpload']));

            expect(result.current.ReceiptUpload).toBeDefined();
        });

        it('should load IOURequestStepScan illustrations (Hand, MultiScan, Shutter)', () => {
            // Test illustrations used in IOURequestStepScan components
            const {result} = renderHook(() => useMemoizedLazyIllustrations(['Hand', 'MultiScan', 'Shutter']));

            expect(result.current.Hand).toBeDefined();
            expect(result.current.MultiScan).toBeDefined();
            expect(result.current.Shutter).toBeDefined();
        });

        it('should load EmptyCardState illustration', () => {
            // Test EmptyCardState used in EmptyCardView
            const {result} = renderHook(() => useMemoizedLazyIllustrations(['EmptyCardState']));

            expect(result.current.EmptyCardState).toBeDefined();
        });

        it('should load LaptopWithSecondScreen illustrations', () => {
            // Test LaptopWithSecondScreen variants used in ReportDetailsExportPage
            const {result} = renderHook(() => useMemoizedLazyIllustrations(['LaptopWithSecondScreenAndHourglass', 'LaptopWithSecondScreenSync', 'LaptopWithSecondScreenX']));

            expect(result.current.LaptopWithSecondScreenAndHourglass).toBeDefined();
            expect(result.current.LaptopWithSecondScreenSync).toBeDefined();
            expect(result.current.LaptopWithSecondScreenX).toBeDefined();
        });

        it('should load RunningTurtle and TurtleInShell illustrations', () => {
            // Test turtle illustrations used in MergeResultPage and ApproverSelectionList
            const {result} = renderHook(() => useMemoizedLazyIllustrations(['RunningTurtle', 'TurtleInShell']));

            expect(result.current.RunningTurtle).toBeDefined();
            expect(result.current.TurtleInShell).toBeDefined();
        });

        it('should load ExpensifyApprovedLogo illustration', () => {
            // Test ExpensifyApprovedLogo
            const {result} = renderHook(() => useMemoizedLazyIllustrations(['ExpensifyApprovedLogo']));

            expect(result.current.ExpensifyApprovedLogo).toBeDefined();
        });

        it('should load Computer illustration', () => {
            // Test Computer illustration
            const {result} = renderHook(() => useMemoizedLazyIllustrations(['Computer']));

            expect(result.current.Computer).toBeDefined();
        });
    });

    describe('Illustration Loading Behavior', () => {
        it('should handle loading multiple illustrations in a single hook call', () => {
            // Load multiple illustrations at once
            // The chunk is loaded once and all assets are available
            const {result} = renderHook(() => useMemoizedLazyIllustrations(['ExpensifyCardImage', 'EmptyCardState', 'ReceiptUpload']));

            expect(result.current.ExpensifyCardImage).toBeDefined();
            expect(result.current.EmptyCardState).toBeDefined();
            expect(result.current.ReceiptUpload).toBeDefined();
        });

        it('should return valid IconAsset components that can be used in Icon src prop', () => {
            // Verify that loaded illustrations are valid IconAsset components
            const {result} = renderHook(() => useMemoizedLazyIllustrations(['ExpensifyCardImage', 'Hand', 'MultiScan']));

            // All illustrations should be defined (valid React components)
            expect(result.current.ExpensifyCardImage).toBeDefined();
            expect(result.current.Hand).toBeDefined();
            expect(result.current.MultiScan).toBeDefined();
        });
    });
});
