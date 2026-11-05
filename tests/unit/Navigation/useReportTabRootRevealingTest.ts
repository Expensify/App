import {renderHook} from '@testing-library/react-native';

import TabRootRevealingContext from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/TabRootRevealingContext';
// The iOS variant is the only one that reports anything, the others are no-ops.
import useReportTabRootRevealing from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useReportTabRootRevealing/index.ios';
import type UseReportTabRootRevealing from '@libs/Navigation/AppNavigator/Navigators/NativeTabNavigator/useReportTabRootRevealing/types';

import SCREENS from '@src/SCREENS';

import React from 'react';

type Listener = (event: {data?: {closing?: boolean}}) => void;

type FakeNavigation = {
    listeners: Record<string, Listener>;
    unsubscribe: jest.Mock;
    addListener: jest.Mock;
};

type Route = {key: string; name: string};

function createNavigation(): FakeNavigation {
    const navigation: FakeNavigation = {listeners: {}, unsubscribe: jest.fn(), addListener: jest.fn()};
    navigation.addListener.mockImplementation((eventName: string, listener: Listener) => {
        navigation.listeners[eventName] = listener;
        return navigation.unsubscribe;
    });
    return navigation;
}

function renderReporting(routes: Route[], navigations: Record<string, FakeNavigation>) {
    const setIsRevealing = jest.fn();
    const wrapper = ({children}: {children: React.ReactNode}) => React.createElement(TabRootRevealingContext.Provider, {value: setIsRevealing}, children);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the fake navigation only implements `addListener`, which is all the hook uses
    const descriptors = Object.fromEntries(Object.entries(navigations).map(([key, navigation]) => [key, {navigation}])) as unknown as Parameters<UseReportTabRootRevealing>[1];
    const result = renderHook(({stackRoutes}: {stackRoutes: Route[]}) => useReportTabRootRevealing({routes: stackRoutes}, descriptors), {
        initialProps: {stackRoutes: routes},
        wrapper,
    });
    return {...result, setIsRevealing};
}

const inbox: Route = {key: 'inbox', name: SCREENS.INBOX};
const chat: Route = {key: 'chat', name: SCREENS.REPORT};
const otherChat: Route = {key: 'otherChat', name: SCREENS.REPORT};

describe('useReportTabRootRevealing (iOS)', () => {
    it('reports the tab root coming back into view when its transition starts', () => {
        // Given a tab whose stack has a chat pushed over the Inbox root
        const root = createNavigation();
        const {setIsRevealing} = renderReporting([inbox, chat], {inbox: root, chat: createNavigation()});

        // When the root starts appearing, as at the start of the swipe-back gesture
        root.listeners.transitionStart({data: {closing: false}});

        // Then the tab navigator learns about it before the navigation state changes
        expect(setIsRevealing).toHaveBeenCalledWith(true);
    });

    it('ignores the root starting to leave', () => {
        // Given a tab whose stack has a chat pushed over the Inbox root
        const root = createNavigation();
        const {setIsRevealing} = renderReporting([inbox, chat], {inbox: root, chat: createNavigation()});

        // When the root starts leaving, as on a push, which the navigation state already reports
        root.listeners.transitionStart({data: {closing: true}});

        // Then nothing is reported
        expect(setIsRevealing).not.toHaveBeenCalled();
    });

    it('reports a cancelled swipe back through the screen that stays on top', () => {
        // Given a tab whose stack has a chat pushed over the Inbox root
        const top = createNavigation();
        const {setIsRevealing} = renderReporting([inbox, chat], {inbox: createNavigation(), chat: top});

        // When the swipe-back gesture is cancelled, which RNScreens reports only to the top screen
        top.listeners.gestureCancel({});

        // Then the root no longer counts as coming back
        expect(setIsRevealing).toHaveBeenCalledWith(false);
    });

    it('ignores a stack whose root is not a tab root', () => {
        // Given a stack whose root is a pushed screen, not the root view of a tab
        const root = createNavigation();
        const top = createNavigation();

        // When the stack renders
        renderReporting([chat, otherChat], {chat: root, otherChat: top});

        // Then it listens to nothing, since the tab bar never shows over it
        expect(root.addListener).not.toHaveBeenCalled();
        expect(top.addListener).not.toHaveBeenCalled();
    });

    it('stops listening when the top screen changes and when it unmounts', () => {
        // Given a tab whose stack has a chat pushed over the Inbox root
        const root = createNavigation();
        const top = createNavigation();
        const {rerender, unmount} = renderReporting([inbox, chat], {inbox: root, chat: top, otherChat: createNavigation()});

        // When another chat replaces the one on top
        rerender({stackRoutes: [inbox, otherChat]});

        // Then the screen that left is no longer listened to
        expect(top.unsubscribe).toHaveBeenCalledTimes(1);
        expect(root.unsubscribe).not.toHaveBeenCalled();

        // When the stack unmounts
        unmount();

        // Then the root is no longer listened to either
        expect(root.unsubscribe).toHaveBeenCalledTimes(1);
    });
});
