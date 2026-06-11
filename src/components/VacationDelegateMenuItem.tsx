import {Str} from 'expensify-common';
import React from 'react';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePersonalDetailsByLogin from '@hooks/usePersonalDetailsByLogin';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import type {BaseVacationDelegate} from '@src/types/onyx/VacationDelegate';
import MenuItem from './MenuItem';
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
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const personalDetailsByLogin = usePersonalDetailsByLogin();

    const hasVacationDelegate = !!vacationDelegate?.delegate;
    const vacationDelegatePersonalDetails = personalDetailsByLogin[vacationDelegate?.delegate?.toLowerCase() ?? ''];

    // Render phone-number delegates as the raw E.164 string (e.g. "+9779806050938") rather than
    // running them through `formatPhoneNumber`, which would otherwise reformat the number to either
    // the national (e.g. "980-6050938") or international-with-spaces (e.g. "+977 980 605 0938") form
    // depending on the user's country, and diverge from the recent/selected row in
    // BaseVacationDelegateSelectionComponent and the confirmation modal.
    const delegateLogin = Str.removeSMSDomain(vacationDelegatePersonalDetails?.login ?? vacationDelegate?.delegate ?? '');
    const delegateDisplayName = Str.removeSMSDomain(vacationDelegatePersonalDetails?.displayName ?? delegateLogin);

    return hasVacationDelegate ? (
        <>
            <Text style={[styles.mh5, styles.mt5, styles.mutedTextLabel]}>{translate('common.vacationDelegate')}</Text>
            <OfflineWithFeedback
                pendingAction={pendingAction}
                errors={errors}
                errorRowStyles={styles.mh5}
                onClose={onCloseError}
            >
                <MenuItem
                    title={delegateDisplayName}
                    description={delegateLogin}
                    avatarID={vacationDelegatePersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID}
                    icon={vacationDelegatePersonalDetails?.avatar ?? icons.FallbackAvatar}
                    iconType={CONST.ICON_TYPE_AVATAR}
                    numberOfLinesDescription={1}
                    shouldShowRightIcon
                    onPress={onPress}
                />
            </OfflineWithFeedback>
        </>
    ) : (
        <MenuItem
            description={translate('common.vacationDelegate')}
            shouldShowRightIcon
            onPress={onPress}
        />
    );
}

export default VacationDelegateMenuItem;
