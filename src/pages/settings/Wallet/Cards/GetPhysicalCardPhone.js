import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import CONST from '../../../../CONST';
import ONYXKEYS from '../../../../ONYXKEYS';
import TextInput from '../../../../components/TextInput';
import useLocalize from '../../../../hooks/useLocalize';
import styles from '../../../../styles/styles';
import BaseGetPhysicalCard from './BaseGetPhysicalCard';

const propTypes = {
    personalDetails: PropTypes.shape({
        phoneNumber: PropTypes.string,
    }),
};

const defaultProps = {
    personalDetails: {
        phoneNumber: '',
    },
};

function GetPhysicalCardPhone({personalDetails: {phoneNumber}}) {
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
                defaultValue={phoneNumber}
                shouldSaveDraft
                containerStyles={[styles.mt5]}
            />
        </BaseGetPhysicalCard>
    );
}

GetPhysicalCardPhone.defaultProps = defaultProps;
GetPhysicalCardPhone.displayName = 'GetPhysicalCardPhone';
GetPhysicalCardPhone.propTypes = propTypes;

export default withOnyx({
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    },
})(GetPhysicalCardPhone);
