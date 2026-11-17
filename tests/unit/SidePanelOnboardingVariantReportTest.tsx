import {renderHook, waitFor} from '@testing-library/react-native';

import SidePanelContextProvider from '@components/SidePanel/SidePanelContextProvider';

import useSidePanelDisplayStatus from '@hooks/useSidePanelDisplayStatus';
import useSidePanelReportID from '@hooks/useSidePanelReportID';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnboardingRHPVariant} from '@src/types/onyx';

import type {PropsWithChildren} from 'react';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@hooks/useSidePanelDisplayStatus');

const mockUseSidePanelDisplayStatus = jest.mocked(useSidePanelDisplayStatus);

const POLICY_ID = 'POLICY_1';
const ADMINS_ROOM_REPORT_ID = '200';
const CONCIERGE_REPORT_ID = '100';
const ADMIN_EMAIL = 'admin@example.com';

function wrapper({children}: PropsWithChildren) {
    return <SidePanelContextProvider>{children}</SidePanelContextProvider>;
}

/**
 * Sets up an admin of an active workspace whose #admins room exists. That is the account shape where the older RHP arms
 * point the side panel at #admins, so it is the shape that proves which report a variant opens.
 */
async function setUpWorkspaceAdmin(variant: OnboardingRHPVariant) {
    await Onyx.multiSet({
        [ONYXKEYS.SESSION]: {email: ADMIN_EMAIL, accountID: 1},
        [ONYXKEYS.CONCIERGE_REPORT_ID]: CONCIERGE_REPORT_ID,
        [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: POLICY_ID,
        [ONYXKEYS.NVP_ONBOARDING_RHP_VARIANT]: variant,
    });
    await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {
        ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
        id: POLICY_ID,
        role: CONST.POLICY.ROLE.ADMIN,
        chatReportIDAdmins: Number(ADMINS_ROOM_REPORT_ID),
        pendingAction: null,
    });
    await waitForBatchedUpdates();
}

describe('SidePanelContextProvider report for the onboarding RHP variants', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        // The user opens the side panel without asking for a specific report, the way the Concierge button on Home does
        mockUseSidePanelDisplayStatus.mockReturnValue({
            sidePanelNVP: {open: true, openNarrowScreen: false, forceConcierge: false},
            shouldHideSidePanel: false,
            isSidePanelHiddenOrLargeScreen: false,
            shouldHideHelpButton: true,
            shouldHideSidePanelBackdrop: true,
        });
    });

    it('opens the Concierge DM, not #admins, for the homePageNoRHP variant', async () => {
        // Given a workspace admin in the homePageNoRHP arm, whose #admins room exists
        await setUpWorkspaceAdmin(CONST.ONBOARDING_RHP_VARIANT.HOME_PAGE_NO_RHP);

        // When the side panel is opened from Home
        const {result} = renderHook(() => useSidePanelReportID(), {wrapper});

        // Then it shows the Concierge DM, because this arm keeps onboarding on Home and does not use #admins
        await waitFor(() => expect(result.current).toBe(CONCIERGE_REPORT_ID));
    });

    it('still opens #admins for the rhpAdminsRoom variant', async () => {
        // Given the same admin in the rhpAdminsRoom arm, which the running experiment still relies on
        await setUpWorkspaceAdmin(CONST.ONBOARDING_RHP_VARIANT.RHP_ADMINS_ROOM);

        // When the side panel is opened
        const {result} = renderHook(() => useSidePanelReportID(), {wrapper});

        // Then it still shows #admins, so the new arm leaves the existing arms unchanged
        await waitFor(() => expect(result.current).toBe(ADMINS_ROOM_REPORT_ID));
    });
});
