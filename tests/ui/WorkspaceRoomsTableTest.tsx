import {act, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';
import Table from '@components/Table';
import type {WorkspaceRoomRowData} from '@components/Tables/WorkspaceRoomsTable';
import WorkspaceRoomsTable from '@components/Tables/WorkspaceRoomsTable';
import Text from '@components/Text';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import useNetwork from '@hooks/useNetwork';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useNetwork');

const POLICY_ID = '123';
const SCREEN_WRAPPER_STATUS = {didScreenTransitionEnd: true, isSafeAreaTopPaddingApplied: true, isSafeAreaBottomPaddingApplied: true};
const ROOMS: WorkspaceRoomRowData[] = [{keyForList: '456', reportID: '456', name: '#admins', memberCount: 1, action: jest.fn()}];

function RoomsTable({rooms = ROOMS}: {rooms?: WorkspaceRoomRowData[]}) {
    return (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider, ModalProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <ScreenWrapperStatusContext.Provider value={SCREEN_WRAPPER_STATUS}>
                        <WorkspaceRoomsTable
                            rooms={rooms}
                            policyID={POLICY_ID}
                            headerComponent={<Text>Rooms header</Text>}
                        />
                    </ScreenWrapperStatusContext.Provider>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>
    );
}

describe('WorkspaceRoomsTable offline loading', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.mocked(useNetwork).mockReturnValue({isOffline: false});
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('shows local rooms offline before rooms metadata has been loaded', async () => {
        // Given an offline-created workspace has optimistic rooms but no server metadata
        jest.mocked(useNetwork).mockReturnValue({isOffline: true});

        // When its Rooms table opens without a request being possible
        render(<RoomsTable />);
        await waitForBatchedUpdatesWithAct();

        // Then local rooms remain accessible instead of being hidden behind a skeleton
        expect(screen.getByText('#admins')).toBeOnTheScreen();
        expect(screen.getByText('Rooms header')).toBeOnTheScreen();
        expect(screen.UNSAFE_queryByType(Table.LoadingState)).toBeNull();
    });

    it('shows the empty state offline when no rooms are cached', async () => {
        // Given the workspace has neither cached rooms nor loaded metadata
        jest.mocked(useNetwork).mockReturnValue({isOffline: true});

        // When Rooms opens offline and cannot fetch any rooms
        render(<RoomsTable rooms={[]} />);
        await waitForBatchedUpdatesWithAct();

        // Then the existing empty state is available rather than an endless skeleton
        expect(screen.getByText(TestHelper.translateLocal('workspace.common.emptyRoomsTitle'))).toBeOnTheScreen();
        expect(screen.UNSAFE_queryByType(Table.LoadingState)).toBeNull();
    });

    it('keeps the initial loading skeleton online', async () => {
        // Given the client is online and the initial rooms request has not completed

        // When Rooms opens with local data but without loaded metadata
        render(<RoomsTable />);
        await waitForBatchedUpdatesWithAct();

        // Then the normal online loading state and page header are preserved
        expect(screen.UNSAFE_queryByType(Table.LoadingState)).not.toBeNull();
        expect(screen.queryByText('#admins')).toBeNull();
        expect(screen.getByText('Rooms header')).toBeOnTheScreen();
    });

    it('returns to online loading on reconnect and displays rooms after the response', async () => {
        // Given local rooms are visible offline before the first server response
        jest.mocked(useNetwork).mockReturnValue({isOffline: true});
        const {rerender} = render(<RoomsTable />);
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText('#admins')).toBeOnTheScreen();

        // When connectivity returns, the initial online loading gate applies again
        jest.mocked(useNetwork).mockReturnValue({isOffline: false});
        rerender(<RoomsTable />);
        await waitForBatchedUpdatesWithAct();
        expect(screen.UNSAFE_queryByType(Table.LoadingState)).not.toBeNull();

        // Then completion of the rooms request removes the skeleton without losing local rows
        await act(async () => {
            await Onyx.merge(ONYXKEYS.POLICY_ROOMS_METADATA, {[POLICY_ID]: {isLoaded: true, isLoading: false}});
        });
        await waitForBatchedUpdatesWithAct();
        expect(screen.getByText('#admins')).toBeOnTheScreen();
        expect(screen.UNSAFE_queryByType(Table.LoadingState)).toBeNull();
    });
});
