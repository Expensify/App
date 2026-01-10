import {NavigationContainer} from '@react-navigation/native';
import type * as NativeNavigation from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import {trackExpense} from '@libs/actions/IOU';
import {addPaymentCard, addSubscriptionPaymentCard} from '@libs/actions/PaymentMethods';
import {createWorkspace} from '@libs/actions/Policy/Policy';
import GoogleTagManager from '@libs/GoogleTagManager';
import OnboardingModalNavigator from '@libs/Navigation/AppNavigator/Navigators/OnboardingModalNavigator';
import navigationRef from '@libs/Navigation/navigationRef';
import {getCardForSubscriptionBilling} from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {FundList} from '@src/types/onyx';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/GoogleTagManager');

// Mock the Overlay since it doesn't work in tests
jest.mock('@libs/Navigation/AppNavigator/Navigators/Overlay');
jest.mock('@src/components/ConfirmedRoute.tsx');

// Mock navigation ref to prevent navigation errors
jest.mock('@libs/Navigation/navigationRef', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        getRootState: jest.fn(() => ({
            routes: [
                {
                    name: 'Main',
                    state: {
                        routes: [
                            {
                                name: 'Home',
                                params: {},
                            },
                        ],
                        index: 0,
                    },
                },
            ],
            index: 0,
        })),
        resetRoot: jest.fn(),
        navigate: jest.fn(),
        addListener: jest.fn(),
        isReady: jest.fn(() => true),
        getCurrentRoute: jest.fn(() => ({name: 'Home'})),
    },
}));

// Mock react-navigation/native to prevent navigation errors
jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const actualNav = jest.requireActual<typeof NativeNavigation>('@react-navigation/native');
    return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        ...actualNav,
        useNavigationState: () => true,
        useRoute: jest.fn(),
        useFocusEffect: jest.fn(),
        useIsFocused: () => true,
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: jest.fn(),
        }),
        createNavigationContainerRef: jest.fn(),
        createNavigatorFactory: jest.fn(() => jest.fn()),
    };
});

// Mock react-navigation/stack to prevent navigation errors
jest.mock('@react-navigation/stack', () => ({
    createStackNavigator: jest.fn(() => {
        const Stack = {
            Navigator: ({children}: {children: React.ReactNode}) => children,
            Screen: ({children}: {children: React.ReactNode}) => children,
        };
        return Stack;
    }),
    CardStyleInterpolators: {
        forHorizontalIOS: jest.fn(),
        forVerticalIOS: jest.fn(),
        forModalPresentationIOS: jest.fn(),
        forFadeFromBottomAndroid: jest.fn(),
        forRevealFromBottomAndroid: jest.fn(),
        forScaleFromCenterAndroid: jest.fn(),
        forNoAnimation: jest.fn(),
    },
}));

// Mock createPlatformStackNavigator
jest.mock('@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator', () => {
    return jest.fn(() => {
        const Stack = {
            Navigator: ({children}: {children: React.ReactNode}) => children,
            Screen: ({children}: {children: React.ReactNode}) => children,
        };
        return Stack;
    });
});

const FUND_LIST: FundList = {
    defaultCard: {
        isDefault: true,
        accountData: {
            cardYear: new Date().getFullYear(),
            cardMonth: new Date().getMonth() + 1,
            additionalData: {
                isBillingCard: true,
            },
        },
    },
};

