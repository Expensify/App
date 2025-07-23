import {render, screen} from '@testing-library/react-native';
import type {FC} from 'react';
import Onyx from 'react-native-onyx';
import {MagnifyingGlassSpyMouthClosed, MessageInABottle, MoneyWaving} from '@components/Icon/Expensicons';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ReportAvatar from '@components/ReportAvatar';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
import {actionR14932, actionR98765} from '../../__mocks__/reportData/actions';
import personalDetails from '../../__mocks__/reportData/personalDetails';
import {policy420A} from '../../__mocks__/reportData/policies';
import {chatReportR14932, iouReportR14932} from '../../__mocks__/reportData/reports';
import {transactionR14932, transactionR98765} from '../../__mocks__/reportData/transactions';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const loggedUserID = iouReportR14932.ownerAccountID;

const subIcon = {
    source: MagnifyingGlassSpyMouthClosed,
    width: 20,
    height: 20,
    fill: '',
};

const SVGToAvatar = (svg: FC) => ({
    source: svg,
    type: CONST.ICON_TYPE_AVATAR,
});

const defaultProperties: Parameters<typeof ReportAvatar>[0] = {
    reportID: undefined,
    action: undefined,
    accountIDs: undefined,
    subIcon,
    subscriptFallbackIcon: SVGToAvatar(MessageInABottle),
    reverseAvatars: false,
    convertSubscriptToMultiple: false,
    sortAvatarsByID: false,
    sortAvatarsByName: false,
    fallbackIconForMultipleAvatars: MoneyWaving,
    shouldStackHorizontally: false,
    shouldDisplayAvatarsInRows: false,
    shouldShowTooltip: true,
    maxAvatarsInRow: CONST.AVATAR_ROW_SIZE.DEFAULT,
    overlapDivider: 3,
};

const reportActions = [{[actionR14932.reportActionID]: actionR14932}, {[actionR98765.reportActionID]: actionR98765}];
const transactions = [transactionR14932, transactionR98765];
const reports = [iouReportR14932, chatReportR14932];
const policies = [policy420A];

const transactionCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.TRANSACTION, transactions, (transaction) => transaction.transactionID);
const reportActionCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.REPORT_ACTIONS, reportActions, (actions) => Object.values(actions).at(0)?.childReportID);
const reportCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.REPORT, reports, (report) => report.reportID);
const policiesCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, policies, (item) => item.id);

const personalDetailsWithChangedAvatar = {...personalDetails, [loggedUserID]: {...personalDetails[loggedUserID], avatar: MoneyWaving}};

function renderAvatar(props: Parameters<typeof ReportAvatar>[0]) {
    return render(
        <OnyxListItemProvider>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <ReportAvatar {...props} />
        </OnyxListItemProvider>,
    );
}

describe('ReportAvatar', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: loggedUserID, email: personalDetails[loggedUserID].login},
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetailsWithChangedAvatar,
                [ONYXKEYS.COLLECTION.POLICY]: policiesCollectionDataSet,
                [ONYXKEYS.COLLECTION.TRANSACTION]: transactionCollectionDataSet,
                [ONYXKEYS.COLLECTION.REPORT_ACTIONS]: reportActionCollectionDataSet,
                [ONYXKEYS.COLLECTION.REPORT]: reportCollectionDataSet,
            },
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    it('renders properly when single account ID is passed', async () => {
        renderAvatar({...defaultProperties, accountIDs: [loggedUserID]});

        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId(`ReportAvatar-MultipleAvatars-OneIcon--${loggedUserID}`)).toBeOnTheScreen();
    });

    afterAll(async () => {
        await Onyx.clear();
    });
});
