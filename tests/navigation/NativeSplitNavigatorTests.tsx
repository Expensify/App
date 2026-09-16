import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import createSplitNavigator from '@libs/Navigation/AppNavigator/createSplitNavigator';
import navigationRef from '@libs/Navigation/navigationRef';
import StackScreenAccessibility from '@libs/Navigation/PlatformStackNavigation/StackScreenAccessibility';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';

import SidebarLinksData from '@pages/inbox/sidebar/SidebarLinksData';

import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

import {CommonActions, NavigationContainer, StackActions} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {TextInput, View} from 'react-native';

const Split = createSplitNavigator<ReportsSplitNavigatorParamList>();
const mountedCentralRouteKeys = new Set<string>();

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());
jest.mock('@hooks/useSidebarOrderedReports', () => ({useSidebarOrderedReportsState: () => ({filteredReports: [], orderedReportIDs: []})}));
jest.mock('@pages/inbox/sidebar/SidebarLinks', () => {
    const {View: MockView} = jest.requireActual<{View: typeof View}>('react-native');
    return () => (
        <MockView
            accessible
            accessibilityRole="button"
            accessibilityLabel="Open chat"
        />
    );
});

function SidebarScreen() {
    return (
        <View testID="split-sidebar">
            <SidebarLinksData insets={{top: 0, right: 0, bottom: 0, left: 0}} />
        </View>
    );
}

function CentralScreen({route}: PlatformStackScreenProps<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>) {
    const [draft, setDraft] = useState('');

    useEffect(() => {
        mountedCentralRouteKeys.add(route.key);
        return () => {
            mountedCentralRouteKeys.delete(route.key);
        };
    }, [route.key]);

    return (
        <View testID="split-central">
            <TextInput
                accessibilityLabel={`report-${route.params?.reportID}-draft`}
                value={draft}
                onChangeText={setDraft}
            />
        </View>
    );
}

function TestNavigator() {
    return (
        <NavigationContainer
            ref={navigationRef}
            initialState={{routes: [{name: SCREENS.INBOX}]}}
        >
            <Split.Navigator
                sidebarScreen={SCREENS.INBOX}
                defaultCentralScreen={SCREENS.REPORT}
                persistentScreens={[SCREENS.INBOX]}
                parentRoute={CONST.NAVIGATION_TESTS.DEFAULT_PARENT_ROUTE}
            >
                <Split.Screen
                    name={SCREENS.INBOX}
                    component={SidebarScreen}
                />
                <Split.Screen
                    name={SCREENS.REPORT}
                    component={CentralScreen}
                />
            </Split.Navigator>
        </NavigationContainer>
    );
}

function setNarrowLayout(isNarrow: boolean) {
    jest.mocked(getIsNarrowLayout).mockReturnValue(isNarrow);
    jest.mocked(useResponsiveLayout).mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: isNarrow, isSmallScreenWidth: isNarrow});
}

