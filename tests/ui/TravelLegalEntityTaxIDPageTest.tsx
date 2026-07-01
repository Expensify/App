import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import * as useResponsiveLayoutModule from '@hooks/useResponsiveLayout';
import {setTravelProvisioningTaxID} from '@libs/actions/Travel';
import type * as TravelActions from '@libs/actions/Travel';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import createPlatformStackNavigator from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator';
import type {TravelNavigatorParamList} from '@navigation/types';
import TravelLegalEntityTaxIDPage from '@pages/Travel/TravelLegalEntityTaxIDPage';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const DOMAIN = 'example.com';
const POLICY_ID = 'policy-1';
const TERMS_ROUTE = 'travel/example.com/accept/policy-1';

jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => ({
    __esModule: true,
    default: jest.fn(() => 'travel/example.com/accept/policy-1'),
}));

jest.mock('@libs/actions/Travel', () => ({
    ...jest.requireActual<typeof TravelActions>('@libs/actions/Travel'),
    setTravelProvisioningTaxID: jest.fn(),
}));

const mockSetTravelProvisioningTaxID = jest.mocked(setTravelProvisioningTaxID);
const mockCreateDynamicRoute = jest.mocked(createDynamicRoute);
const navigate = jest.spyOn(Navigation, 'navigate');

const Stack = createPlatformStackNavigator<TravelNavigatorParamList>();

function renderPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <PortalProvider>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen
                            name={SCREENS.TRAVEL.LEGAL_ENTITY_TAX_ID}
                            component={TravelLegalEntityTaxIDPage}
                            initialParams={{domain: DOMAIN, policyID: POLICY_ID}}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </PortalProvider>
        </ComposeProviders>,
    );
}

describe('TravelLegalEntityTaxIDPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(() => {
        jest.spyOn(useResponsiveLayoutModule, 'default').mockReturnValue({
            shouldUseNarrowLayout: false,
            isSmallScreenWidth: false,
            isInNarrowPaneModal: false,
            isExtraSmallScreenHeight: false,
            isMediumScreenWidth: false,
            isLargeScreenWidth: true,
            isExtraLargeScreenWidth: false,
            isExtraSmallScreenWidth: false,
            isSmallScreen: false,
            onboardingIsMediumOrLargerScreenWidth: true,
            isInLandscapeMode: false,
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('renders the tax ID prompt', async () => {
        renderPage();
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText(TestHelper.translateLocal('travel.taxID.subtitle'))).toBeTruthy();
    });

    it('shows a validation error and does not submit when the tax ID is empty', async () => {
        renderPage();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(TestHelper.translateLocal('common.continue')));
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(screen.getByText(TestHelper.translateLocal('travel.taxID.error.required'))).toBeTruthy();
        });
        expect(mockSetTravelProvisioningTaxID).not.toHaveBeenCalled();
    });

    it('stores the trimmed tax ID and navigates to the terms page on submit', async () => {
        renderPage();
        await waitForBatchedUpdatesWithAct();

        fireEvent.changeText(screen.getByLabelText(TestHelper.translateLocal('travel.taxID.inputLabel')), '  DE123456789  ');
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(TestHelper.translateLocal('common.continue')));
        await waitForBatchedUpdatesWithAct();

        await waitFor(() => {
            expect(mockSetTravelProvisioningTaxID).toHaveBeenCalledWith('DE123456789');
        });
        expect(mockCreateDynamicRoute).toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledWith(TERMS_ROUTE);
    });
});
