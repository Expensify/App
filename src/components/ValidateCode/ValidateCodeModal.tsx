import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
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
import variables from '@styles/variables';
import * as Session from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';

type ValidateCodeModalProps = {
    /** Code to display. */
    code: string;
    /** The ID of the account to which the code belongs. */
    accountID: number;
};

function ValidateCodeModal({code, accountID}: ValidateCodeModalProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const signInHere = useCallback(() => Session.signInWithValidateCode(accountID, code), [accountID, code]);
    const {translate} = useLocalize();

    return (
        <FullPageNotFoundView
            shouldShow={!ValidationUtils.isValidValidateCode(code)}
            onLinkPress={() => {
                Navigation.goBack();
            }}
        >
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
        </FullPageNotFoundView>
    );
}

ValidateCodeModal.displayName = 'ValidateCodeModal';

export default ValidateCodeModal;
