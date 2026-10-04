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
                            shouldShowBankAccountColumn
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

    describe('bank account sorting', () => {
        it('sorts members by their bank account last four, with members without one last in both directions', async () => {
            const members: WorkspaceMemberRowData[] = [
                buildMember({keyForList: 'nina', login: 'nina@example.com', email: 'nina@example.com', name: 'Nina', accountID: 1, bankAccountLastFour: '5382'}),
                buildMember({keyForList: 'carol', login: 'carol@example.com', email: 'carol@example.com', name: 'Carol', accountID: 2}),
                buildMember({keyForList: 'adam', login: 'adam@example.com', email: 'adam@example.com', name: 'Adam', accountID: 3, bankAccountLastFour: '1809'}),
                buildMember({keyForList: 'brian', login: 'brian@example.com', email: 'brian@example.com', name: 'Brian', accountID: 4}),
            ];

            const tableRef = React.createRef<TableHandle<WorkspaceMemberRowData, WorkspaceMembersTableColumnKey, string>>();
            renderTable(members, tableRef);
            await waitForBatchedUpdatesWithAct();

            const [bankAccountHeader] = screen.getAllByLabelText(TestHelper.translateLocal('common.bankAccount'));
            fireEvent.press(bankAccountHeader);

            expect(tableRef.current?.getActiveSorting()).toEqual({columnKey: 'bankAccount', order: 'desc'});
            expect(tableRef.current?.getProcessedData().map((item) => item.name)).toEqual(['Nina', 'Adam', 'Carol', 'Brian']);

            fireEvent.press(bankAccountHeader);

            expect(tableRef.current?.getActiveSorting()).toEqual({columnKey: 'bankAccount', order: 'asc'});
            expect(tableRef.current?.getProcessedData().map((item) => item.name)).toEqual(['Adam', 'Nina', 'Brian', 'Carol']);
        });
    });
});
