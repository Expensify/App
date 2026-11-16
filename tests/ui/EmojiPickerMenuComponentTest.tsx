import {act, cleanup, fireEvent, render, screen} from '@testing-library/react-native';

import emojis, {importEmojiLocale} from '@assets/emojis';
import type {Emoji} from '@assets/emojis/types';

import ComposeProviders from '@components/ComposeProviders';
import type * as WebEmojiMenuModule from '@components/EmojiPicker/EmojiPickerMenu/index';
import type * as NativeEmojiMenuModule from '@components/EmojiPicker/EmojiPickerMenu/index.native';
import type EmojiPickerMenuProps from '@components/EmojiPicker/EmojiPickerMenu/types';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {buildEmojisTrie} from '@libs/EmojiTrie';
import {getHeaderEmojis, mergeEmojisWithFrequentlyUsedEmojis, processFrequentlyUsedEmojis} from '@libs/EmojiUtils';
import type {EmojiPickerListItem} from '@libs/EmojiUtils';

import CONST from '@src/CONST';
import en from '@src/languages/en';
import ONYXKEYS from '@src/ONYXKEYS';

import type {FlashListProps, FlashListRef, RenderTarget} from '@shopify/flash-list';
import type {ComponentRef} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import type ReactNative from 'react-native';
import type * as KeyCommand from 'react-native-key-command';

import {PortalProvider} from '@gorhom/portal';
import React from 'react';
import {AccessibilityInfo, View} from 'react-native';
import Onyx from 'react-native-onyx';

import type * as CreateMockModule from '../utils/createMock';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockKeyRegistrations: Array<{key: Parameters<typeof KeyCommand.addListener>[0]; callback: Parameters<typeof KeyCommand.addListener>[1]}> = [];

// Keep real command registrations and subscribers. Native delivery carries the registered trigger, not the DOM key name.
jest.mock('react-native-key-command', () => {
    const addListener: typeof KeyCommand.addListener = (key, callback) => {
        const registration = {key, callback};
        mockKeyRegistrations.push(registration);
        return () => {
            const index = mockKeyRegistrations.indexOf(registration);
            if (index >= 0) {
                mockKeyRegistrations.splice(index, 1);
            }
        };
    };
    return {constants: {}, addListener, registerKeyCommands: () => {}, unregisterKeyCommands: () => {}};
});

const mockScrollToOffset = jest.fn<void, Parameters<FlashListRef<EmojiPickerListItem>['scrollToOffset']>>();
let mockEmojiListProps: FlashListProps<EmojiPickerListItem>;
let mockHiddenHeaders = new Set<string>();
let mockRenderTarget: RenderTarget = 'Cell';
let mockVisibleEmojiCode = '👋';
let refreshEmojiWindow: (() => void) | undefined;
const mockHeaderLabels = en.emojiPicker.headers;
let mockSelectedHeaderGeneration = 0;
const mockFocusDescriptors: Array<{host: ComponentRef<typeof View>; descriptor: PropertyDescriptor | undefined}> = [];
const originalFocusDescriptor = Object.getOwnPropertyDescriptor(View.prototype, 'focus');

// The window is controlled below FlashList so both real menus keep their own data, rendering and focus behavior.
jest.mock('@shopify/flash-list', () => {
    const ReactLocal = jest.requireActual<typeof React>('react');
    const RN = jest.requireActual<typeof ReactNative>('react-native');
    const createMockLocal = jest.requireActual<typeof CreateMockModule>('../utils/createMock').default;
    const FlashList = ReactLocal.forwardRef<FlashListRef<EmojiPickerListItem>, FlashListProps<EmojiPickerListItem>>((props, ref) => {
        const [, setWindowRevision] = ReactLocal.useState(0);
        refreshEmojiWindow = () => setWindowRevision((revision) => revision + 1);
        mockEmojiListProps = props;
        const data = props.data;
        const renderItem = props.renderItem;
        expect(data).toBeDefined();
        expect(renderItem).toBeDefined();
        if (!data || !renderItem) {
            throw new Error('Expected actual emoji list data and renderer');
        }
        ReactLocal.useImperativeHandle(ref, () => createMockLocal<FlashListRef<EmojiPickerListItem>>({scrollToOffset: mockScrollToOffset}));
        return (
            <RN.View testID="emoji-list-boundary">
                {data.map((item, index) => {
                    if ('header' in item ? mockHiddenHeaders.has(item.code) : item.code !== mockVisibleEmojiCode && index !== 0 && !('spacer' in item)) {
                        return null;
                    }
                    return (
                        <RN.View
                            key={`${'header' in item ? item.code : data.slice(0, index).findLast((entry) => 'header' in entry)?.code}-${item.code}-${'header' in item && item.code === 'animalsAndNature' ? mockSelectedHeaderGeneration : 0}`}
                            testID={`emoji-row-${index}`}
                        >
                            {renderItem({item, index, target: mockRenderTarget})}
                        </RN.View>
                    );
                })}
            </RN.View>
        );
    });
    return {FlashList};
});

