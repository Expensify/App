import React from 'react';
import {View} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type ChangeExpensifyLoginLinkProps = {
    onPress: () => void;
};

function ChangeExpensifyLoginLink({onPress}: ChangeExpensifyLoginLinkProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS, {canBeMissing: true});

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

export default ChangeExpensifyLoginLink;
