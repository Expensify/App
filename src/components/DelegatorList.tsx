import React from 'react';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import usePersonalDetailsByLogin from '@hooks/usePersonalDetailsByLogin';
import useThemeStyles from '@hooks/useThemeStyles';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import CONST from '@src/CONST';
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

    const personalDetailsByLogin = usePersonalDetailsByLogin();

    return (
        <>
            <Text style={[styles.mh5, styles.mb4]}>{message}</Text>
            {delegators?.map((delegatorEmail) => {
                const delegatorDetails = personalDetailsByLogin[delegatorEmail.toLowerCase()];
                const formattedLogin = formatPhoneNumber(delegatorDetails?.login ?? '');
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
