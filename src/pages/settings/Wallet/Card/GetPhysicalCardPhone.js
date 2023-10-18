import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import CONST from '../../../../CONST';
import ONYXKEYS from '../../../../ONYXKEYS';
import TextInput from '../../../../components/TextInput';
import useLocalize from '../../../../hooks/useLocalize';
import styles from '../../../../styles/styles';
import BaseGetPhysicalCard from './BaseGetPhysicalCard';
import * as UserUtils from '../../../../libs/UserUtils';

const propTypes = {
    privatePersonalDetails: PropTypes.shape({
        phoneNumber: PropTypes.string,
    }),
    loginList: PropTypes.shape({}),
};

const defaultProps = {
    privatePersonalDetails: {
        phoneNumber: '',
    },
    loginList: {},
};

function GetPhysicalCardPhone({privatePersonalDetails: {phoneNumber}, loginList}) {
    const {translate} = useLocalize();

    return (
        <BaseGetPhysicalCard
            headline={translate('getPhysicalCard.phoneMessage')}
            submitButtonText={translate('getPhysicalCard.next')}
            title={translate('getPhysicalCard.header')}
        >
            <TextInput
                inputID="phoneNumber"
                name="phoneNumber"
                label={translate('getPhysicalCard.phoneNumber')}
                accessibilityLabel={translate('getPhysicalCard.phoneNumber')}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                defaultValue={phoneNumber || UserUtils.getSecondaryPhoneLogin(loginList)}
                containerStyles={[styles.mt5, styles.mh5]}
            />
        </BaseGetPhysicalCard>
    );
}

GetPhysicalCardPhone.defaultProps = defaultProps;
GetPhysicalCardPhone.displayName = 'GetPhysicalCardPhone';
GetPhysicalCardPhone.propTypes = propTypes;

export default withOnyx({
    privatePersonalDetails: {
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    },
    loginList: {
        key: ONYXKEYS.LOGIN_LIST,
    },
})(GetPhysicalCardPhone);
