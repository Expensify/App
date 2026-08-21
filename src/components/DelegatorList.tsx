import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePersonalDetailsByLogin from '@hooks/usePersonalDetailsByLogin';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

import UserAvatar from './Avatar/UserAvatar';
import MenuItem from './MenuItem';
import Text from './Text';

type DelegatorListProps = {
    /** List of delegators */
    delegators?: string[];

    message: string;
};

function DelegatorList({delegators, message}: DelegatorListProps) {
    const styles = useThemeStyles();
    const {formatPhoneNumber} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);

    const personalDetailsByLogin = usePersonalDetailsByLogin();

    return (
        <>
            <Text style={[styles.mh5, styles.mb4]}>{message}</Text>
            <View style={[styles.mt1, styles.gap1]}>
                {delegators?.map((delegatorEmail) => {
                    const delegatorDetails = personalDetailsByLogin[delegatorEmail.toLowerCase()];
                    const formattedLogin = formatPhoneNumber(delegatorDetails?.login ?? '');
                    const displayLogin = formattedLogin || delegatorEmail;

                    return (
                        <MenuItem.Root key={delegatorEmail}>
                            <MenuItem.Row>
                                <MenuItem.Leading>
                                    <UserAvatar
                                        source={delegatorDetails?.avatar ?? icons.FallbackAvatar}
                                        accountID={delegatorDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID}
                                    />
                                </MenuItem.Leading>
                                <MenuItem.Content>
                                    <MenuItem.Title>{delegatorDetails?.displayName ?? displayLogin}</MenuItem.Title>
                                    <MenuItem.Description numberOfLines={1}>{displayLogin}</MenuItem.Description>
                                </MenuItem.Content>
                            </MenuItem.Row>
                        </MenuItem.Root>
                    );
                })}
            </View>
        </>
    );
}

export default DelegatorList;
