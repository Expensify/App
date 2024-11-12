import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import variables from '@styles/variables';
import * as Session from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session as SessionType} from '@src/types/onyx';

type ValidateCodeModalOnyxProps = {
    /** Session of currently logged in user */
    session: OnyxEntry<SessionType>;
};

type ValidateCodeModalProps = ValidateCodeModalOnyxProps & {
    /** Code to display. */
    code: string;
    /** The ID of the account to which the code belongs. */
    accountID: number;
};

function ValidateCodeModal({code, accountID, session = {}}: ValidateCodeModalProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const signInHere = useCallback(() => Session.signInWithValidateCode(accountID, code), [accountID, code]);
    const {translate} = useLocalize();

    const isInvalidValidateCode = !ValidationUtils.isValidValidateCode(code);

    if (isInvalidValidateCode) {
        return (
            <NotFoundPage
                shouldShow
                onLinkPress={() => {
                    Navigation.goBack();
                }}
            />
        );
    }
    return (
        <View style={styles.deeplinkWrapperContainer}>
            <View style={styles.deeplinkWrapperMessage}>
                <View style={styles.mb2}>
                    <Icon
                        width={variables.modalTopIconWidth}
                        height={variables.modalTopIconHeight}
                        src={Illustrations.MagicCode}
                    />
                </View>
                <Text style={[styles.textHeadline, styles.textXXLarge, styles.textAlignCenter]}>{translate('validateCodeModal.title')}</Text>
                <View style={[styles.mt2, styles.mb2]}>
                    <Text style={styles.textAlignCenter}>
                        {translate('validateCodeModal.description')}
                        {!session?.authToken && (
                            <>
                                {translate('validateCodeModal.or')} <TextLink onPress={signInHere}>{translate('validateCodeModal.signInHere')}</TextLink>
                            </>
                        )}
                        .
                    </Text>
                </View>
                <View style={styles.mt6}>
                    <Text style={styles.validateCodeDigits}>{code}</Text>
                </View>
            </View>
            <View style={styles.deeplinkWrapperFooter}>
                <Icon
                    width={variables.modalWordmarkWidth}
                    height={variables.modalWordmarkHeight}
                    fill={theme.success}
                    src={Expensicons.ExpensifyWordmark}
                />
            </View>
        </View>
    );
}

ValidateCodeModal.displayName = 'ValidateCodeModal';

export default withOnyx<ValidateCodeModalProps, ValidateCodeModalOnyxProps>({
    session: {key: ONYXKEYS.SESSION},
})(ValidateCodeModal);
