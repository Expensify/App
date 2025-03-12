import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ExpensifyWordmark from '@components/ExpensifyWordmark';
import Icon from '@components/Icon';
import {MagicCode} from '@components/Icon/Illustrations';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {signInWithValidateCode} from '@libs/actions/Session';
import Navigation from '@libs/Navigation/Navigation';
import {isValidValidateCode} from '@libs/ValidationUtils';
import variables from '@styles/variables';
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
    const signInHere = useCallback(() => signInWithValidateCode(accountID, code), [accountID, code]);
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <FullPageNotFoundView
            testID="validate-code-not-found"
            shouldShow={!isValidValidateCode(code)}
            shouldShowBackButton={shouldUseNarrowLayout}
            onLinkPress={() => {
                Navigation.goBack();
            }}
        >
            <View
                style={styles.deeplinkWrapperContainer}
                testID="validate-code"
            >
                <View style={styles.deeplinkWrapperMessage}>
                    <View style={styles.mb2}>
                        <Icon
                            width={variables.modalTopIconWidth}
                            height={variables.modalTopIconHeight}
                            src={MagicCode}
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
                    <View style={[styles.mt6]}>
                        <Text style={styles.textAlignCenter}>{translate('validateCodeModal.doNotShare')}</Text>
                    </View>
                </View>
                <View style={styles.deeplinkWrapperFooter}>
                    <Icon
                        width={variables.modalWordmarkWidth}
                        height={variables.modalWordmarkHeight}
                        fill={theme.success}
                        src={ExpensifyWordmark}
                    />
                </View>
            </View>
        </FullPageNotFoundView>
    );
}

ValidateCodeModal.displayName = 'ValidateCodeModal';

export default ValidateCodeModal;
