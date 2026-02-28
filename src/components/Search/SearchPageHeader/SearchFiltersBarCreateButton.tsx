import {emailSelector} from '@selectors/Session';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import Button from '@components/Button';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import PopoverMenu from '@components/PopoverMenu';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePopoverPosition from '@hooks/usePopoverPosition';
import useThemeStyles from '@hooks/useThemeStyles';
import {startDistanceRequest, startMoneyRequest} from '@libs/actions/IOU';
import getIconForAction from '@libs/getIconForAction';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {groupPaidPoliciesWithExpenseChatEnabledSelector, shouldRedirectToExpensifyClassicSelector} from '@src/selectors/Policy';
import type * as OnyxTypes from '@src/types/onyx';

function SearchFiltersBarCreateButton() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Plus', 'Location', 'Document', 'Receipt', 'Coins', 'Cash', 'Transfer', 'MoneyCircle']);

    const createButtonRef = useRef<View>(null);
    const [isCreateMenuActive, setIsCreateMenuActive] = useState(false);
    const [createMenuPosition, setCreateMenuPosition] = useState<{horizontal: number; vertical: number}>({horizontal: 0, vertical: 0});
    const {calculatePopoverPosition} = usePopoverPosition();

    const [email] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const groupPaidPoliciesWithChatEnabledSelector = useCallback((policies: OnyxCollection<OnyxTypes.Policy>) => groupPaidPoliciesWithExpenseChatEnabledSelector(policies, email), [email]);
    const [groupPoliciesWithChatEnabled = CONST.EMPTY_ARRAY] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: groupPaidPoliciesWithChatEnabledSelector}, [email]);
    const [shouldRedirectToExpensifyClassic = false] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: shouldRedirectToExpensifyClassicSelector});
    const shouldShowCreateReportOption = shouldRedirectToExpensifyClassic || groupPoliciesWithChatEnabled.length > 0;

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
                        startMoneyRequest(CONST.IOU.TYPE.CREATE, generateReportID());
                    }),
            },
            {
                icon: expensifyIcons.Location,
                text: translate('iou.trackDistance'),
                onSelected: () =>
                    interceptAnonymousUser(() => {
                        startDistanceRequest(CONST.IOU.TYPE.CREATE, generateReportID());
                    }),
            },
            ...(shouldShowCreateReportOption
                ? [
                      {
                          icon: expensifyIcons.Document,
                          text: translate('report.newReport.createReport'),
                          onSelected: () =>
                              interceptAnonymousUser(() => {
                                  Navigation.navigate(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
                              }),
                      },
                  ]
                : []),
        ],
        [translate, expensifyIcons, shouldShowCreateReportOption],
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
