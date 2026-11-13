import {renderHook} from '@testing-library/react-native';

import useModalStackScreenOptions from '@libs/Navigation/AppNavigator/ModalStackNavigators/useModalStackScreenOptions';

import type {StackCardInterpolationProps} from '@react-navigation/stack';

type MockWideRHPState = {
    wideRHPRouteKeys: string[];
    superWideRHPRouteKeys: string[];
    isWideRHPFocused: boolean;
    isSuperWideRHPFocused: boolean;
};

const DEFAULT_SINGLE_RHP_WIDTH = 375;
const DRAGGED_SINGLE_RHP_WIDTH = 520;
const WIDE_ROUTE_KEY = 'wide-route';
const STACKED_SINGLE_ROUTE_KEY = 'stacked-single-route';

const SINGLE_ON_WIDE: MockWideRHPState = {wideRHPRouteKeys: [WIDE_ROUTE_KEY], superWideRHPRouteKeys: [], isWideRHPFocused: false, isSuperWideRHPFocused: false};

let mockWideRHPState = SINGLE_ON_WIDE;
jest.mock('@components/WideRHPContextProvider', () => ({useWideRHPState: () => mockWideRHPState}));

let mockIsResizableRHPEnabled = true;
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: () => mockIsResizableRHPEnabled}));

jest.mock('@hooks/useResponsiveLayout', () => () => ({isSmallScreenWidth: false}));
jest.mock('@hooks/useWindowDimensions', () => () => ({windowWidth: 1600}));
jest.mock('@hooks/useSidePanelState', () => () => ({sidePanelOffset: {current: 0}}));
jest.mock('@libs/Navigation/helpers/getSidePanelRHPShrink', () => () => 0);
jest.mock('@hooks/useSingleRHPWidth', () => () => ({width: DRAGGED_SINGLE_RHP_WIDTH}));
jest.mock('@hooks/useStyleUtils', () => () => ({}));
jest.mock('@hooks/useThemeStyles', () => () => ({
    navigationScreenCardStyle: {},
    overflowVisible: {},
    singleRHPExtendedCardInterpolatorStyles: {width: DEFAULT_SINGLE_RHP_WIDTH},
    resizableSingleRHPExtendedCardInterpolatorStyles: (singleRHPWidth: number) => ({width: singleRHPWidth}),
}));
jest.mock('@libs/Navigation/AppNavigator/useModalCardStyleInterpolator', () => () => () => ({cardStyle: {}}));

function getStackedSingleCardStyle() {
    const {result} = renderHook(() => useModalStackScreenOptions());
    const options = result.current({route: {key: STACKED_SINGLE_ROUTE_KEY, name: 'StackedSingle'}});
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the mocked base interpolator ignores its props
    return options.web?.cardStyleInterpolator?.({} as StackCardInterpolationProps).cardStyle;
}

describe('useModalStackScreenOptions', () => {
    beforeEach(() => {
        mockWideRHPState = SINGLE_ON_WIDE;
        mockIsResizableRHPEnabled = true;
    });

    it('gives a single RHP stacked on a wide RHP its dragged width', () => {
        // Given a focused single RHP opened on top of a wide RHP, after the user dragged it wider
        // When the stacked card's options are built
        const cardStyle = getStackedSingleCardStyle();

        // Then the card is drawn at the dragged width
        expect(cardStyle).toEqual(expect.objectContaining({width: DRAGGED_SINGLE_RHP_WIDTH}));
    });

    it('keeps a closing stacked single RHP at its dragged width', () => {
        // Given the stacked single RHP is sliding out, so focus has already moved to the wide RHP beneath it
        mockWideRHPState = {...SINGLE_ON_WIDE, isWideRHPFocused: true};

        // When the closing card's options are built
        const cardStyle = getStackedSingleCardStyle();

        // Then it keeps the dragged width instead of snapping to the default mid-slide, because the width follows the beta, not focus
        expect(cardStyle).toEqual(expect.objectContaining({width: DRAGGED_SINGLE_RHP_WIDTH}));
    });

    it('keeps the default width for a stacked single RHP without the beta', () => {
        // Given a user outside the resizable RHP beta
        mockIsResizableRHPEnabled = false;

        // When the stacked card's options are built
        const cardStyle = getStackedSingleCardStyle();

        // Then the card stays at the default single RHP width
        expect(cardStyle).toEqual(expect.objectContaining({width: DEFAULT_SINGLE_RHP_WIDTH}));
    });
});
