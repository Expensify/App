import React from 'react';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailsByLogin from '@hooks/usePersonalDetailsByLogin';
import useThemeStyles from '@hooks/useThemeStyles';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import MenuItem from './MenuItem';
import Text from './Text';

type DelegatorListProps = {
    /** List of delegators */
    delegators?: string[];

    message: string;
};

function DelegatorList({delegators, message}: DelegatorListProps) {
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);

    const personalDetailsByLogin = usePersonalDetailsByLogin();

    return (
        <>
            <Text style={[styles.mh5, styles.mb4]}>{message}</Text>
            {delegators?.map((delegatorEmail) => {
                const delegatorDetails = personalDetailsByLogin[delegatorEmail.toLowerCase()];
                const formattedLogin = formatPhoneNumber(delegatorDetails?.login ?? '', countryCode);
                const displayLogin = formattedLogin || delegatorEmail;

                return (
                    <MenuItem
                        key={delegatorEmail}
                        title={delegatorDetails?.displayName ?? displayLogin}
                        description={displayLogin}
                        avatarID={delegatorDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID}
                        icon={delegatorDetails?.avatar ?? icons.FallbackAvatar}
                        iconType={CONST.ICON_TYPE_AVATAR}
                        numberOfLinesDescription={1}
                        containerStyle={[styles.pr2, styles.mt1]}
                        interactive={false}
                    />
                );
            })}
        </>
    );
}

export default DelegatorList;
