import React from 'react';
import {View} from 'react-native';
import LocalePicker from '@components/LocalePicker';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {Account} from '@src/types/onyx';

const currentYear = new Date().getFullYear();

type LicensesProps = {
    /** The details about the account that the user is signing in with */
    account: Account;
};

function Licenses({account}: LicensesProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <>
            <Text style={[styles.textExtraSmallSupporting, styles.mb4]}>{`© ${currentYear} Expensify`}</Text>
            <Text style={[styles.textExtraSmallSupporting]}>
                {translate('termsOfUse.phrase5')}
                <TextLink
                    style={[styles.textExtraSmallSupporting, styles.link]}
                    href={CONST.LICENSES_URL}
                >
                    {' '}
                    {translate('termsOfUse.phrase6')}
                </TextLink>
                .
            </Text>
            <View style={[styles.mt4, styles.alignItemsCenter, styles.mb2, styles.flexRow, styles.justifyContentBetween]}>
                <LocalePicker
                    account={account}
                    size="small"
                />
            </View>
        </>
    );
}

Licenses.displayName = 'Licenses';

export default Licenses;