describe('GoogleTagManagerTest', () => {
    const accountID = 123456;

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                session: {accountID},
            },
        });
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('sign_up', async () => {
        // When we render the OnboardingModal a few times
        const {rerender} = render(
            <NavigationContainer ref={navigationRef}>
                <OnboardingModalNavigator />
            </NavigationContainer>,
        );
        rerender(
            <NavigationContainer ref={navigationRef}>
                <OnboardingModalNavigator />
            </NavigationContainer>,
        );
        rerender(
            <NavigationContainer ref={navigationRef}>
                <OnboardingModalNavigator />
            </NavigationContainer>,
        );

        await waitForBatchedUpdatesWithAct();

        // Then we publish the sign_up event only once
        expect(GoogleTagManager.publishEvent).toHaveBeenCalledTimes(1);
        expect(GoogleTagManager.publishEvent).toHaveBeenCalledWith(CONST.ANALYTICS.EVENT.SIGN_UP, accountID);
    });

    test('workspace_created', async () => {
        // When we run the createWorkspace action a few times
        createWorkspace({introSelected: undefined, currentUserAccountIDParam: 123456, activePolicyID: undefined, currentUserEmailParam: 'test@test.com'});
        await waitForBatchedUpdatesWithAct();
        createWorkspace({currentUserAccountIDParam: 123456, activePolicyID: undefined, currentUserEmailParam: 'test@test.com', introSelected: undefined});
        await waitForBatchedUpdatesWithAct();
        createWorkspace({currentUserAccountIDParam: 123456, activePolicyID: undefined, currentUserEmailParam: 'test@test.com', introSelected: undefined});
        await waitForBatchedUpdatesWithAct();

        // Then we publish a workspace_created event only once
        expect(GoogleTagManager.publishEvent).toHaveBeenCalledTimes(1);
        expect(GoogleTagManager.publishEvent).toHaveBeenCalledWith(CONST.ANALYTICS.EVENT.WORKSPACE_CREATED, 123456);
    });

    test('workspace_created - categorizeTrackedExpense', async () => {
        trackExpense({
            report: {reportID: '123'},
            isDraftPolicy: true,
            action: CONST.IOU.ACTION.CATEGORIZE,
            participantParams: {
                payeeEmail: undefined,
                payeeAccountID: 0,
                participant: {accountID},
            },
            transactionParams: {
                amount: 1000,
                currency: 'USD',
                created: '2024-10-30',
                merchant: 'merchant',
                comment: 'comment',
                category: 'category',
                tag: 'tag',
                taxCode: 'taxCode',
                actionableWhisperReportActionID: 'actionableWhisperReportActionID',
                linkedTrackedExpenseReportAction: {actionName: 'IOU', reportActionID: 'linkedTrackedExpenseReportAction', created: '2024-10-30'},
                linkedTrackedExpenseReportID: 'linkedTrackedExpenseReportID',
            },
            isASAPSubmitBetaEnabled: false,
            currentUserAccountIDParam: accountID,
            currentUserEmailParam: 'test@test.com',
            introSelected: undefined,
            activePolicyID: undefined,
            quickAction: undefined,
            allBetas: [CONST.BETAS.ALL],
        });

        await waitForBatchedUpdatesWithAct();

        // Then we publish a workspace_created event only once
        expect(GoogleTagManager.publishEvent).toHaveBeenCalledTimes(1);
        expect(GoogleTagManager.publishEvent).toHaveBeenCalledWith('workspace_created', accountID);
    });

    test('paid_adoption - addPaymentCard', async () => {
        // When we add a payment card
        addPaymentCard(accountID, {
            expirationDate: '2077-10-30',
            addressZipCode: 'addressZipCode',
            cardNumber: 'cardNumber',
            nameOnCard: 'nameOnCard',
            securityCode: 'securityCode',
        });

        await waitForBatchedUpdatesWithAct();

        // Then we publish a paid_adoption event only once
        expect(GoogleTagManager.publishEvent).toHaveBeenCalledTimes(1);
        expect(GoogleTagManager.publishEvent).toHaveBeenCalledWith(CONST.ANALYTICS.EVENT.PAID_ADOPTION, accountID);
    });

    test('paid_adoption - addSubscriptionPaymentCard', async () => {
        // When we add a payment card (with no existing billing card)
        addSubscriptionPaymentCard(
            accountID,
            {
                cardNumber: 'cardNumber',
                cardYear: 'cardYear',
                cardMonth: 'cardMonth',
                cardCVV: 'cardCVV',
                addressName: 'addressName',
                addressZip: 'addressZip',
                currency: 'USD',
            },
            undefined,
        );

        await waitForBatchedUpdatesWithAct();

        // Then we publish a paid_adoption event only once
        expect(GoogleTagManager.publishEvent).toHaveBeenCalledTimes(1);
        expect(GoogleTagManager.publishEvent).toHaveBeenCalledWith(CONST.ANALYTICS.EVENT.PAID_ADOPTION, accountID);
    });

    it('addSubscriptionPaymentCard when changing payment card, will not publish event paid_adoption', async () => {
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.FUND_LIST]: FUND_LIST,
            });
        });

        addSubscriptionPaymentCard(
            accountID,
            {
                cardNumber: 'cardNumber',
                cardYear: 'cardYear',
                cardMonth: 'cardMonth',
                cardCVV: 'cardCVV',
                addressName: 'addressName',
                addressZip: 'addressZip',
                currency: 'USD',
            },
            FUND_LIST,
        );

        await waitForBatchedUpdatesWithAct();

        expect(!!getCardForSubscriptionBilling(FUND_LIST)).toBe(true);
        expect(GoogleTagManager.publishEvent).toHaveBeenCalledTimes(0);
    });
});
