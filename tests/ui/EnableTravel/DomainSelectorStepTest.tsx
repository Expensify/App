import {act, fireEvent, render, screen, within} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {setTravelProvisioningDomain} from '@libs/actions/Travel';
import type * as TravelActions from '@libs/actions/Travel';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';

import DomainSelectorStep from '@pages/Travel/EnableTravel/subPages/DomainSelectorStep';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type ReactNative from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const RECOMMENDED_DOMAIN = 'domain-a.com';
const OTHER_DOMAIN = 'domain-b.com';
const RECOMMENDED_BADGE_TEXT = 'travel.domainSelector.recommended';

const mockOnNext = jest.fn();

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));

jest.mock('@libs/actions/Travel', () => ({
    ...jest.requireActual<typeof TravelActions>('@libs/actions/Travel'),
    setTravelProvisioningDomain: jest.fn(),
}));

// FlashList measures its viewport before rendering rows, which never happens in Jest, so render every row eagerly.
jest.mock('@shopify/flash-list', () => {
    const ReactLocal = jest.requireActual<typeof React>('react');
    const RN = jest.requireActual<typeof ReactNative>('react-native');

    const FlashList = ReactLocal.forwardRef<
        unknown,
        Omit<React.ComponentProps<typeof RN.ScrollView>, 'children'> & {
            data?: unknown[];
            renderItem?: (info: {item: unknown; index: number; target: string}) => React.ReactNode;
            keyExtractor?: (item: unknown, index: number) => string;
            ListHeaderComponent?: React.ReactNode;
            ListFooterComponent?: React.ReactNode;
            getItemType?: unknown;
            extraData?: unknown;
            initialScrollIndex?: number;
            onEndReached?: unknown;
            onEndReachedThreshold?: unknown;
            ListFooterComponentStyle?: unknown;
        }
    >(
        (
            {
                data,
                renderItem,
                keyExtractor,
                ListHeaderComponent,
                ListFooterComponent,
                getItemType: _getItemType,
                extraData: _extraData,
                initialScrollIndex: _initialScrollIndex,
                onEndReached: _onEndReached,
                onEndReachedThreshold: _onEndReachedThreshold,
                ListFooterComponentStyle: _ListFooterComponentStyle,
                ...scrollViewProps
            },
            ref,
        ) => {
            ReactLocal.useImperativeHandle(ref, () => ({scrollToIndex: jest.fn()}));

            return ReactLocal.createElement(
                RN.ScrollView,
                scrollViewProps,
                ListHeaderComponent ?? null,
                ...(data ?? []).map((item, index) =>
                    ReactLocal.createElement(ReactLocal.Fragment, {key: keyExtractor?.(item, index) ?? String(index)}, renderItem?.({item, index, target: 'Cell'})),
                ),
                ListFooterComponent ?? null,
            );
        },
    );

    return {FlashList};
});

const mockSetTravelProvisioningDomain = jest.mocked(setTravelProvisioningDomain);

// Two admins on domain-a.com and one on domain-b.com, so domain-a.com is the most frequent admin domain.
const POLICY: Policy = {
    ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
    owner: `admin1@${RECOMMENDED_DOMAIN}`,
    employeeList: {
        [`admin1@${RECOMMENDED_DOMAIN}`]: {email: `admin1@${RECOMMENDED_DOMAIN}`, role: CONST.POLICY.ROLE.ADMIN},
        [`admin2@${RECOMMENDED_DOMAIN}`]: {email: `admin2@${RECOMMENDED_DOMAIN}`, role: CONST.POLICY.ROLE.ADMIN},
        [`admin3@${OTHER_DOMAIN}`]: {email: `admin3@${OTHER_DOMAIN}`, role: CONST.POLICY.ROLE.ADMIN},
    },
};

const Stack = createPlatformStackNavigator();

function DomainSelectorStepScreen() {
    return (
        <DomainSelectorStep
            isEditing={false}
            onNext={mockOnNext}
            onMove={jest.fn()}
            policy={POLICY}
            policyID={POLICY.id}
            resolvedDomain={RECOMMENDED_DOMAIN}
        />
    );
}

function renderStep() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider]}>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen
                        name="DomainSelectorStepScreen"
                        component={DomainSelectorStepScreen}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </ComposeProviders>,
    );
}

describe('DomainSelectorStep', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('shows the "Recommended" badge only on the most frequent admin email domain', async () => {
        // Given a workspace whose admins are mostly on domain-a.com
        renderStep();
        await waitForBatchedUpdatesWithAct();

        // When the domain selector renders its rows
        const recommendedRow = screen.getByRole('option', {name: RECOMMENDED_DOMAIN});
        const otherRow = screen.getByRole('option', {name: OTHER_DOMAIN});

        // Then the badge is composed into the recommended row only
        expect(screen.getAllByText(RECOMMENDED_BADGE_TEXT)).toHaveLength(1);
        expect(within(recommendedRow).getByText(RECOMMENDED_BADGE_TEXT)).toBeOnTheScreen();
        expect(within(otherRow).queryByText(RECOMMENDED_BADGE_TEXT)).not.toBeOnTheScreen();
    });

    it('stores the selected domain and advances only after a domain is picked', async () => {
        // Given the domain selector with no domain selected yet
        renderStep();
        await waitForBatchedUpdatesWithAct();

        // When Next is pressed before any selection
        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();

        // Then nothing is stored and the flow does not advance
        expect(mockSetTravelProvisioningDomain).not.toHaveBeenCalled();
        expect(mockOnNext).not.toHaveBeenCalled();

        // When a non-recommended domain is picked and Next is pressed
        fireEvent.press(screen.getByRole('option', {name: OTHER_DOMAIN}));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();

        // Then that domain is stored for provisioning and the flow advances once
        expect(mockSetTravelProvisioningDomain).toHaveBeenCalledWith(OTHER_DOMAIN);
        expect(mockOnNext).toHaveBeenCalledTimes(1);
    });
});
