import Button from '@components/Button';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu from '@components/PopoverMenu';

import useCreateReport from '@hooks/useCreateReport';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useThemeStyles from '@hooks/useThemeStyles';

import {startDistanceRequest, startMoneyRequest} from '@libs/actions/IOU/MoneyRequest';
import {createNewReport} from '@libs/actions/Report';
import getIconForAction from '@libs/getIconForAction';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

import type {ComponentRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';

function SearchActionsBarCreateButton() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Plus', 'Location', 'Document', 'Receipt', 'Coins', 'Cash', 'Transfer', 'MoneyCircle']);

    const createButtonRef = useRef<ComponentRef<typeof View>>(null);
    const [isCreateMenuActive, setIsCreateMenuActive] = useState(false);
    const [createMenuPosition, setCreateMenuPosition] = useState<{horizontal: number; vertical: number}>({horizontal: 0, vertical: 0});
    const {calculatePopoverPosition} = usePopoverPosition();

    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    const handleCreateWorkspaceReport = useCallback(
        (policy: OnyxEntry<OnyxTypes.Policy>, shouldDismissEmptyReportsConfirmation?: boolean) => {
            if (!policy?.id) {
                return;
            }

            const {reportID: createdReportID} = createNewReport(
                currentUserPersonalDetails,
                hasViolations,
                isASAPSubmitBetaEnabled,
                policy,
                isTrackIntentUser,
                getCurrencyDecimals,
                rules,
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
        [currentUserPersonalDetails, hasViolations, isASAPSubmitBetaEnabled, isTrackIntentUser, getCurrencyDecimals, rules],
    );

    const {createReport} = useCreateReport({onCreateReport: handleCreateWorkspaceReport});

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
                onSelected: createReport,
            },
        ],
        [translate, expensifyIcons, draftTransactionIDs, createReport],
    );

    return (
        <View style={[styles.searchActionsBarCreateButton]}>
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
                enableEdgeToEdgeBottomSafeAreaPadding
            />
            <Button
                ref={createButtonRef}
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                size={CONST.BUTTON_SIZE.SMALL}
                onPress={showCreateMenu}
            >
                <Button.Icon src={expensifyIcons.Plus} />
                <Button.Text>{translate('common.create')}</Button.Text>
            </Button>
        </View>
    );
}

SearchActionsBarCreateButton.displayName = 'SearchActionsBarCreateButton';

export default SearchActionsBarCreateButton;
