import {act, render, screen, waitFor} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import {ModalProvider} from '@components/Modal/Global/ModalContext';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider} from '@hooks/useCurrentReportID';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';

import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import type {SettingsNavigatorParamList} from '@navigation/types';

import RulesRequireFieldsPage from '@pages/workspace/rules/RulesRequireFieldsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Beta, Policy, PolicyTagLists} from '@src/types/onyx';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

TestHelper.setupGlobalFetchMock();

const Stack = createPlatformStackNavigator<SettingsNavigatorParamList>();

const renderRulesPage = (policyID: string) => {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <PortalProvider>
                <ModalProvider>
                    <NavigationContainer>
                        <Stack.Navigator initialRouteName={SCREENS.WORKSPACE.RULES_REQUIRE_FIELDS}>
                            <Stack.Screen
                                name={SCREENS.WORKSPACE.RULES_REQUIRE_FIELDS}
                                component={RulesRequireFieldsPage}
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

const setupPolicy = async (policyTags: PolicyTagLists, hasMultipleTagLists: boolean, policyOverrides: Partial<Policy> = {}, betas: Beta[] = []) => {
    await TestHelper.signInWithTestUser();
    // signInWithTestUser seeds BETAS with 'all'. Pin the exact list so an unrelated beta can't change what renders.
    await act(async () => {
        await Onyx.set(ONYXKEYS.BETAS, betas);
    });
    const policy = {
        ...LHNTestUtils.getFakePolicy(),
        role: CONST.POLICY.ROLE.ADMIN,
        areTagsEnabled: true,
        hasMultipleTagLists,
        ...policyOverrides,
    };
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy.id}`, policyTags);
    });
    return policy;
};

describe('RulesRequireFieldsPage tag toggle visibility', () => {
    const getRulesTagLabel = () => TestHelper.translateLocal('workspace.rules.requireFields.tag');
    const getRulesCategoryLabel = () => TestHelper.translateLocal('workspace.rules.requireFields.category');

    // The page needs an admin on a Control workspace with the Rules feature on.
    const setupRulesPolicy = async (policyTags: PolicyTagLists, hasMultipleTagLists: boolean) =>
        setupPolicy(policyTags, hasMultipleTagLists, {type: CONST.POLICY.TYPE.CORPORATE, areRulesEnabled: true});

    it('shows the "Tag" toggle for single-level tags', async () => {
        const policy = await setupRulesPolicy(singleLevelTags, false);
        const {unmount} = renderRulesPage(policy.id);
        await waitForBatchedUpdatesWithAct();

        // The category toggle is always present; wait on its accessibility label before asserting the tag toggle.
        // The row title and its switch can both carry the label, so use the All variants.
        await waitFor(() => {
            expect(screen.getAllByLabelText(getRulesCategoryLabel()).at(0)).toBeOnTheScreen();
        });
        expect(screen.getAllByLabelText(getRulesTagLabel()).at(0)).toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('shows the "Tag" toggle for dependent multi-level tags', async () => {
        const policy = await setupRulesPolicy(dependentMultiLevelTags, true);
        const {unmount} = renderRulesPage(policy.id);
        await waitForBatchedUpdatesWithAct();

        // The category toggle is always present; wait on its accessibility label before asserting the tag toggle.
        // The row title and its switch can both carry the label, so use the All variants.
        await waitFor(() => {
            expect(screen.getAllByLabelText(getRulesCategoryLabel()).at(0)).toBeOnTheScreen();
        });
        expect(screen.getAllByLabelText(getRulesTagLabel()).at(0)).toBeOnTheScreen();

        unmount();
        await waitForBatchedUpdatesWithAct();
    });

    it('hides the "Tag" toggle for independent multi-level tags', async () => {
        const policy = await setupRulesPolicy(independentMultiLevelTags, true);
        const {unmount} = renderRulesPage(policy.id);
        await waitForBatchedUpdatesWithAct();

        // The category toggle is always present, so wait on its accessibility label before asserting the tag toggle is absent.
        // The row title and its switch can both carry the label, so use the All variants.
        await waitFor(() => {
            expect(screen.getAllByLabelText(getRulesCategoryLabel()).at(0)).toBeOnTheScreen();
        });
        expect(screen.queryAllByLabelText(getRulesTagLabel())).toHaveLength(0);

        unmount();
        await waitForBatchedUpdatesWithAct();
    });
});
