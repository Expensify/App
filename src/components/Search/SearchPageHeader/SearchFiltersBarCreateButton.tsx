import {emailSelector} from '@selectors/Session';
import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu from '@components/PopoverMenu';
import useCreateReportAction from '@hooks/useCreateReportAction';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useThemeStyles from '@hooks/useThemeStyles';
import {startDistanceRequest, startMoneyRequest} from '@libs/actions/IOU';
import {createNewReport} from '@libs/actions/Report';
import getIconForAction from '@libs/getIconForAction';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getDefaultChatEnabledPolicy} from '@libs/PolicyUtils';
import {generateReportID, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {groupPaidPoliciesWithExpenseChatEnabledSelector} from '@src/selectors/Policy';
import type * as OnyxTypes from '@src/types/onyx';

function SearchFiltersBarCreateButton() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Plus', 'Location', 'Document', 'Receipt', 'Coins', 'Cash', 'Transfer', 'MoneyCircle']);

    const createButtonRef = useRef<View>(null);
    const [isCreateMenuActive, setIsCreateMenuActive] = useState(false);
    const [createMenuPosition, setCreateMenuPosition] = useState<{horizontal: number; vertical: number}>({horizontal: 0, vertical: 0});
    const {calculatePopoverPosition} = usePopoverPosition();

    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [email] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const [allBetas] = useOnyx(ONYXKEYS.BETAS);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const groupPaidPoliciesWithChatEnabledSelector = useCallback((policies: OnyxCollection<OnyxTypes.Policy>) => groupPaidPoliciesWithExpenseChatEnabledSelector(policies, email), [email]);
    const [groupPoliciesWithChatEnabled = CONST.EMPTY_ARRAY] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: groupPaidPoliciesWithChatEnabledSelector}, [email]);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);

    const defaultChatEnabledPolicy = useMemo(
        () => getDefaultChatEnabledPolicy(groupPoliciesWithChatEnabled as Array<OnyxEntry<OnyxTypes.Policy>>, activePolicy),
        [activePolicy, groupPoliciesWithChatEnabled],
    );

    const handleCreateWorkspaceReport = useCallback(
        (shouldDismissEmptyReportsConfirmation?: boolean) => {
            if (!defaultChatEnabledPolicy?.id) {
                return;
            }

            const {reportID: createdReportID} = createNewReport(
                currentUserPersonalDetails,
                hasViolations,
                isASAPSubmitBetaEnabled,
                defaultChatEnabledPolicy,
                allBetas,
                false,
                shouldDismissEmptyReportsConfirmation,
            );
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Navigation.navigate(
                    isSearchTopmostFullScreenRoute()
                        ? ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: createdReportID, backTo: Navigation.getActiveRoute()})
                        : ROUTES.REPORT_WITH_ID.getRoute(createdReportID, undefined, undefined, Navigation.getActiveRoute()),
                );
            });
        },
        [currentUserPersonalDetails, hasViolations, defaultChatEnabledPolicy, isASAPSubmitBetaEnabled, allBetas],
    );

    const {createReportAction} = useCreateReportAction({
        onCreateReport: handleCreateWorkspaceReport,
        groupPoliciesWithChatEnabled,
    });

    const hideCreateMenu = useCallback(() => setIsCreateMenuActive(false), []);
    const showCreateMenu = useCallback(() => {
        if (!createButtonRef.current) {
            return;
        }
        calculatePopoverPosition(createButtonRef, {
            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
        }).then((position) => {
            setCreateMenuPosition(position);
            setIsCreateMenuActive(true);
        });
    }, [calculatePopoverPosition]);

    const createMenuItems = useMemo(
        (): PopoverMenuItem[] => [
            {
                icon: getIconForAction(CONST.IOU.TYPE.CREATE, expensifyIcons),
                text: translate('iou.createExpense'),
                onSelected: () =>
                    interceptAnonymousUser(() => {
                        startMoneyRequest(CONST.IOU.TYPE.CREATE, generateReportID(), draftTransactionIDs);
                    }),
            },
            {
                icon: expensifyIcons.Location,
                text: translate('iou.trackDistance'),
                onSelected: () =>
                    interceptAnonymousUser(() => {
                        startDistanceRequest(CONST.IOU.TYPE.CREATE, generateReportID(), draftTransactionIDs);
                    }),
            },
            {
                icon: expensifyIcons.Document,
                text: translate('report.newReport.createReport'),
                onSelected: createReportAction,
            },
        ],
        [translate, expensifyIcons, draftTransactionIDs, createReportAction],
    );

    return (
        <View style={[styles.pr5, styles.searchFiltersBarCreateButton]}>
            <PopoverMenu
                onClose={hideCreateMenu}
                isVisible={isCreateMenuActive}
                menuItems={createMenuItems}
                onItemSelected={hideCreateMenu}
                anchorRef={createButtonRef}
                anchorPosition={createMenuPosition}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                }}
            />
            <Button
                ref={createButtonRef}
                success
                small
                icon={expensifyIcons.Plus}
                text={translate('common.create')}
                onPress={showCreateMenu}
            />
        </View>
    );
}

SearchFiltersBarCreateButton.displayName = 'SearchFiltersBarCreateButton';

export default SearchFiltersBarCreateButton;
