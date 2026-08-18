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
import {MENU_ITEM_DESCRIPTION_VARIANT} from './MenuItem/leaves/text/MenuItemDescription';
import OfflineWithFeedback from './OfflineWithFeedback';
import Text from './Text';

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

    const hasVacationDelegate = !!vacationDelegate?.delegate;
    const vacationDelegatePersonalDetails = personalDetailsByLogin[vacationDelegate?.delegate?.toLowerCase() ?? ''];
    const formattedDelegateLogin = formatPhoneNumber(vacationDelegatePersonalDetails?.login ?? '');
    const fallbackVacationDelegateLogin = formattedDelegateLogin === '' ? vacationDelegate?.delegate : formattedDelegateLogin;

    // With a delegate set, the row shows their name with their login underneath. Without one, the field's
    // own label takes the description slot as a placeholder, so it renders at the standalone size instead.
    const description = hasVacationDelegate ? fallbackVacationDelegateLogin : translate('common.vacationDelegate');
    const title = hasVacationDelegate ? (vacationDelegatePersonalDetails?.displayName ?? fallbackVacationDelegateLogin) : undefined;

    const delegateRow = (
        <MenuItem.Root onPress={onPress}>
            <MenuItem.Row>
                {hasVacationDelegate && (
                    <MenuItem.Leading>
                        <UserAvatar
                            source={vacationDelegatePersonalDetails?.avatar ?? icons.FallbackAvatar}
                            accountID={vacationDelegatePersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID}
                        />
                    </MenuItem.Leading>
                )}
                <MenuItem.Content>
                    {!!title && <MenuItem.Title>{title}</MenuItem.Title>}
                    {!!description && (
                        <MenuItem.Description
                            variant={hasVacationDelegate ? MENU_ITEM_DESCRIPTION_VARIANT.SUPPORTING : MENU_ITEM_DESCRIPTION_VARIANT.PLACEHOLDER}
                            numberOfLines={hasVacationDelegate ? 1 : 2}
                        >
                            {description}
                        </MenuItem.Description>
                    )}
                </MenuItem.Content>
                <MenuItem.Trailing>
                    <MenuItem.Chevron />
                </MenuItem.Trailing>
            </MenuItem.Row>
        </MenuItem.Root>
    );

    // The section heading and the offline/error feedback only exist once a delegate is set.
    if (!hasVacationDelegate) {
        return delegateRow;
    }

    return (
        <>
            <Text style={[styles.mh5, styles.mt5, styles.mutedTextLabel]}>{translate('common.vacationDelegate')}</Text>
            <OfflineWithFeedback
                pendingAction={pendingAction}
                errors={errors}
                errorRowStyles={styles.mh5}
                onClose={onCloseError}
            >
                {delegateRow}
            </OfflineWithFeedback>
        </>
    );
}

export default VacationDelegateMenuItem;