const WebEmojiPickerMenu = jest.requireActual<typeof WebEmojiMenuModule>('../../src/components/EmojiPicker/EmojiPickerMenu/index.tsx').default;
const NativeEmojiPickerMenu = jest.requireActual<typeof NativeEmojiMenuModule>('../../src/components/EmojiPicker/EmojiPickerMenu/index.native.tsx').default;
const platformCases = [
    {platform: 'web', Menu: WebEmojiPickerMenu},
    {platform: 'native', Menu: NativeEmojiPickerMenu},
];
const wave = emojis.find((item): item is Emoji => 'name' in item && item.name === 'wave');
const smile = emojis.find((item): item is Emoji => 'name' in item && item.name === 'smile');
const headerLayout = createMock<LayoutChangeEvent>({nativeEvent: {layout: {x: 0, y: 0, width: 100, height: 20}}});

function renderEmojiMenu(Menu: typeof WebEmojiPickerMenu, onEmojiSelected: EmojiPickerMenuProps['onEmojiSelected']) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <Menu onEmojiSelected={onEmojiSelected} />
            </PortalProvider>
        </ComposeProviders>,
    );
}

// The renderer erases instance. Constructor identity narrows only that actual host, without relabeling its props.
function getEmojiHeaderHost(index: number, platform: string) {
    const item = mockEmojiListProps.data?.at(index);
    expect(item).toBeDefined();
    if (!item || !('header' in item)) {
        throw new Error('Expected a real emoji header item');
    }
    const heading = screen.getByTestId(`emoji-row-${index}`).find((node) => node.type === View && (node.props.role === CONST.ROLE.HEADING || node.props.accessibilityRole === 'header'));
    if (platform === 'native') {
        expect(heading.props.accessibilityRole).toBe('header');
        expect(heading.props.accessibilityLabel).toBe(mockHeaderLabels[item.code]);
    } else {
        expect(heading.props.role).toBe(CONST.ROLE.HEADING);
        expect(heading.props.tabIndex).toBe(-1);
        expect(heading.findAll((node) => node.props.children === mockHeaderLabels[item.code]).length).toBeGreaterThan(0);
    }
    const instance: unknown = heading.instance;
    expect(instance).toBeInstanceOf(View);
    if (!(instance instanceof View)) {
        throw new Error('Expected the rendered native View instance');
    }
    return {heading, host: instance};
}

beforeAll(async () => {
    await importEmojiLocale(CONST.LOCALES.EN);
    buildEmojisTrie(CONST.LOCALES.EN);
});

