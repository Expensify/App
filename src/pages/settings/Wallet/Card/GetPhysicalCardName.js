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
    privatePersonalDetails: PropTypes.shape({
        legalFirstName: PropTypes.string,
        legalLastName: PropTypes.string,
    }),
};

const defaultProps = {
    privatePersonalDetails: {
        legalFirstName: '',
        legalLastName: '',
    },
};

function GetPhysicalCardName({privatePersonalDetails: {legalFirstName, legalLastName}}) {
    const {translate} = useLocalize();
    return (
        <BaseGetPhysicalCard
            headline={translate('getPhysicalCard.nameMessage')}
            submitButtonText={translate('getPhysicalCard.next')}
            title={translate('getPhysicalCard.header')}
        >
            <TextInput
                inputID="firstName"
                name="firstName"
                label={translate('getPhysicalCard.legalFirstName')}
                accessibilityLabel={translate('getPhysicalCard.legalFirstName')}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                autoCapitalize="words"
                defaultValue={legalFirstName}
                containerStyles={[styles.mt5, styles.mh5]}
            />
            <TextInput
                inputID="lastName"
                name="lastName"
                label={translate('getPhysicalCard.legalLastName')}
                accessibilityLabel={translate('getPhysicalCard.legalLastName')}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                autoCapitalize="words"
                defaultValue={legalLastName}
                containerStyles={[styles.mt5, styles.mh5]}
            />
        </BaseGetPhysicalCard>
    );
}

GetPhysicalCardName.defaultProps = defaultProps;
GetPhysicalCardName.displayName = 'GetPhysicalCardName';
GetPhysicalCardName.propTypes = propTypes;

export default withOnyx({
    privatePersonalDetails: {
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    },
    loginList: {
        key: ONYXKEYS.LOGIN_LIST,
    },
})(GetPhysicalCardName);
