import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useVacationDelegatePersonalDetails from '@hooks/useVacationDelegatePersonalDetails';

import getVacationDelegateDisplayName from '@libs/getVacationDelegateDisplayName';

import CONST from '@src/CONST';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import type {BaseVacationDelegate} from '@src/types/onyx/VacationDelegate';

import React from 'react';

import UserAvatar from './Avatar/UserAvatar';
import MenuItem from './MenuItem';
import MenuItemEmptyField from './MenuItem/presets/MenuItemEmptyField';
import MenuItemWithLabel from './MenuItem/presets/MenuItemWithLabel';
import OfflineWithFeedback from './OfflineWithFeedback';

type VacationDelegateSectionProps = {
    /** Currently selected vacation delegate (if any) */
    vacationDelegate?: BaseVacationDelegate;

    /** Errors related to setting the vacation delegate */
    errors?: Errors;

    /** Pending actions related to setting the vacation delegate */
    pendingAction?: PendingAction;

    /**
     * Callback used to clear/reset errors related to the vacation delegate
     */
    onCloseError: () => void;

    /**
     * Callback triggered when the section is pressed.
     * Should navigate the user to the vacation delegate selection screen.
     */
    onPress: () => void;
};

function VacationDelegateMenuItem({vacationDelegate, errors, pendingAction, onCloseError, onPress}: VacationDelegateSectionProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);

    const hasVacationDelegate = !!vacationDelegate?.delegate;
    const vacationDelegatePersonalDetails = useVacationDelegatePersonalDetails(vacationDelegate?.delegate);

    const rawDelegateLogin = vacationDelegatePersonalDetails?.login ?? vacationDelegate?.delegate ?? '';
    const delegateDisplayName = getVacationDelegateDisplayName(rawDelegateLogin, vacationDelegatePersonalDetails?.displayName, formatPhoneNumber);
    const delegateDescription = formatPhoneNumber(rawDelegateLogin);

    return (
        <OfflineWithFeedback
            pendingAction={pendingAction}
            errors={errors}
            errorRowStyles={styles.mh5}
            onClose={onCloseError}
            style={hasVacationDelegate && styles.mt4}
        >
            {hasVacationDelegate ? (
                <MenuItemWithLabel
                    label={translate('common.vacationDelegate')}
                    onPress={onPress}
                >
                    <MenuItem.Row>
                        <MenuItem.Leading>
                            <UserAvatar
                                source={vacationDelegatePersonalDetails?.avatar ?? icons.FallbackAvatar}
                                accountID={vacationDelegatePersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID}
                            />
                        </MenuItem.Leading>
                        <MenuItem.Content>
                            <MenuItem.Title>{delegateDisplayName}</MenuItem.Title>
                            {!!delegateDescription && <MenuItem.Description numberOfLines={1}>{delegateDescription}</MenuItem.Description>}
                        </MenuItem.Content>
                        <MenuItem.Trailing>
                            <MenuItem.Chevron />
                        </MenuItem.Trailing>
                    </MenuItem.Row>
                </MenuItemWithLabel>
            ) : (
                <MenuItemEmptyField
                    description={translate('common.vacationDelegate')}
                    onPress={onPress}
                />
            )}
        </OfflineWithFeedback>
    );
}

export default VacationDelegateMenuItem;