describe.each(platformCases)('actual $platform EmojiPickerMenu', ({platform, Menu}) => {
    beforeEach(async () => {
        jest.useFakeTimers();
        Onyx.init({keys: ONYXKEYS});
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await Onyx.set(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE, 1);
            await Onyx.set(ONYXKEYS.FREQUENTLY_USED_EMOJIS, []);
        });
        await waitForBatchedUpdatesWithAct();
        mockHiddenHeaders = new Set();
        mockRenderTarget = 'Cell';
        mockVisibleEmojiCode = '👋';
        mockScrollToOffset.mockClear();
        mockSelectedHeaderGeneration = 0;
        refreshEmojiWindow = undefined;
    });

    afterEach(() => {
        cleanup();
        for (const {host, descriptor} of mockFocusDescriptors) {
            if (descriptor) {
                Object.defineProperty(host, 'focus', descriptor);
            } else {
                expect(Reflect.deleteProperty(host, 'focus')).toBe(true);
            }
            expect(Object.getOwnPropertyDescriptor(host, 'focus')).toEqual(descriptor);
        }
        mockFocusDescriptors.length = 0;
        expect(Object.getOwnPropertyDescriptor(View.prototype, 'focus')).toEqual(originalFocusDescriptor);
        refreshEmojiWindow = undefined;
        jest.clearAllTimers();
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it.each(['Cell', 'StickyHeader'] satisfies RenderTarget[])('renders every catalog header and no spacers as %s', async (target) => {
        // Given the canonical catalog without recent history, every non-recent category must be reachable.
        mockRenderTarget = target;
        const onEmojiSelected = jest.fn<void, Parameters<EmojiPickerMenuProps['onEmojiSelected']>>();
        renderEmojiMenu(Menu, onEmojiSelected);
        await waitForBatchedUpdatesWithAct();
        const data = mockEmojiListProps.data;
        expect(data).toBeDefined();
        if (!data || !mockEmojiListProps.renderItem) {
            throw new Error('Expected real FlashList data and renderer');
        }
        if (platform === 'native') {
            expect(mockEmojiListProps.extraData).toEqual([data, 1]);
        }
        const headers = getHeaderEmojis([...data]);
        expect(headers).toHaveLength(8);
        expect(headers.map(({code}) => code)).toEqual(emojis.flatMap((item) => ('header' in item ? [item.code] : [])));

        // When FlashList renders real menu items, header text must use the owner's catalog key.
        for (const {index} of headers) {
            const item = data.at(index);
            expect(item).toBeDefined();
            if (!item || !('header' in item)) {
                throw new Error('Expected a catalog header');
            }
            const row = screen.getByTestId(`emoji-row-${index}`);
            const header = row.find((node) => node.type === View && (node.props.role === CONST.ROLE.HEADING || node.props.accessibilityRole === 'header'));
            expect(screen.getAllByText(mockHeaderLabels[item.code]).length).toBeGreaterThan(0);
            // Then each platform retains its own accessibility contract instead of borrowing the other renderer.
            if (platform === 'native') {
                expect(header.props.accessibilityRole).toBe('header');
                expect(header.props.accessibilityLabel).toBe(mockHeaderLabels[item.code]);
            } else {
                expect(header.props.role).toBe(CONST.ROLE.HEADING);
                expect(header.props.tabIndex).toBe(-1);
            }
        }
        expect(screen.queryByText(en.emojiPicker.headers.frequentlyUsed)).toBeNull();
        const spacers = data.flatMap((item, index) => ('spacer' in item ? [{item, index}] : []));
        expect(spacers.length).toBeGreaterThan(0);
        for (const {item, index} of spacers) {
            expect(mockEmojiListProps.renderItem({item, index, target})).toBeNull();
        }
        expect(mockEmojiListProps.stickyHeaderIndices).toEqual(headers.map(({index}) => index));
        expect(onEmojiSelected).not.toHaveBeenCalled();
    });

    it('restores recent data and exact sticky indices after real search', async () => {
        // Given one persisted catalog emoji, recent history changes the renderer's section positions.
        expect(smile).toBeDefined();
        if (!smile) {
            throw new Error('Expected smile in the production catalog');
        }
        const recent = [{code: smile.code, name: smile.name, count: 1, lastUpdatedAt: 1}];
        await act(async () => {
            await Onyx.set(ONYXKEYS.FREQUENTLY_USED_EMOJIS, recent);
        });
        await waitForBatchedUpdatesWithAct();
        renderEmojiMenu(Menu, jest.fn<void, Parameters<EmojiPickerMenuProps['onEmojiSelected']>>());
        await waitForBatchedUpdatesWithAct();
        const initialData = mergeEmojisWithFrequentlyUsedEmojis(emojis, processFrequentlyUsedEmojis(recent));
        const initialIndices = getHeaderEmojis(initialData).map(({index}) => index);
        expect(mockEmojiListProps.data).toEqual(initialData);
        expect(getHeaderEmojis(initialData)).toHaveLength(9);
        expect(screen.getByText(en.emojiPicker.headers.frequentlyUsed)).toBeOnTheScreen();

        // When a real search is entered, neither header rows nor sticky indices belong in the results.
        fireEvent.changeText(screen.getByPlaceholderText(en.common.search), 'smile');
        await act(async () => jest.advanceTimersByTime(350));
        expect(mockEmojiListProps.data?.length).toBeGreaterThan(0);
        expect(mockEmojiListProps.data?.some((item) => 'name' in item && item.name === smile.name)).toBe(true);
        expect(mockEmojiListProps.data?.some((item) => 'header' in item)).toBe(false);
        expect(mockEmojiListProps.stickyHeaderIndices).toEqual([]);
        expect(screen.queryByRole('button', {name: en.emojiPicker.headers.smileysAndEmotion})).toBeNull();
        fireEvent.changeText(screen.getByPlaceholderText(en.common.search), '');
        await act(async () => jest.advanceTimersByTime(350));

        // Then clearing search restores the full producer output and scroll origin, including the recent section.
        expect(mockEmojiListProps.data).toEqual(initialData);
        expect(mockEmojiListProps.stickyHeaderIndices).toEqual(initialIndices);
        expect(screen.getByText(en.emojiPicker.headers.frequentlyUsed)).toBeOnTheScreen();
        expect(mockScrollToOffset).toHaveBeenLastCalledWith({offset: 0, animated: false});
    });

    it.each([
        {name: 'wave', preference: 1},
        {name: 'wave', preference: -1},
        {name: 'smile', preference: 1},
    ])('emits the real $name item with preference $preference', async ({name, preference}) => {
        // Given catalog data and a persisted preference, the renderer owns selection of the emitted variant.
        const emoji = name === 'wave' ? wave : smile;
        expect(emoji).toBeDefined();
        if (!emoji) {
            throw new Error('Expected the selection fixture in the catalog');
        }
        mockVisibleEmojiCode = emoji.code;
        await act(async () => {
            await Onyx.set(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE, preference);
        });
        await waitForBatchedUpdatesWithAct();
        const onEmojiSelected = jest.fn<void, Parameters<EmojiPickerMenuProps['onEmojiSelected']>>();
        renderEmojiMenu(Menu, onEmojiSelected);
        await waitForBatchedUpdatesWithAct();
        const expectedCode = preference !== -1 ? (emoji.types?.at(preference) ?? emoji.code) : emoji.code;

        // When the actual menu item is pressed, the callback must receive the rendered item and selected code once.
        fireEvent.press(screen.getByText(expectedCode));

        // Then a dropped, duplicated or incorrectly indexed selection fails independently of header rendering.
        expect(onEmojiSelected).toHaveBeenCalledTimes(1);
        expect(onEmojiSelected).toHaveBeenCalledWith(expectedCode, emoji, preference);
    });

    it.each(['layout', 'timer'])('focuses only the remounted selected header through %s', async (path) => {
        // Given an absent category and an independent mounted host, retries must wait for the chosen header.
        mockHiddenHeaders.add('animalsAndNature');
        const delivery = jest.spyOn(AccessibilityInfo, 'sendAccessibilityEvent').mockImplementation(() => {});
        delivery.mockClear();
        renderEmojiMenu(Menu, jest.fn<void, Parameters<EmojiPickerMenuProps['onEmojiSelected']>>());
        await waitForBatchedUpdatesWithAct();
        const natureIndex = mockEmojiListProps.data?.findIndex((item) => 'header' in item && item.code === 'animalsAndNature');
        expect(natureIndex).toBeGreaterThan(0);
        if (natureIndex === undefined || natureIndex < 0) {
            throw new Error('Expected the actual nature header index');
        }
        const {host: unrelatedHost} = getEmojiHeaderHost(0, platform);
        const unrelatedFocus = jest.fn<ReturnType<typeof unrelatedHost.focus>, Parameters<typeof unrelatedHost.focus>>();
        mockFocusDescriptors.push({host: unrelatedHost, descriptor: Object.getOwnPropertyDescriptor(unrelatedHost, 'focus')});
        unrelatedHost.focus = unrelatedFocus;
        expect(screen.queryByTestId(`emoji-row-${natureIndex}`)).toBeNull();
        fireEvent.press(screen.getByRole('button', {name: en.emojiPicker.headers.animalsAndNature}));
        if (platform === 'web') {
            act(() => jest.advanceTimersByTime(CONST.ANIMATED_TRANSITION));
        }
        expect(delivery).not.toHaveBeenCalled();
        expect(unrelatedFocus).not.toHaveBeenCalled();
        expect(mockScrollToOffset).toHaveBeenCalledWith({offset: Math.floor(natureIndex / CONST.EMOJI_NUM_PER_ROW) * CONST.EMOJI_PICKER_HEADER_HEIGHT, animated: true});

        // When only the chosen delivery lane runs, removing layout or the delayed retry leaves its own oracle unsatisfied.
        mockHiddenHeaders.delete('animalsAndNature');
        expect(refreshEmojiWindow).toBeDefined();
        act(() => refreshEmojiWindow?.());
        const {heading, host} = getEmojiHeaderHost(natureIndex, platform);
        const focus = jest.fn<ReturnType<typeof host.focus>, Parameters<typeof host.focus>>();
        mockFocusDescriptors.push({host, descriptor: Object.getOwnPropertyDescriptor(host, 'focus')});
        host.focus = focus;
        expect(focus).not.toBe(unrelatedFocus);
        expect(getEmojiHeaderHost(0, platform).host).toBe(unrelatedHost);
        if (path === 'layout') {
            fireEvent(heading, 'layout', headerLayout);
        } else {
            act(() => jest.advanceTimersByTime(CONST.ANIMATED_TRANSITION));
        }

        // Then only the actual selected host receives one delivery, with its normal method receiver.
        if (platform === 'native') {
            expect(delivery).toHaveBeenCalledTimes(1);
            expect(delivery).toHaveBeenCalledWith(host, 'focus');
        } else {
            expect(focus).toHaveBeenCalledTimes(1);
            expect(focus.mock.contexts.at(0)).toBe(host);
        }
        act(() => jest.advanceTimersByTime(CONST.ANIMATED_TRANSITION * 3));
        if (platform === 'native') {
            expect(delivery).toHaveBeenCalledTimes(1);
        } else {
            expect(focus).toHaveBeenCalledTimes(1);
        }
        expect(unrelatedFocus).not.toHaveBeenCalled();
        expect(delivery).not.toHaveBeenCalledWith(unrelatedHost, 'focus');
    });

    it('exhausts absent-header retries without later stale delivery', async () => {
        // Given an absent category, another mounted header must never become its substitute.
        mockHiddenHeaders.add('animalsAndNature');
        const delivery = jest.spyOn(AccessibilityInfo, 'sendAccessibilityEvent').mockImplementation(() => {});
        delivery.mockClear();
        renderEmojiMenu(Menu, jest.fn<void, Parameters<EmojiPickerMenuProps['onEmojiSelected']>>());
        await waitForBatchedUpdatesWithAct();
        const natureIndex = mockEmojiListProps.data?.findIndex((item) => 'header' in item && item.code === 'animalsAndNature');
        expect(natureIndex).toBeGreaterThan(0);
        if (natureIndex === undefined || natureIndex < 0) {
            throw new Error('Expected the nature header');
        }
        const {host: unrelatedHost} = getEmojiHeaderHost(0, platform);
        const unrelatedFocus = jest.fn<ReturnType<typeof unrelatedHost.focus>, Parameters<typeof unrelatedHost.focus>>();
        mockFocusDescriptors.push({host: unrelatedHost, descriptor: Object.getOwnPropertyDescriptor(unrelatedHost, 'focus')});
        unrelatedHost.focus = unrelatedFocus;
        const schedule = jest.spyOn(globalThis, 'setTimeout');

        // When every bounded attempt finds no host, scheduling stops before it returns.
        fireEvent.press(screen.getByRole('button', {name: en.emojiPicker.headers.animalsAndNature}));
        act(() => jest.advanceTimersByTime(CONST.ANIMATED_TRANSITION * 4));
        expect(schedule.mock.calls.filter(([, delay]) => delay === CONST.ANIMATED_TRANSITION)).toHaveLength(platform === 'web' ? 3 : 2);
        expect(screen.queryByTestId(`emoji-row-${natureIndex}`)).toBeNull();
        expect(delivery).not.toHaveBeenCalled();
        expect(unrelatedFocus).not.toHaveBeenCalled();
        schedule.mockClear();
        mockHiddenHeaders.delete('animalsAndNature');
        expect(refreshEmojiWindow).toBeDefined();
        act(() => refreshEmojiWindow?.());
        const {host} = getEmojiHeaderHost(natureIndex, platform);
        const focus = jest.fn<ReturnType<typeof host.focus>, Parameters<typeof host.focus>>();
        mockFocusDescriptors.push({host, descriptor: Object.getOwnPropertyDescriptor(host, 'focus')});
        host.focus = focus;
        act(() => jest.advanceTimersByTime(CONST.ANIMATED_TRANSITION * 4));

        // Then a later host receives no stale delivery and the retry count remains bounded.
        expect(schedule.mock.calls.filter(([, delay]) => delay === CONST.ANIMATED_TRANSITION)).toHaveLength(0);
        expect(focus).not.toHaveBeenCalled();
        expect(delivery).not.toHaveBeenCalled();
        expect(unrelatedFocus).not.toHaveBeenCalled();
    });

    it('cancels stale category delivery when another category is selected', async () => {
        // Given an absent selected category, its queued retry must lose authority on a category switch.
        mockHiddenHeaders.add('animalsAndNature');
        const delivery = jest.spyOn(AccessibilityInfo, 'sendAccessibilityEvent').mockImplementation(() => {});
        delivery.mockClear();
        renderEmojiMenu(Menu, jest.fn<void, Parameters<EmojiPickerMenuProps['onEmojiSelected']>>());
        await waitForBatchedUpdatesWithAct();
        const natureIndex = mockEmojiListProps.data?.findIndex((item) => 'header' in item && item.code === 'animalsAndNature');
        const foodIndex = mockEmojiListProps.data?.findIndex((item) => 'header' in item && item.code === 'foodAndDrink');
        expect(natureIndex).toBeGreaterThan(0);
        expect(foodIndex).toBeGreaterThan(0);
        if (natureIndex === undefined || foodIndex === undefined || natureIndex < 0 || foodIndex < 0) {
            throw new Error('Expected both real category indices');
        }
        const {host: foodHost} = getEmojiHeaderHost(foodIndex, platform);
        const foodFocus = jest.fn<ReturnType<typeof foodHost.focus>, Parameters<typeof foodHost.focus>>();
        mockFocusDescriptors.push({host: foodHost, descriptor: Object.getOwnPropertyDescriptor(foodHost, 'focus')});
        foodHost.focus = foodFocus;
        fireEvent.press(screen.getByRole('button', {name: en.emojiPicker.headers.animalsAndNature}));
        if (platform === 'web') {
            act(() => jest.advanceTimersByTime(CONST.ANIMATED_TRANSITION));
        }

        // When the real food shortcut becomes current, remounting the stale header cannot restore its earlier request.
        fireEvent.press(screen.getByRole('button', {name: en.emojiPicker.headers.foodAndDrink}));
        mockHiddenHeaders.delete('animalsAndNature');
        expect(refreshEmojiWindow).toBeDefined();
        act(() => refreshEmojiWindow?.());
        const {host: staleHost} = getEmojiHeaderHost(natureIndex, platform);
        const staleFocus = jest.fn<ReturnType<typeof staleHost.focus>, Parameters<typeof staleHost.focus>>();
        mockFocusDescriptors.push({host: staleHost, descriptor: Object.getOwnPropertyDescriptor(staleHost, 'focus')});
        staleHost.focus = staleFocus;
        act(() => jest.advanceTimersByTime(CONST.ANIMATED_TRANSITION * 4));

        // Then only the current category receives one delivery and the old ref remains unused.
        expect(staleFocus).not.toHaveBeenCalled();
        if (platform === 'native') {
            expect(delivery).toHaveBeenCalledTimes(1);
            expect(delivery).toHaveBeenCalledWith(foodHost, 'focus');
            expect(delivery).not.toHaveBeenCalledWith(staleHost, 'focus');
        } else {
            expect(foodFocus).toHaveBeenCalledTimes(1);
            expect(foodFocus.mock.contexts.at(0)).toBe(foodHost);
        }
    });

    if (platform === 'native') {
        it('retries the current remounted category at native momentum end', async () => {
            // Given a native category outside the window, momentum end must use its newly attached ref.
            mockHiddenHeaders.add('animalsAndNature');
            const delivery = jest.spyOn(AccessibilityInfo, 'sendAccessibilityEvent').mockImplementation(() => {});
            delivery.mockClear();
            renderEmojiMenu(Menu, jest.fn<void, Parameters<EmojiPickerMenuProps['onEmojiSelected']>>());
            await waitForBatchedUpdatesWithAct();
            const natureIndex = mockEmojiListProps.data?.findIndex((item) => 'header' in item && item.code === 'animalsAndNature');
            expect(natureIndex).toBeGreaterThan(0);
            if (natureIndex === undefined || natureIndex < 0) {
                throw new Error('Expected the native nature header');
            }
            const {host: unrelatedHost} = getEmojiHeaderHost(0, platform);
            fireEvent.press(screen.getByRole('button', {name: en.emojiPicker.headers.animalsAndNature}));
            expect(delivery).not.toHaveBeenCalled();
            mockHiddenHeaders.delete('animalsAndNature');
            expect(refreshEmojiWindow).toBeDefined();
            act(() => refreshEmojiWindow?.());
            const {host} = getEmojiHeaderHost(natureIndex, platform);
            const momentumEnd = mockEmojiListProps.onMomentumScrollEnd;
            expect(momentumEnd).toBeDefined();
            if (!momentumEnd) {
                throw new Error('Expected the actual native momentum handler');
            }

            // When the real momentum callback runs before its retry, the selected host receives accessibility focus.
            act(() => momentumEnd(createMock<Parameters<typeof momentumEnd>[0]>({})));

            // Then one delivery and no duplicate distinguish momentum handling from the timer lane.
            expect(delivery).toHaveBeenCalledTimes(1);
            expect(delivery).toHaveBeenCalledWith(host, 'focus');
            expect(delivery).not.toHaveBeenCalledWith(unrelatedHost, 'focus');
            act(() => jest.advanceTimersByTime(CONST.ANIMATED_TRANSITION * 3));
            expect(delivery).toHaveBeenCalledTimes(1);
        });
    }
});

