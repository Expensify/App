import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useVacationDelegatePersonalDetails from '@hooks/useVacationDelegatePersonalDetails';

import getVacationDelegateDisplayName from '@libs/getVacationDelegateDisplayName';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import {formatVacationDelegateClearDate, getVacationDelegateClearDate, isVacationDelegateExpired} from '@libs/VacationDelegateUtils';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import type CONST from '@src/CONST';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import type {BaseVacationDelegate} from '@src/types/onyx/VacationDelegate';

import type {ValueOf} from 'type-fest';

import React from 'react';

import MenuItem from './MenuItem';
import MenuItemField from './MenuItem/presets/MenuItemField';
import OfflineWithFeedback from './OfflineWithFeedback';
import UserPill from './UserPill';

type VacationDelegateMenuItemRowProps = {
    /** Text above the delegate, naming what the row holds */
    label: string;

    /** Name shown in the delegate's pill */
    displayName: string;

    /** Avatar shown in the delegate's pill */
    avatar?: AvatarSource;

    /** Account ID of the delegate */
    accountID?: number;

    /** Login of the delegate */
    login?: string;

    /** Text under the pill saying when the delegate clears */
    untilText?: string;

    /** Indicator shown next to the chevron */
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
};

/**
 * The line of a set vacation delegate, without a `MenuItem.Root` of its own: the label, the delegate as a pill, and when it clears.
 * The pill is not a text leaf, so the `Root` around it should get an `accessibilityLabel` that names the delegate.
 */
function VacationDelegateMenuItemRow({label, displayName, avatar, accountID, login, untilText, brickRoadIndicator}: VacationDelegateMenuItemRowProps) {
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);

    return (
        <MenuItem.Row>
            <MenuItem.Content>
                <MenuItem.FieldName>{label}</MenuItem.FieldName>
                <UserPill
                    avatar={avatar ?? icons.FallbackAvatar}
                    displayName={displayName}
                    accountID={accountID}
                    email={login}
                    style={styles.userPillStandalone}
                />
                {!!untilText && <MenuItem.Description>{untilText}</MenuItem.Description>}
            </MenuItem.Content>
            <MenuItem.Trailing>
                {!!brickRoadIndicator && <MenuItem.BrickRoadIndicator status={brickRoadIndicator} />}
                <MenuItem.Chevron />
            </MenuItem.Trailing>
        </MenuItem.Row>
    );
}

type VacationDelegateSectionProps = {
    vacationDelegate?: BaseVacationDelegate;

    /** Text above the delegate. Defaults to "Vacation delegate" */
    label?: string;

    /** Errors related to setting the vacation delegate */
    errors?: Errors;

    /** Pending actions related to setting the vacation delegate */
    pendingAction?: PendingAction;

    /**
     * Callback used to clear/reset errors related to the vacation delegate
     */
    onCloseError?: () => void;

    /**
     * Callback triggered when the section is pressed.
     * Should navigate the user to the vacation delegate selection screen.
     */
    onPress: () => void;
};

function VacationDelegateMenuItemPreset({vacationDelegate, label, errors, pendingAction, onCloseError, onPress}: VacationDelegateSectionProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber, dateFnsLocale} = useLocalize();
    const {timezone} = useCurrentUserPersonalDetails();

    const rowLabel = label ?? translate('common.vacationDelegate');
    const hasVacationDelegate = !!vacationDelegate?.delegate && !isVacationDelegateExpired(vacationDelegate?.clearAfter);
    const vacationDelegatePersonalDetails = useVacationDelegatePersonalDetails(vacationDelegate?.delegate);

    const rawDelegateLogin = vacationDelegatePersonalDetails?.login ?? vacationDelegate?.delegate ?? '';
    const delegateDisplayName = getVacationDelegateDisplayName(rawDelegateLogin, vacationDelegatePersonalDetails?.displayName, formatPhoneNumber);
    const clearDate = formatVacationDelegateClearDate(getVacationDelegateClearDate(vacationDelegate?.clearAfter, timezone?.selected), dateFnsLocale);
    const untilText = clearDate ? translate('statusPage.vacationDelegate.until', clearDate) : '';

    return (
        <OfflineWithFeedback
            pendingAction={pendingAction}
            errors={errors}
            errorRowStyles={styles.mh5}
            onClose={onCloseError}
            shouldHideOnDelete={false}
        >
            {hasVacationDelegate ? (
                <MenuItem.Root
                    onPress={callFunctionIfActionIsAllowed(onPress)}
                    accessibilityLabel={[rowLabel, delegateDisplayName, untilText].filter(Boolean).join(', ')}
                >
                    <VacationDelegateMenuItemRow
                        label={rowLabel}
                        displayName={delegateDisplayName}
                        avatar={vacationDelegatePersonalDetails?.avatar}
                        accountID={vacationDelegatePersonalDetails?.accountID}
                        login={rawDelegateLogin}
                        untilText={untilText}
                    />
                </MenuItem.Root>
            ) : (
                <MenuItemField
                    name={rowLabel}
                    onPress={onPress}
                />
            )}
        </OfflineWithFeedback>
    );
}

const VacationDelegateMenuItem = Object.assign(VacationDelegateMenuItemPreset, {Row: VacationDelegateMenuItemRow});

export default VacationDelegateMenuItem;
