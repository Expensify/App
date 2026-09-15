import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapperStatusContext from '@components/ScreenWrapper/ScreenWrapperStatusContext';
import type {TableHandle} from '@components/Table';
import type {WorkspaceMemberRowData, WorkspaceMembersTableColumnKey} from '@components/Tables/WorkspaceMembersTable';
import WorkspaceMembersTable from '@components/Tables/WorkspaceMembersTable';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// Per-column sort header buttons only render in the wide layout, since TableHeader renders just the table title on
// narrow, so the layout hook is pinned to wide rather than left at whatever the test environment reports.
jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: jest.fn(() => ({shouldUseNarrowLayout: false, isSmallScreenWidth: false, isMediumScreenWidth: false})),
}));

const SCREEN_WRAPPER_STATUS = {didScreenTransitionEnd: true, isSafeAreaTopPaddingApplied: true, isSafeAreaBottomPaddingApplied: true};

function buildMember(overrides: Partial<WorkspaceMemberRowData> & Pick<WorkspaceMemberRowData, 'keyForList' | 'login' | 'name' | 'email' | 'accountID'>): WorkspaceMemberRowData {
    return {
        role: CONST.POLICY.ROLE.USER,
        shouldShowEmployeeUserID: false,
        shouldShowEmployeePayrollID: false,
        invitedSecondaryLogin: '',
        action: jest.fn(),
        dismissError: jest.fn(),
        ...overrides,
    };
}

function renderTable(members: WorkspaceMemberRowData[], tableRef: React.RefObject<TableHandle<WorkspaceMemberRowData, WorkspaceMembersTableColumnKey, string> | null>) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider, ModalProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <ScreenWrapperStatusContext.Provider value={SCREEN_WRAPPER_STATUS}>
                        <WorkspaceMembersTable
                            ref={tableRef}
                            members={members}
                            policy={undefined}
                            canSelectMembers={false}
                            selectedKeys={[]}
                            shouldShowCustomField1Column={false}
                            shouldShowCustomField2Column={false}
                            shouldShowApproverColumn
                            shouldUseOrdinalApproverLabel={false}
                            onRowSelectionChange={jest.fn()}
                        />
                    </ScreenWrapperStatusContext.Provider>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

describe('WorkspaceMembersTable', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    describe('approver sorting', () => {
        it('sorts members by their approver, with unapproved members last in both directions, and ties broken by member name', async () => {
            const members: WorkspaceMemberRowData[] = [
                buildMember({
                    keyForList: 'walter',
                    login: 'walter@example.com',
                    email: 'walter@example.com',
                    name: 'Walter',
                    accountID: 1,
                    approverAccountID: 10,
                    approverDisplayName: 'Ann Manager',
                }),
                buildMember({
                    keyForList: 'nina',
                    login: 'nina@example.com',
                    email: 'nina@example.com',
                    name: 'Nina',
                    accountID: 2,
                    approverAccountID: 11,
                    approverDisplayName: 'Zoe Manager',
                }),
                buildMember({keyForList: 'carol', login: 'carol@example.com', email: 'carol@example.com', name: 'Carol', accountID: 3}),
                buildMember({
                    keyForList: 'adam',
                    login: 'adam@example.com',
                    email: 'adam@example.com',
                    name: 'Adam',
                    accountID: 4,
                    approverAccountID: 10,
                    approverDisplayName: 'Ann Manager',
                }),
            ];

            const tableRef = React.createRef<TableHandle<WorkspaceMemberRowData, WorkspaceMembersTableColumnKey, string>>();
            renderTable(members, tableRef);
            await waitForBatchedUpdatesWithAct();

            // The table renders a page title, so Table.tsx also renders a duplicate sticky header (hidden from
            // assistive tech but still queryable) alongside the declared one, hence getAllByLabelText rather than
            // getByLabelText. Either copy toggles the same shared sorting state.
            const [approverHeader] = screen.getAllByLabelText(TestHelper.translateLocal('workflowsPage.approver'));
            fireEvent.press(approverHeader);

            // Ascending: Ann's members first (tie broken by member name: Adam before Walter), then Zoe's member,
            // then Carol last since she has no approver.
            expect(tableRef.current?.getActiveSorting()).toEqual({columnKey: 'approver', order: 'asc'});
            expect(tableRef.current?.getProcessedData().map((item) => item.name)).toEqual(['Adam', 'Walter', 'Nina', 'Carol']);

            fireEvent.press(approverHeader);

            // Descending: Zoe's member first, then Ann's (the member-name tiebreak reverses too, since it reuses
            // the same order-multiplied comparison: Walter before Adam), and Carol stays last, not first, since
            // members without an approver sort last in both directions.
            expect(tableRef.current?.getActiveSorting()).toEqual({columnKey: 'approver', order: 'desc'});
            expect(tableRef.current?.getProcessedData().map((item) => item.name)).toEqual(['Nina', 'Walter', 'Adam', 'Carol']);
        });
    });
});