describe('Native split navigation', () => {
    it.each([true, false])('bounds mounted central screens while preserving history across resize and back navigation, starting narrow: %s', async (initiallyNarrow) => {
        setNarrowLayout(initiallyNarrow);
        const {rerender} = render(<TestNavigator />);

        for (const reportID of ['1', '2', '3']) {
            act(() => navigationRef.dispatch(StackActions.push(SCREENS.REPORT, {reportID})));
            fireEvent.changeText(await screen.findByLabelText(`report-${reportID}-draft`), `Draft ${reportID}`);
        }

        const routeKeys = navigationRef.getRootState().routes.map((route) => route.key);
        expect(routeKeys).toHaveLength(initiallyNarrow ? 4 : 5);
        expect(mountedCentralRouteKeys).toEqual(new Set(routeKeys.slice(-2)));

        setNarrowLayout(!initiallyNarrow);
        rerender(<TestNavigator />);
        expect(navigationRef.getRootState().routes.map((route) => route.key)).toEqual(routeKeys);
        expect(mountedCentralRouteKeys).toEqual(new Set(routeKeys.slice(-2)));
        expect(screen.getByLabelText('report-3-draft')).toHaveDisplayValue('Draft 3');

        setNarrowLayout(initiallyNarrow);
        rerender(<TestNavigator />);
        expect(navigationRef.getRootState().routes.map((route) => route.key)).toEqual(routeKeys);
        expect(mountedCentralRouteKeys).toEqual(new Set(routeKeys.slice(-2)));

        act(() => navigationRef.dispatch(StackActions.pop()));
        await waitFor(() => expect(screen.getByLabelText('report-2-draft')).toHaveDisplayValue('Draft 2'));
        expect(navigationRef.getRootState().routes.map((route) => route.key)).toEqual(routeKeys.slice(0, -1));
        expect(mountedCentralRouteKeys).toEqual(new Set(routeKeys.slice(-3, -1)));

        // Evicted routes remain in history, but their component-local state resets when they mount again.
        act(() => navigationRef.dispatch(StackActions.pop()));
        await waitFor(() => expect(screen.getByLabelText('report-1-draft')).toHaveDisplayValue(''));
        expect(navigationRef.getRootState().routes.map((route) => route.key)).toEqual(routeKeys.slice(0, -2));
        expect(mountedCentralRouteKeys.size).toBeLessThanOrEqual(2);
    });

    it('exposes the wide chat list beside a report but hides it when the root screen is covered', () => {
        setNarrowLayout(false);
        const renderInbox = (isCovered: boolean) => (
            <StackScreenAccessibility isFocused={!isCovered}>
                <TestNavigator />
            </StackScreenAccessibility>
        );
        const {rerender} = render(renderInbox(false));

        expect(navigationRef.getRootState().routes.at(-1)?.name).toBe(SCREENS.REPORT);
        expect(screen.getByRole('button', {name: 'Open chat'})).toBeOnTheScreen();

        // The root JS stack applies this accessibility boundary while an RHP covers the Inbox.
        rerender(renderInbox(true));
        expect(screen.queryByRole('button', {name: 'Open chat'})).toBeNull();
        expect(screen.getByLabelText('Open chat', {includeHiddenElements: true})).toBeOnTheScreen();

        rerender(renderInbox(false));
        expect(screen.getByRole('button', {name: 'Open chat'})).toBeOnTheScreen();

        setNarrowLayout(true);
        rerender(renderInbox(false));
        expect(screen.queryByRole('button', {name: 'Open chat'})).toBeNull();
    });

    it('exposes the narrow chat list only while the sidebar is focused', async () => {
        setNarrowLayout(true);
        render(<TestNavigator />);
        expect(screen.getByRole('button', {name: 'Open chat'})).toBeOnTheScreen();

        act(() => navigationRef.dispatch(StackActions.push(SCREENS.REPORT, {reportID: '1'})));
        expect(screen.queryByRole('button', {name: 'Open chat'})).toBeNull();

        act(() => navigationRef.dispatch(StackActions.pop()));
        expect(await screen.findByRole('button', {name: 'Open chat'})).toBeOnTheScreen();
    });

    it.each([true, false])('preserves central screen state across both breakpoint directions, starting narrow: %s', async (initiallyNarrow) => {
        setNarrowLayout(initiallyNarrow);
        const {rerender} = render(<TestNavigator />);

        act(() => navigationRef.dispatch(StackActions.push(SCREENS.REPORT, {reportID: '1'})));
        fireEvent.changeText(await screen.findByLabelText('report-1-draft'), 'First report draft');

        act(() => navigationRef.dispatch(StackActions.push(SCREENS.REPORT, {reportID: '2'})));
        fireEvent.changeText(await screen.findByLabelText('report-2-draft'), 'Second report draft');
        const routeKeys = navigationRef.getRootState().routes.map((route) => route.key);

        setNarrowLayout(!initiallyNarrow);
        rerender(<TestNavigator />);
        expect(navigationRef.getRootState().routes.map((route) => route.key)).toEqual(routeKeys);
        expect(screen.getByLabelText('report-2-draft')).toHaveDisplayValue('Second report draft');

        setNarrowLayout(initiallyNarrow);
        rerender(<TestNavigator />);
        expect(navigationRef.getRootState().routes.map((route) => route.key)).toEqual(routeKeys);
        expect(screen.getByLabelText('report-2-draft')).toHaveDisplayValue('Second report draft');

        act(() => navigationRef.dispatch(StackActions.pop()));
        await waitFor(() => expect(screen.getByLabelText('report-1-draft')).toHaveDisplayValue('First report draft'));
    });

    it('renders both panes, keeps route keys on resize, and pops central history', async () => {
        setNarrowLayout(false);
        const {rerender} = render(<TestNavigator />);

        expect(await screen.findByTestId('split-central')).toBeOnTheScreen();
        expect(screen.getAllByTestId('split-sidebar')).toHaveLength(1);

        act(() => navigationRef.dispatch(StackActions.push(SCREENS.REPORT, {reportID: '2'})));
        const routeKeys = navigationRef.getRootState().routes.map((route) => route.key);
        expect(routeKeys).toHaveLength(3);

        setNarrowLayout(true);
        rerender(<TestNavigator />);
        await waitFor(() => expect(navigationRef.getRootState().routes.map((route) => route.key)).toEqual(routeKeys));

        setNarrowLayout(false);
        rerender(<TestNavigator />);
        expect(await screen.findByTestId('split-sidebar')).toBeOnTheScreen();
        expect(navigationRef.getRootState().routes.map((route) => route.key)).toEqual(routeKeys);

        act(() => navigationRef.dispatch(CommonActions.navigate(SCREENS.INBOX)));
        expect(navigationRef.getRootState().index).toBe(2);

        act(() => navigationRef.dispatch(StackActions.pop()));
        expect(navigationRef.getRootState().routes.map((route) => route.key)).toEqual(routeKeys.slice(0, 2));
        expect(screen.getByTestId('split-sidebar')).toBeOnTheScreen();
        expect(screen.getByTestId('split-central')).toBeOnTheScreen();
    });
});
