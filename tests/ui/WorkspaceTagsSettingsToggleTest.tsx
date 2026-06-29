import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {SettingsNavigatorParamList} from '@navigation/types';
import WorkspaceTagsSettingsPage from '@pages/workspace/tags/WorkspaceTagsSettingsPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {PolicyTagLists} from '@src/types/onyx';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const renderSettingsPage = (policyID: string) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.DYNAMIC_TAGS_SETTINGS}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.DYNAMIC_TAGS_SETTINGS}
                                component={WorkspaceTagsSettingsPage}
                                initialParams={{policyID}}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </ModalProvider>
            </PortalProvider>
        </ComposeProviders>,
    );
};

const singleLevelTags: PolicyTagLists = {
    Department: {
        name: 'Department',
        orderWeight: 0,
        required: false,
        tags: {
            Engineering: {name: 'Engineering', enabled: true},
            Sales: {name: 'Sales', enabled: true},
        },
    },
};

const independentMultiLevelTags: PolicyTagLists = {
    Department: {
        name: 'Department',
        orderWeight: 0,
        required: false,
        tags: {
            Engineering: {name: 'Engineering', enabled: true},
            Sales: {name: 'Sales', enabled: true},
        },
    },
    Region: {
        name: 'Region',
        orderWeight: 1,
        required: false,
        tags: {
            Europe: {name: 'Europe', enabled: true},
            Asia: {name: 'Asia', enabled: true},
        },
    },
};

// Dependent multi-level tags carry a parentTagsFilter on the child level.
const dependentMultiLevelTags: PolicyTagLists = {
    Department: {
        name: 'Department',
        orderWeight: 0,
        required: false,
        tags: {
            Engineering: {name: 'Engineering', enabled: true},
            Sales: {name: 'Sales', enabled: true},
        },
    },
    Region: {
        name: 'Region',
        orderWeight: 1,
        required: false,
        tags: {
            Europe: {name: 'Europe', enabled: true, parentTagsFilter: 'Engineering'},
            Asia: {name: 'Asia', enabled: true, parentTagsFilter: 'Sales'},
        },
    },
};

const getRequiresTagLabel = () => TestHelper.translateLocal('workspace.tags.requiresTag');

describe('WorkspaceTagsSettingsPage required-tag toggle visibility', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        });
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
            shouldUseNarrowLayout: true,
            isSmallScreenWidth: true,
            isInNarrowPaneModal: false,
            isExtraSmallScreenHeight: false,
            isMediumScreenWidth: false,
            isLargeScreenWidth: false,
            isExtraLargeScreenWidth: false,
            isExtraSmallScreenWidth: false,
            isSmallScreen: true,
            onboardingIsMediumOrLargerScreenWidth: false,
            isInLandscapeMode: false,
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    const setupPolicy = async (policyTags: PolicyTagLists, hasMultipleTagLists: boolean) => {
        await TestHelper.signInWithTestUser();
        const policy = {
            ...LHNTestUtils.getFakePolicy(),
            role: CONST.POLICY.ROLE.ADMIN,
            areTagsEnabled: true,
            hasMultipleTagLists,
        };
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy.id}`, policyTags);
        });
        return policy;
    };

    it('shows the "Members must tag all expenses" toggle for single-level tags', async () => {
        const policy = await setupPolicy(singleLevelTags, false);
        const {unmount} = renderSettingsPage(policy.id);
        await waitForBatchedUpdatesWithAct();

        // The billable toggle is always present; wait on its accessibility label before asserting the required toggle.
        await waitFor(() => {
            expect(screen.getByLabelText(TestHelper.translateLocal('workspace.tags.trackBillable'))).toBeOnTheScreen();
        });
        expect(screen.getByLabelText(getRequiresTagLabel())).toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('shows the "Members must tag all expenses" toggle for dependent multi-level tags', async () => {
        const policy = await setupPolicy(dependentMultiLevelTags, true);
        const {unmount} = renderSettingsPage(policy.id);
        await waitForBatchedUpdatesWithAct();

        // The billable toggle is always present; wait on its accessibility label before asserting the required toggle.
        await waitFor(() => {
            expect(screen.getByLabelText(TestHelper.translateLocal('workspace.tags.trackBillable'))).toBeOnTheScreen();
        });
        expect(screen.getByLabelText(getRequiresTagLabel())).toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('hides the "Members must tag all expenses" toggle for independent multi-level tags', async () => {
        const policy = await setupPolicy(independentMultiLevelTags, true);
        const {unmount} = renderSettingsPage(policy.id);
        await waitForBatchedUpdatesWithAct();

        // The billable toggle is always present, so wait on its label before asserting the required toggle is absent.
        await waitFor(() => {
            expect(screen.getByLabelText(TestHelper.translateLocal('workspace.tags.trackBillable'))).toBeOnTheScreen();
        });
        expect(screen.queryByLabelText(getRequiresTagLabel())).not.toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
