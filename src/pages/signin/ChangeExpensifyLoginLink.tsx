import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Credentials} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type ChangeExpensifyLoginLinkOnyxProps = {
    /** The credentials of the person logging in */
    credentials: OnyxEntry<Credentials>;
};

type ChangeExpensifyLoginLinkProps = ChangeExpensifyLoginLinkOnyxProps & {
    onPress: () => void;
};

function ChangeExpensifyLoginLink({credentials, onPress}: ChangeExpensifyLoginLinkProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();

    return (
        <View style={[styles.changeExpensifyLoginLinkContainer, styles.mt3]}>
            {!!credentials?.login && <Text style={styles.mr1}>{translate('loginForm.notYou', {user: formatPhoneNumber(credentials.login)})}</Text>}
            <PressableWithFeedback
                style={[styles.link]}
                onPress={onPress}
                role={CONST.ROLE.LINK}
                accessibilityLabel={translate('common.goBack')}
            >
                <Text style={[styles.link]}>{translate('common.goBack')}.</Text>
            </PressableWithFeedback>
        </View>
    );
}

ChangeExpensifyLoginLink.displayName = 'ChangeExpensifyLoginLink';

export default function ChangeExpensifyLoginLinkOnyx(props: Omit<ChangeExpensifyLoginLinkProps, keyof ChangeExpensifyLoginLinkOnyxProps>) {
    const [credentials, credentialsMetadata] = useOnyx(ONYXKEYS.CREDENTIALS);

    if (isLoadingOnyxValue(credentialsMetadata)) {
        return null;
    }

    return (
        <ChangeExpensifyLoginLink
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            credentials={credentials}
        />
    );
}
