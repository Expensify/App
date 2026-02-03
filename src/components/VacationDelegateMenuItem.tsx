import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
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

    /**
     * Optional additional title/description displayed above the section
     */
    additionalDescription?: string;

    /** Optional styles for container element */
    containerStyles?: StyleProp<ViewStyle>;
};

function VacationDelegateMenuItem({vacationDelegate, errors, pendingAction, onCloseError, onPress, additionalDescription, containerStyles}: VacationDelegateSectionProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const hasVacationDelegate = !!vacationDelegate?.delegate;
    const vacationDelegatePersonalDetails = getPersonalDetailByEmail(vacationDelegate?.delegate ?? '');
    const formattedDelegateLogin = formatPhoneNumber(vacationDelegatePersonalDetails?.login ?? '');
    const fallbackVacationDelegateLogin = formattedDelegateLogin === '' ? vacationDelegate?.delegate : formattedDelegateLogin;

    return (
        <View style={[containerStyles]}>
            {!!additionalDescription && (
                <>
                    <Text style={[styles.mh5]}>{translate('statusPage.setVacationDelegate')}</Text>
                    {hasVacationDelegate && <Text style={[styles.mh5, styles.mt6, styles.mutedTextLabel]}>{additionalDescription}</Text>}
                </>
            )}

            {hasVacationDelegate ? (
                <OfflineWithFeedback
                    pendingAction={pendingAction}
                    errors={errors}
                    errorRowStyles={styles.mh5}
                    onClose={onCloseError}
                >
                    <MenuItem
                        title={vacationDelegatePersonalDetails?.displayName ?? fallbackVacationDelegateLogin}
                        description={fallbackVacationDelegateLogin}
                        avatarID={vacationDelegatePersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID}
                        icon={vacationDelegatePersonalDetails?.avatar ?? icons.FallbackAvatar}
                        iconType={CONST.ICON_TYPE_AVATAR}
                        numberOfLinesDescription={1}
                        shouldShowRightIcon
                        onPress={onPress}
                        containerStyle={styles.pr2}
                    />
                </OfflineWithFeedback>
            ) : (
                <View style={[styles.mt1]}>
                    <MenuItem
                        description={translate('statusPage.vacationDelegate')}
                        shouldShowRightIcon
                        onPress={onPress}
                        containerStyle={styles.pr2}
                    />
                </View>
            )}
        </View>
    );
}

VacationDelegateMenuItem.displayName = 'VacationDelegateSection';

export default VacationDelegateMenuItem;
