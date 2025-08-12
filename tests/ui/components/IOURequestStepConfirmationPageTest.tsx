import {render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import IOURequestStepConfirmationWithWritableReportOrNotFound from '@pages/iou/request/step/IOURequestStepConfirmation';
import ONYXKEYS from '@src/ONYXKEYS';
import * as IOU from '../../../src/libs/actions/IOU';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@rnmapbox/maps', () => {
    return {
        default: jest.fn(),
        MarkerView: jest.fn(),
        setAccessToken: jest.fn(),
    };
});
jest.mock('@react-native-community/geolocation', () => ({
    setRNConfiguration: jest.fn(),
}));
jest.mock('@libs/actions/IOU', () => {
    const actualNav = jest.requireActual<typeof IOU>('@libs/actions/IOU');
    return {
        ...actualNav,
        startMoneyRequest: jest.fn(),
    };
});
jest.mock('@libs/Fullstory');
jest.mock('@components/ProductTrainingContext', () => ({
    useProductTrainingContext: () => [false],
}));
jest.mock('@components/Tooltip/EducationalTooltip');
jest.mock('@src/hooks/useResponsiveLayout');
jest.mock('@react-navigation/native', () => ({
    createNavigationContainerRef: jest.fn(),
    useIsFocused: () => true,
    useNavigation: () => ({navigate: jest.fn(), addListener: jest.fn()}),
    useFocusEffect: jest.fn(),
    usePreventRemove: jest.fn(),
}));

describe('IOURequestStepConfirmationPageTest', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    it('should not restart the money request creation flow when sending invoice from global FAB', async () => {
        // Given an invoice creation flow started from global FAB menu
        const TRANSACTION_ID = '1';
        const routeReportID = '1';
        const participantReportID = '2';

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
            transactionID: TRANSACTION_ID,
            isFromGlobalCreate: true,
            participants: [
                {
                    accountID: 1,
                    reportID: participantReportID,
                    iouType: 'invoice',
                },
            ],
        });

        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <IOURequestStepConfirmationWithWritableReportOrNotFound
                        route={{
                            key: 'Money_Request_Step_Confirmation--30aPPAdjWan56sE5OpcG',
                            name: 'Money_Request_Step_Confirmation',
                            params: {
                                action: 'create',
                                iouType: 'invoice',
                                transactionID: TRANSACTION_ID,
                                reportID: routeReportID,
                            },
                        }}
                        // @ts-expect-error we don't need navigation param here.
                        navigation={undefined}
                    />
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdates();

        // Then startMoneyRequest should not be called from IOURequestConfirmationPage.
        expect(IOU.startMoneyRequest).not.toBeCalled();
    });
});