describe('actual web keyboard and header focus', () => {
    beforeEach(async () => {
        jest.useFakeTimers();
        await act(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            await Onyx.set(ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE, -1);
            await Onyx.set(ONYXKEYS.FREQUENTLY_USED_EMOJIS, []);
        });
        await waitForBatchedUpdatesWithAct();
        mockHiddenHeaders = new Set();
        mockRenderTarget = 'Cell';
        mockVisibleEmojiCode = '👋';
        mockScrollToOffset.mockClear();
        mockSelectedHeaderGeneration = 0;
        refreshEmojiWindow = undefined;
    });
    afterEach(() => {
        cleanup();
        for (const {host, descriptor} of mockFocusDescriptors) {
            if (descriptor) {
                Object.defineProperty(host, 'focus', descriptor);
            } else {
                expect(Reflect.deleteProperty(host, 'focus')).toBe(true);
            }
            expect(Object.getOwnPropertyDescriptor(host, 'focus')).toEqual(descriptor);
        }
        mockFocusDescriptors.length = 0;
        expect(Object.getOwnPropertyDescriptor(View.prototype, 'focus')).toEqual(originalFocusDescriptor);
        refreshEmojiWindow = undefined;
        jest.clearAllTimers();
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it('selects the first real search result while suppressing the Enter event', async () => {
        // Given real nonempty search output, keyboard selection must use that output instead of catalog headers.
        const onEmojiSelected = jest.fn<void, Parameters<EmojiPickerMenuProps['onEmojiSelected']>>();
        renderEmojiMenu(WebEmojiPickerMenu, onEmojiSelected);
        await waitForBatchedUpdatesWithAct();
        fireEvent.changeText(screen.getByPlaceholderText(en.common.search), 'smile');
        act(() => jest.advanceTimersByTime(200));
        const first = mockEmojiListProps.data?.[0];
        expect(first).toBeDefined();
        if (!first || !('name' in first)) {
            throw new Error('Expected a real search result');
        }
        const enter = new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true});
        const preventDefault = jest.spyOn(enter, 'preventDefault');
        const stopPropagation = jest.spyOn(enter, 'stopPropagation');
        const registration = mockKeyRegistrations.find(({key}) => key.input === CONST.KEYBOARD_SHORTCUTS.ENTER.trigger.DEFAULT.input);
        expect(registration).toBeDefined();
        if (!registration) {
            throw new Error('Expected the real Enter registration');
        }

        // When search highlights the first result, Enter cannot leak to the composer or child pressable.
        act(() => {
            document.dispatchEvent(enter);
            registration.callback(registration.key, enter);
        });

        // Then the actual selected result and both event barriers are observed.
        expect(onEmojiSelected).toHaveBeenCalledTimes(1);
        expect(onEmojiSelected).toHaveBeenCalledWith(first.code, first, -1);
        expect(preventDefault).toHaveBeenCalled();
        expect(stopPropagation).toHaveBeenCalled();
    });

    it('moves through two separately committed arrows to the distinct second search result', async () => {
        // Given multiple real search results, first-result highlighting cannot prove arrow movement.
        const onEmojiSelected = jest.fn<void, Parameters<EmojiPickerMenuProps['onEmojiSelected']>>();
        renderEmojiMenu(WebEmojiPickerMenu, onEmojiSelected);
        await waitForBatchedUpdatesWithAct();
        fireEvent.changeText(screen.getByPlaceholderText(en.common.search), 'smile');
        await act(async () => jest.advanceTimersByTime(200));
        const data = mockEmojiListProps.data;
        expect(data?.length).toBeGreaterThanOrEqual(2);
        expect(data?.some((item) => 'header' in item || 'spacer' in item)).toBe(false);
        expect(mockEmojiListProps.stickyHeaderIndices).toEqual([]);
        const first = data?.[0];
        const second = data?.[1];
        expect(first).toBeDefined();
        expect(second).toBeDefined();
        if (!first || !second || !('name' in first) || !('name' in second)) {
            throw new Error('Expected two actual search emojis');
        }
        expect(second).not.toBe(first);
        expect(second.code).not.toBe(first.code);
        mockVisibleEmojiCode = second.code;
        expect(refreshEmojiWindow).toBeDefined();
        act(() => refreshEmojiWindow?.());
        fireEvent(screen.getByPlaceholderText(en.common.search), 'blur');
        await act(async () => jest.advanceTimersByTime(0));
        const arrowRegistration = mockKeyRegistrations.find(({key}) => key.input === CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.trigger.DEFAULT.input);
        const enterRegistration = mockKeyRegistrations.find(({key}) => key.input === CONST.KEYBOARD_SHORTCUTS.ENTER.trigger.DEFAULT.input);
        expect(arrowRegistration).toBeDefined();
        expect(enterRegistration).toBeDefined();
        if (!arrowRegistration || !enterRegistration) {
            throw new Error('Expected real arrow and Enter registrations');
        }

        // When each arrow commits independently, the real hook advances from -1 through 0 to 1 before Enter.
        const firstArrow = new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true, cancelable: true});
        await act(async () => {
            document.dispatchEvent(firstArrow);
            arrowRegistration.callback(arrowRegistration.key, firstArrow);
        });
        const secondArrow = new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true, cancelable: true});
        await act(async () => {
            document.dispatchEvent(secondArrow);
            arrowRegistration.callback(arrowRegistration.key, secondArrow);
        });
        const enter = new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true});
        const preventDefault = jest.spyOn(enter, 'preventDefault');
        const stopPropagation = jest.spyOn(enter, 'stopPropagation');
        await act(async () => {
            document.dispatchEvent(enter);
            enterRegistration.callback(enterRegistration.key, enter);
        });

        // Then missing either movement selects the wrong item and fails this independent second-item oracle.
        expect(mockEmojiListProps.extraData).toEqual([1, -1]);
        expect(onEmojiSelected).toHaveBeenCalledTimes(1);
        expect(onEmojiSelected).toHaveBeenCalledWith(second.code, second, -1);
        expect(onEmojiSelected).not.toHaveBeenCalledWith(first.code, first, -1);
        expect(preventDefault).toHaveBeenCalled();
        expect(stopPropagation).toHaveBeenCalled();
    });

    it('skips the real first header and all seven spacers before selecting grinning', async () => {
        // Given an unfiltered real catalog, both header and spacer barriers stand between -1 and the first emoji.
        const onEmojiSelected = jest.fn<void, Parameters<EmojiPickerMenuProps['onEmojiSelected']>>();
        renderEmojiMenu(WebEmojiPickerMenu, onEmojiSelected);
        await waitForBatchedUpdatesWithAct();
        const data = mockEmojiListProps.data;
        expect(data?.[0]).toEqual(expect.objectContaining({header: true, code: 'smileysAndEmotion'}));
        expect(data?.slice(1, 8)).toHaveLength(7);
        expect(data?.slice(1, 8).every((item) => 'spacer' in item)).toBe(true);
        const grinning = data?.[8];
        expect(grinning).toBeDefined();
        if (!grinning || !('name' in grinning)) {
            throw new Error('Expected the real grinning item after the padded header');
        }
        expect(grinning.name).toBe('grinning');
        expect(grinning.code).toBe('😀');
        expect(mockEmojiListProps.stickyHeaderIndices).toContain(0);
        expect(screen.getByPlaceholderText(en.common.search).props.value).toBe('');
        mockVisibleEmojiCode = grinning.code;
        expect(refreshEmojiWindow).toBeDefined();
        act(() => refreshEmojiWindow?.());
        fireEvent(screen.getByPlaceholderText(en.common.search), 'blur');
        await act(async () => jest.advanceTimersByTime(0));
        const arrowRegistration = mockKeyRegistrations.find(({key}) => key.input === CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.trigger.DEFAULT.input);
        const enterRegistration = mockKeyRegistrations.find(({key}) => key.input === CONST.KEYBOARD_SHORTCUTS.ENTER.trigger.DEFAULT.input);
        expect(arrowRegistration).toBeDefined();
        expect(enterRegistration).toBeDefined();
        if (!arrowRegistration || !enterRegistration) {
            throw new Error('Expected real arrow and Enter registrations');
        }

        // When one registered arrow commits, traversal crosses index 0 and spacers 1 through 7 to index 8.
        const arrow = new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true, cancelable: true});
        await act(async () => {
            document.dispatchEvent(arrow);
            arrowRegistration.callback(arrowRegistration.key, arrow);
        });
        const enter = new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true});
        const preventDefault = jest.spyOn(enter, 'preventDefault');
        const stopPropagation = jest.spyOn(enter, 'stopPropagation');
        await act(async () => {
            document.dispatchEvent(enter);
            enterRegistration.callback(enterRegistration.key, enter);
        });

        // Then a disabled-index or traversal regression yields a wrong item or no selection, with both Enter barriers retained.
        expect(onEmojiSelected).toHaveBeenCalledTimes(1);
        expect(onEmojiSelected).toHaveBeenCalledWith(grinning.code, grinning, -1);
        expect(preventDefault).toHaveBeenCalled();
        expect(stopPropagation).toHaveBeenCalled();
    });
});
