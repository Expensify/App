import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import * as Link from '@libs/actions/Link';
import localFileDownload from '@libs/localFileDownload';

import ImportFromFileStep from '@pages/workspace/companyCards/addNew/ImportFromFileStep';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'import-from-file-step-test-policy';

// The inline template download is a client-side file write, and the help guide opens an external link.
// Stub both so the test asserts the presses are wired up without touching the filesystem or the browser.
jest.mock('@libs/localFileDownload');

jest.mock('@react-navigation/native', () => {
    // jest.requireActual returns `any` for the untyped React Navigation module
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');

    // Spreading the untyped requireActual result is intentional for this navigation mock
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: jest.fn(),
            goBack: jest.fn(),
            addListener: () => jest.fn(),
            isFocused: () => true,
        }),
        useIsFocused: () => true,
        useFocusEffect: jest.fn(),
        usePreventRemove: jest.fn(),
        useRoute: () => ({key: 'test-route', name: 'Workspace_Company_Cards_Add_New', params: {policyID: POLICY_ID}}),
    };
});

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    getTopmostReportId: jest.fn(() => undefined),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    setNavigationActionToMicrotaskQueue: jest.fn(),
    removeScreenFromNavigationState: jest.fn(),
    dismissModal: jest.fn(),
}));

function renderImportFromFileStep() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <ImportFromFileStep />
        </ComposeProviders>,
    );
}

describe('ImportFromFileStep inline help links', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
        renderImportFromFileStep();
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the template link as a Pressable button that triggers the client-side CSV download', () => {
        const templateLink = screen.getByTestId('ImportFromFileStep-TemplateLink');

        // A Pressable-backed link (not a bare inline <Text>/ClickableSpan) so it gets a real native touch target on Android.
        expect(templateLink).toHaveProp('role', CONST.ROLE.BUTTON);

        fireEvent.press(templateLink);
        expect(localFileDownload).toHaveBeenCalledTimes(1);
    });

    it('renders the help guide link as a Pressable that keeps its href and opens the help guide', () => {
        const openLinkSpy = jest.spyOn(Link, 'openLink').mockImplementation(() => {});
        const helpGuideLink = screen.getByTestId('ImportFromFileStep-HelpGuideLink');

        // Retains href so web renders a real <a> (native link behavior), while still routing through onPress on every platform.
        expect(helpGuideLink).toHaveProp('role', CONST.ROLE.LINK);
        expect(helpGuideLink).toHaveProp('href', CONST.COMPANY_CARDS_CREATE_FILE_FEED_HELP_URL);

        fireEvent.press(helpGuideLink);
        expect(openLinkSpy).toHaveBeenCalledWith(CONST.COMPANY_CARDS_CREATE_FILE_FEED_HELP_URL, expect.any(String));
    });
});
