import React from 'react';
import {
    View,
} from 'react-native';
import Button from '../../../components/Button';
import CONST from '../../../CONST';
import Text from '../../../components/Text';
import TextLink from '../../../components/TextLink';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import styles from '../../../styles/styles';
import * as PaymentMethods from '../../../libs/actions/PaymentMethods';

const propTypes = {
    ...withLocalizePropTypes,
};

const SuccessfulBalanceTransferPage = props => (
    <View style={[styles.flex1]}>
        <View style={[styles.ph5]}>
            <Text style={styles.mb3}>
                {"Your wallet balance has been successfully transferred! Please reach out to "}
                <TextLink href={`mailto:${CONST.EMAIL.CONCIERGE}`} style={[styles.link]}>
                    {CONST.EMAIL.CONCIERGE}
                </TextLink> 
                {" if you have any questions."}
            </Text>
            <Button
                text={props.translate('paymentsPage.allSet')}
                onPress={() => PaymentMethods.dismissSuccessfulTransferBalancePage()}
                style={[styles.mt4]}
                iconStyles={[styles.mr5]}
                success
            />
        </View>
    </View>
);

SuccessfulBalanceTransferPage.propTypes = propTypes;
SuccessfulBalanceTransferPage.displayName = 'SuccessfulBalanceTransferPage';

export default withLocalize(SuccessfulBalanceTransferPage);
