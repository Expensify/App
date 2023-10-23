import Str from 'expensify-common/lib/str';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import CONST from '../../../../CONST';
import ONYXKEYS from '../../../../ONYXKEYS';
import TextInput from '../../../../components/TextInput';
import useLocalize from '../../../../hooks/useLocalize';
import styles from '../../../../styles/styles';
import BaseGetPhysicalCard from './BaseGetPhysicalCard';
import FormUtils from '../../../../libs/FormUtils';
import {parsePhoneNumber} from 'awesome-phonenumber';

const propTypes = {
    /* Onyx Props */
    /** Draft values used by the get physical card form */
    draftValues: PropTypes.shape({
        phoneNumber: PropTypes.string,
    }),
};

const defaultProps = {
    draftValues: {
        phoneNumber: '',
    },
};

function GetPhysicalCardPhone({draftValues: {phoneNumber}}) {
    const {translate} = useLocalize();

    const onValidate = (values) => {
        const errors = {};

        if (!parsePhoneNumber(values.phoneNumber).possible && !Str.isValidPhone(values.phoneNumber)) {
            errors.phoneNumber = 'common.error.phoneNumber';
        } else if (_.isEmpty(values.phoneNumber)) {
            errors.phoneNumber = 'common.error.fieldRequired';
        }

        return errors;
    };

    return (
        <BaseGetPhysicalCard
            headline={translate('getPhysicalCard.phoneMessage')}
            submitButtonText={translate('getPhysicalCard.next')}
            title={translate('getPhysicalCard.header')}
            onValidate={onValidate}
        >
            <TextInput
                inputID="phoneNumber"
                name="phoneNumber"
                label={translate('getPhysicalCard.phoneNumber')}
                accessibilityLabel={translate('getPhysicalCard.phoneNumber')}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                defaultValue={phoneNumber}
                containerStyles={[styles.mt5, styles.mh5]}
                shouldSaveDraft
            />
        </BaseGetPhysicalCard>
    );
}

GetPhysicalCardPhone.defaultProps = defaultProps;
GetPhysicalCardPhone.displayName = 'GetPhysicalCardPhone';
GetPhysicalCardPhone.propTypes = propTypes;

export default withOnyx({
    draftValues: {
        key: FormUtils.getDraftKey(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM),
    },
})(GetPhysicalCardPhone);
