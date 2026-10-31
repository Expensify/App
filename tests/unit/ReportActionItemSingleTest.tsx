import {act, screen, waitFor} from '@testing-library/react-native';

import Text from '@components/Text';

import {setHasRadio} from '@libs/NetworkState';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report, ReportAction} from '@src/types/onyx';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {StyleSheet} from 'react-native';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

describe('ReportActionItemSingle', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        }),
    );

    beforeEach(async () => {
        // Wrap Onyx each onyx action with waitForBatchedUpdates
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        // Initialize the network key for OfflineWithFeedback
        setHasRadio(true);
    });

    // Clear out Onyx after each test so that each test starts with a clean slate
    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    describe('when the Report is a DM chat', () => {
        describe('component properly renders both avatar & name of the sender', () => {
            const fakeReport = {...LHNTestUtils.getFakeReportWithPolicy([1, 2]), chatType: undefined};
            const fakeReportAction = LHNTestUtils.getFakeAdvancedReportAction();
            const fakePolicy = LHNTestUtils.getFakePolicy(fakeReport.policyID);
            const faceAccountId = fakeReportAction.actorAccountID ?? CONST.DEFAULT_NUMBER_ID;
            const fakePersonalDetails: PersonalDetailsList = {
                [faceAccountId]: {
                    accountID: faceAccountId,
                    login: 'email1@test.com',
                    displayName: 'Email One',
                    avatar: 'https://example.com/avatar.png',
                    firstName: 'One',
                },
            };

            async function setup() {
                const policyCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [fakePolicy], (item) => item.id);
                await waitForBatchedUpdatesWithAct();
                await act(async () => {
                    await Onyx.multiSet({
                        [ONYXKEYS.PERSONAL_DETAILS_LIST]: fakePersonalDetails,
                        [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
                        [ONYXKEYS.COLLECTION.REPORT_ACTIONS]: {
                            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${fakeReport.reportID}`]: {
                                [fakeReportAction.reportActionID]: fakeReportAction,
                            },
                        },
                        [ONYXKEYS.COLLECTION.REPORT]: {
                            [fakeReport.reportID]: fakeReport,
                        },
                        ...policyCollectionDataSet,
                    });
                    await waitForBatchedUpdatesWithAct();
                });
                LHNTestUtils.getDefaultRenderedReportActionItemSingle(fakeReport, fakeReportAction);
                await waitForBatchedUpdatesWithAct();
            }

            it('renders avatar properly', async () => {
                const expectedIconTestID = 'SingleAvatar';

                await setup();
                await waitFor(() => {
                    expect(screen.getByTestId(expectedIconTestID)).toBeOnTheScreen();
                });
            });

            it('renders Person information', async () => {
                const [expectedPerson] = fakeReportAction.person ?? [];

                await setup();
                await waitFor(() => {
                    expect(screen.getByText(expectedPerson.text ?? '')).toBeOnTheScreen();
                });
            });
        });
    });

    describe('when the action is an IOU report preview', () => {
        const OWNER_ACCOUNT_ID = 11;
        const MANAGER_ACCOUNT_ID = 12;
        const dm: Report = {reportID: '700', type: CONST.REPORT.TYPE.CHAT};
        const iouReport: Report = {
            reportID: '701',
            type: CONST.REPORT.TYPE.IOU,
            chatReportID: '700',
            parentReportID: '700',
            parentReportActionID: '702',
            ownerAccountID: OWNER_ACCOUNT_ID,
            managerID: MANAGER_ACCOUNT_ID,
        };
        const reportPreview = {
            reportActionID: '702',
            actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            actorAccountID: OWNER_ACCOUNT_ID,
            created: '2024-01-01 00:00:00',
            childReportID: '701',
            originalMessage: {linkedReportID: '701'},
        } as ReportAction;

        it('names both the manager and the owner when the report has no single sender', async () => {
            // Given an IOU report both people added expenses to, previewed in their DM
            await act(async () => {
                await Promise.all([
                    Onyx.merge(ONYXKEYS.IS_LOADING_REPORT_DATA, false),
                    Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                        [OWNER_ACCOUNT_ID]: {accountID: OWNER_ACCOUNT_ID, login: 'owner@test.com', displayName: 'Owner Person'},
                        [MANAGER_ACCOUNT_ID]: {accountID: MANAGER_ACCOUNT_ID, login: 'manager@test.com', displayName: 'Manager Person'},
                    }),
                    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${dm.reportID}`, dm),
                    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`, iouReport),
                    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${dm.reportID}`, {[reportPreview.reportActionID]: reportPreview}),
                ]);
                await waitForBatchedUpdatesWithAct();
            });

            // When its preview row renders
            LHNTestUtils.getDefaultRenderedReportActionItemSingle(dm, reportPreview, undefined, iouReport);
            await waitForBatchedUpdatesWithAct();

            // Then the header names both people and the avatars sit diagonally
            await waitFor(() => {
                expect(screen.getByText('Manager Person & Owner Person')).toBeOnTheScreen();
            });
            expect(screen.getByTestId('ReportActionAvatars-MultipleAvatars')).toBeOnTheScreen();
        });
    });

    describe('moderation flagging', () => {
        const CHILD_TEST_ID = 'children-under-flagged-wrapper';

        function makeActionWithHiddenDecision(actionName: typeof CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT | typeof CONST.REPORT.ACTIONS.TYPE.IOU): ReportAction {
            return {
                ...LHNTestUtils.getFakeAdvancedReportAction(actionName),
                message: [
                    {
                        type: 'COMMENT',
                        html: 'message',
                        text: 'message',
                        moderationDecision: {decision: CONST.MODERATION.MODERATOR_DECISION_HIDDEN},
                    },
                ],
            } as ReportAction;
        }

        async function setupReportActionItemSingle(action: ReportAction, report: Report) {
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
                    [ONYXKEYS.PERSONAL_DETAILS_LIST]: {},
                    [ONYXKEYS.COLLECTION.REPORT]: {
                        [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                    },
                });
                await waitForBatchedUpdatesWithAct();
            });
            LHNTestUtils.getDefaultRenderedReportActionItemSingle(report, action, <Text testID={CHILD_TEST_ID}>child</Text>);
            await waitForBatchedUpdatesWithAct();
        }

        type Ancestor = {props: {style?: unknown}; parent: Ancestor | null};
        function isModerationFlagStyle(style: unknown): style is StyleProp<Pick<ViewStyle, 'borderLeftWidth'>> {
            if (Array.isArray(style)) {
                return style.every(isModerationFlagStyle);
            }
            if (style === undefined || style === null || style === false || style === '') {
                return true;
            }
            return typeof style === 'object' && (!('borderLeftWidth' in style) || style.borderLeftWidth === undefined || typeof style.borderLeftWidth === 'number');
        }

        function findFlaggedAncestor(start: Ancestor | null): Ancestor | null {
            let cursor = start;
            while (cursor) {
                const style = cursor.props.style;
                if (isModerationFlagStyle(style) && StyleSheet.flatten(style)?.borderLeftWidth !== undefined) {
                    return cursor;
                }
                cursor = cursor.parent;
            }
            return null;
        }

        it('does not apply blockquote styling for non-ADD_COMMENT actions even when the message carries a hidden decision', async () => {
            const fakeReport = LHNTestUtils.getFakeReportWithPolicy([1, 2]);
            const action = makeActionWithHiddenDecision(CONST.REPORT.ACTIONS.TYPE.IOU);

            await setupReportActionItemSingle(action, fakeReport);

            await waitFor(() => {
                const child = screen.getByTestId(CHILD_TEST_ID);
                expect(findFlaggedAncestor(child.parent)).toBeNull();
            });
        });

        it('applies blockquote styling for ADD_COMMENT actions when the message carries a hidden decision', async () => {
            const fakeReport = LHNTestUtils.getFakeReportWithPolicy([1, 2]);
            const action = makeActionWithHiddenDecision(CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT);

            await setupReportActionItemSingle(action, fakeReport);

            await waitFor(() => {
                const child = screen.getByTestId(CHILD_TEST_ID);
                const wrapper = findFlaggedAncestor(child.parent);
                expect(wrapper).not.toBeNull();
                expect(wrapper).toHaveStyle({borderLeftWidth: 4});
            });
        });
    });
});
