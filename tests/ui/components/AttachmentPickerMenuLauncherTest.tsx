import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {PopoverMenuProps} from '@components/PopoverMenu';

import {markActivePopoverLauncherDeactivated, resolvePopoverLauncherElement, setActivePopoverLauncher} from '@libs/LauncherStack';

import AttachmentPickerWithMenuItems from '@pages/inbox/report/ReportActionCompose/AttachmentPickerWithMenuItems';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Report} from '@src/types/onyx';

import type * as NativeNavigation from '@react-navigation/native';
import type {View} from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@react-navigation/native', () => ({
    ...((): typeof NativeNavigation => jest.requireActual('@react-navigation/native'))(),
    useNavigation: jest.fn(() => ({navigate: jest.fn(), addListener: jest.fn(() => jest.fn())})),
    useIsFocused: jest.fn(() => true),
    useRoute: jest.fn(() => ({key: '', name: '', params: {reportID: '1'}})),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((cb: () => void) => cb()),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isTopmostRouteModalScreen: jest.fn(() => false),
}));

jest.mock('@libs/LauncherStack', () => ({
    resolvePopoverLauncherElement: jest.fn(),
    setActivePopoverLauncher: jest.fn(),
    markActivePopoverLauncherDeactivated: jest.fn(),
    pickLauncher: jest.fn(() => null),
    consumeLauncher: jest.fn(),
    resetLauncherStackForTests: jest.fn(),
}));

const latestPopoverProps: {current: PopoverMenuProps | null} = {current: null};

jest.mock('@components/PopoverMenu', () => (props: PopoverMenuProps) => {
    latestPopoverProps.current = props;
    return null;
});

jest.mock(
    '@components/AttachmentPicker',
    () =>
        ({children}: {children: (args: {openPicker: () => void}) => React.ReactNode}) =>
            children({openPicker: jest.fn()}),
);

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'user@test.com';
const MOCK_POLICY_ID = 'policy-123';
const MOCK_REPORT_ID = 'report-456';

const MOCK_REPORT: Report = {
    reportID: MOCK_REPORT_ID,
    policyID: MOCK_POLICY_ID,
    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
};

const MOCK_PERSONAL_DETAILS: PersonalDetails = {
    accountID: CURRENT_USER_ACCOUNT_ID,
    login: CURRENT_USER_EMAIL,
    displayName: 'Test User',
};

const mockAnchor = document.createElement('button');

function renderComponent(isMenuVisible: boolean) {
    const actionButtonRef = React.createRef<View>();
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <AttachmentPickerWithMenuItems
                report={MOCK_REPORT}
                currentUserPersonalDetails={MOCK_PERSONAL_DETAILS}
                reportID={MOCK_REPORT_ID}
                onAttachmentPicked={jest.fn()}
                isFullComposerAvailable
                isComposerFullSize={false}
                disabled={false}
                setMenuVisibility={jest.fn()}
                isMenuVisible={isMenuVisible}
                onTriggerAttachmentPicker={jest.fn()}
                onCanceledAttachmentPicker={jest.fn()}
                onMenuClosed={jest.fn()}
                onAddActionPressed={jest.fn()}
                onItemSelected={jest.fn()}
                actionButtonRef={actionButtonRef}
                raiseIsScrollLikelyLayoutTriggered={jest.fn()}
            />
        </ComposeProviders>,
    );
}

function pressCreateButton() {
    fireEvent.press(screen.getByLabelText(translateLocal('accessibilityHints.openActionsMenu')));
}

describe('AttachmentPickerWithMenuItems launcher registration', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        latestPopoverProps.current = null;
        jest.clearAllMocks();
        jest.mocked(resolvePopoverLauncherElement).mockReturnValue(mockAnchor);
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {
                accountID: CURRENT_USER_ACCOUNT_ID,
                email: CURRENT_USER_EMAIL,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`, {
                id: MOCK_POLICY_ID,
                name: 'Test Workspace',
                type: CONST.POLICY.TYPE.TEAM,
                role: CONST.POLICY.ROLE.ADMIN,
                isPolicyExpenseChatEnabled: true,
                pendingAction: null,
                owner: CURRENT_USER_EMAIL,
                outputCurrency: CONST.CURRENCY.USD,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${MOCK_REPORT_ID}`, MOCK_REPORT);
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('registers the create button as the launcher when opening the menu', async () => {
        renderComponent(false);
        await waitForBatchedUpdatesWithAct();

        pressCreateButton();

        expect(setActivePopoverLauncher).toHaveBeenCalledWith(mockAnchor);
    });

    it('does not register a launcher when the press closes an already-open menu', async () => {
        renderComponent(true);
        await waitForBatchedUpdatesWithAct();

        pressCreateButton();

        expect(setActivePopoverLauncher).not.toHaveBeenCalled();
    });

    it('deactivates the launcher entry once the menu is hidden', async () => {
        renderComponent(true);
        await waitForBatchedUpdatesWithAct();

        act(() => {
            latestPopoverProps.current?.onModalHide?.();
        });

        expect(markActivePopoverLauncherDeactivated).toHaveBeenCalledWith(mockAnchor);
    });

    it('does not deactivate anything on hide when the anchor has no host node (native)', async () => {
        jest.mocked(resolvePopoverLauncherElement).mockReturnValue(null);
        renderComponent(true);
        await waitForBatchedUpdatesWithAct();

        act(() => {
            latestPopoverProps.current?.onModalHide?.();
        });

        expect(markActivePopoverLauncherDeactivated).not.toHaveBeenCalled();
    });
});
