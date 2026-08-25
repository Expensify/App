import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePersonalDetailsByLogin from '@hooks/usePersonalDetailsByLogin';
import useThemeStyles from '@hooks/useThemeStyles';

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
    const personalDetailsByLogin = usePersonalDetailsByLogin();

    const vacationDelegatePersonalDetails = personalDetailsByLogin[vacationDelegate?.delegate?.toLowerCase() ?? ''];
    const formattedDelegateLogin = formatPhoneNumber(vacationDelegatePersonalDetails?.login ?? '');
    const fallbackVacationDelegateLogin = formattedDelegateLogin === '' ? vacationDelegate?.delegate : formattedDelegateLogin;

    const vacationDelegateName = vacationDelegatePersonalDetails?.displayName ?? fallbackVacationDelegateLogin;

    return (
        <OfflineWithFeedback
            pendingAction={pendingAction}
            errors={errors}
            errorRowStyles={styles.mh5}
            onClose={onCloseError}
            style={!!vacationDelegateName && styles.mt4}
        >
            {vacationDelegateName ? (
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
                            <MenuItem.Title>{vacationDelegateName}</MenuItem.Title>
                            {!!fallbackVacationDelegateLogin && <MenuItem.Description numberOfLines={1}>{fallbackVacationDelegateLogin}</MenuItem.Description>}
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
