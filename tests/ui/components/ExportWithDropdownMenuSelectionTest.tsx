/** Verifies export selection survives the preferred-method update through the real dropdown and Onyx. */
import {act, fireEvent, render, screen} from '@testing-library/react-native';

import type {ReportExportType} from '@components/ButtonWithDropdownMenu/types';
import type {PopoverMenuProps} from '@components/PopoverMenu';
import ExportWithDropdownMenu from '@components/ReportActionItem/ExportWithDropdownMenu';

import {exportToIntegration, markAsManuallyExported} from '@libs/actions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = '1001';
const POLICY_ID = 'policy1';
const report: Report = {reportID: REPORT_ID, policyID: POLICY_ID, reportName: 'Approved report'};
const mockPopoverMenu = jest.fn<null, [PopoverMenuProps]>(() => null);

// Keep the real split button's selection state, replacing only the modal presentation.
jest.mock('@components/PopoverMenu', () => ({
    __esModule: true,
    default: (props: PopoverMenuProps) => mockPopoverMenu(props),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

jest.mock('@libs/actions/Report', () => ({
    exportToIntegration: jest.fn(),
    markAsManuallyExported: jest.fn(),
}));

jest.mock('@libs/ReportUtils', () => ({
    canBeExported: () => true,
    isExported: () => false,
    getIntegrationIcon: () => undefined,
}));

describe('ExportWithDropdownMenu selection', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it.each<ReportExportType | undefined>([undefined, CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION, CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED])(
        'executes the selected method after updating the saved preference from %s',
        async (preferredMethod) => {
            // Given a mounted split button that initially selects the workspace's remembered method.
            await Onyx.set(ONYXKEYS.LAST_EXPORT_METHOD, preferredMethod ? {[POLICY_ID]: preferredMethod} : {});
            render(
                <ExportWithDropdownMenu
                    report={report}
                    reportActions={undefined}
                    connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
                />,
            );
            await waitForBatchedUpdatesWithAct();
            const initialMethod = preferredMethod ?? CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION;
            const selectedMethod =
                initialMethod === CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION ? CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED : CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION;
            const initialText = initialMethod === CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED ? 'workspace.common.markAsEntered' : 'workspace.common.exportIntegrationSelected';
            expect(screen.getByRole('button', {name: initialText})).toBeOnTheScreen();

            // When selecting the other option saves it through the real policy action and Onyx subscription.
            const selectedText = selectedMethod === CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED ? 'workspace.common.markAsEntered' : 'workspace.common.exportIntegrationSelected';
            const selectedOption = mockPopoverMenu.mock.lastCall?.[0].menuItems.find(({text}) => text === selectedText);
            expect(selectedOption).toBeDefined();
            await act(async () => {
                selectedOption?.onSelected?.();
            });
            await waitForBatchedUpdatesWithAct();
            fireEvent.press(screen.getByRole('button', {name: selectedText}));

            // Then the main button executes that selection, not the action formerly at the same array index.
            if (selectedMethod === CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED) {
                expect(markAsManuallyExported).toHaveBeenCalledWith([REPORT_ID], CONST.POLICY.CONNECTIONS.NAME.QBO, undefined);
                expect(exportToIntegration).not.toHaveBeenCalled();
            } else {
                expect(exportToIntegration).toHaveBeenCalledWith(REPORT_ID, CONST.POLICY.CONNECTIONS.NAME.QBO, undefined);
                expect(markAsManuallyExported).not.toHaveBeenCalled();
            }
        },
    );
});
