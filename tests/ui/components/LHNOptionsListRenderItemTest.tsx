import {NavigationContainer} from '@react-navigation/native';
import type * as ReactNavigation from '@react-navigation/native';
import type {ListRenderItem} from '@shopify/flash-list';
import {act, render, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import LHNOptionsList from '@components/LHNOptionsList/LHNOptionsList';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import {getFakeReport} from '../../utils/LHNTestUtils';

type RenderItemWithMaybeItem = (info: {item?: Report; index: number}) => React.ReactElement | null;

// Replace FlashList so the renderItem callback can be invoked directly with an undefined item — the
// transient slot FlashList hands the callback while the list shrinks. Going through the real list
// would crash earlier in keyExtractor, which is not the path the guard protects.
let capturedRenderItem: RenderItemWithMaybeItem | undefined;
jest.mock('@shopify/flash-list', () => ({
    __esModule: true,
    FlashList: (props: {renderItem: ListRenderItem<Report>}) => {
        capturedRenderItem = props.renderItem as RenderItemWithMaybeItem;
        return null;
    },
}));

// Mock dynamic imports that break without --experimental-vm-modules
jest.mock('@src/languages/IntlStore', () => ({
    __esModule: true,
    default: {
        getCurrentLocale: () => 'en',
        load: () => Promise.resolve(),
        get: () => null,
    },
}));
jest.mock('@assets/emojis', () => ({
    importEmojiLocale: jest.fn(() => Promise.resolve()),
    getEmojiCodeWithSkinColor: jest.fn(),
}));
jest.mock('@libs/EmojiTrie', () => ({
    buildEmojisTrie: jest.fn(),
}));
jest.mock('@src/hooks/useRootNavigationState');
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: () => false,
        useRoute: jest.fn(),
        useNavigationState: jest.fn(),
        createNavigationContainerRef: () => ({
            getState: () => jest.fn(),
        }),
    };
});

describe('LHNOptionsList renderItem guard', () => {
    beforeEach(() => {
        act(() => {
            Onyx.init({keys: ONYXKEYS});
        });
        capturedRenderItem = undefined;
        jest.clearAllMocks();
    });

    afterEach(() => {
        return act(async () => {
            await Onyx.clear();
        });
    });

    it('should render null instead of crashing when the list yields an undefined item', async () => {
        // Given the list is rendered and FlashList captures the renderItem callback
        render(
            <NavigationContainer>
                <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                    <LHNOptionsList
                        data={[getFakeReport([1, 2], 0, false)]}
                        onSelectRow={jest.fn()}
                        optionMode={CONST.OPTION_MODE.DEFAULT}
                        onFirstItemRendered={jest.fn()}
                    />
                </ComposeProviders>
            </NavigationContainer>,
        );

        // When FlashList hands the callback an undefined item for a now out-of-range slot
        // Then the callback returns null for that slot instead of reading item.reportID and crashing
        await waitFor(() => {
            expect(capturedRenderItem).toBeDefined();
        });
        expect(capturedRenderItem?.({item: undefined, index: 0})).toBeNull();
    });
});
