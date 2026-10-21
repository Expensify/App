import {act, renderHook} from '@testing-library/react-native';

import useSingleRHPWidth from '@hooks/useSingleRHPWidth';

import {setSingleRHPWidth} from '@libs/actions/SingleRHPWidth';
import getSingleRHPWidthBounds from '@libs/Navigation/helpers/singleRHPWidth/getSingleRHPWidthBounds';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// jest-expo resolves bare specifiers to index.native.ts, where the wide RHP has no width, so the web module is loaded explicitly.
jest.mock('@libs/Navigation/helpers/calculateReceiptPaneRHPWidth', () =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    jest.requireActual('@libs/Navigation/helpers/calculateReceiptPaneRHPWidth/index.ts'),
);

const WIDE_WINDOW_WIDTH = 1920;
const NARROW_WINDOW_WIDTH = 1100;

let mockWindowWidth = WIDE_WINDOW_WIDTH;
jest.mock('@hooks/useWindowDimensions', () => () => ({windowWidth: mockWindowWidth}));
jest.mock('@hooks/useResponsiveLayout', () => () => ({isExtraLargeScreenWidth: false}));
jest.mock('@hooks/useSidePanelState', () => () => ({shouldHideSidePanel: true}));

describe('useSingleRHPWidth', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockWindowWidth = WIDE_WINDOW_WIDTH;
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('starts at the default width before anything is saved', async () => {
        // Given a user who never dragged the single RHP
        // When its width is read
        const {result} = renderHook(() => useSingleRHPWidth());
        await waitForBatchedUpdates();

        // Then it is the default RHP width, so the beta changes nothing until a drag
        expect(result.current.width).toBe(variables.rhpWidth);
    });

    it('follows the saved width once a drag ends', async () => {
        // Given the single RHP on screen at its default width
        const {result} = renderHook(() => useSingleRHPWidth());
        await waitForBatchedUpdates();

        // When a drag saves a wider width
        await act(async () => {
            setSingleRHPWidth(700);
            await waitForBatchedUpdates();
        });

        // Then the committed width is the saved one, which every style falls back to once the live CSS width is dropped
        expect(result.current.width).toBe(700);
    });

    it('fits a saved width into a narrower window and restores it when the window grows back', async () => {
        // Given a saved width that only fits the wide window
        const savedWidth = getSingleRHPWidthBounds(WIDE_WINDOW_WIDTH, 0).max;
        const narrowMax = getSingleRHPWidthBounds(NARROW_WINDOW_WIDTH, 0).max;
        expect(narrowMax).toBeLessThan(savedWidth);
        await Onyx.set(ONYXKEYS.SINGLE_RHP_WIDTH, savedWidth);
        const {result, rerender} = renderHook(() => useSingleRHPWidth());
        await waitForBatchedUpdates();

        // When the window shrinks
        mockWindowWidth = NARROW_WINDOW_WIDTH;
        rerender({});

        // Then the card shrinks to the widest it can be there
        expect(result.current.width).toBe(narrowMax);

        // When the window grows back
        mockWindowWidth = WIDE_WINDOW_WIDTH;
        rerender({});

        // Then the card returns to the width the user dragged to, because the clamp never overwrote what was saved
        expect(result.current.width).toBe(savedWidth);
    });
});
