import {parsePhoneNumber} from 'awesome-phonenumber';
import Str from 'expensify-common/lib/str';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import FormUtils from '@libs/FormUtils';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import BaseGetPhysicalCard from './BaseGetPhysicalCard';

const propTypes = {
    /* Onyx Props */
    /** Draft values used by the get physical card form */
    draftValues: PropTypes.shape({
        phoneNumber: PropTypes.string,
    }),

    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** domain passed via route /settings/wallet/card/:domain */
            domain: PropTypes.string,
        }),
    }).isRequired,
};

const defaultProps = {
    draftValues: {
        phoneNumber: '',
    },
};

function GetPhysicalCardPhone({
    draftValues: {phoneNumber},
    route: {
        params: {domain},
    },
}) {
    const {translate} = useLocalize();

    const onValidate = (values) => {
        const errors = {};

        if (!(parsePhoneNumber(values.phoneNumber).possible && Str.isValidPhone(values.phoneNumber))) {
            errors.phoneNumber = 'common.error.phoneNumber';
        } else if (_.isEmpty(values.phoneNumber)) {
            errors.phoneNumber = 'common.error.fieldRequired';
        }

        return errors;
    };

    return (
        <BaseGetPhysicalCard
            currentRoute={ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_PHONE.getRoute(domain)}
            domain={domain}
            headline={translate('getPhysicalCard.phoneMessage')}
            submitButtonText={translate('getPhysicalCard.next')}
            title={translate('getPhysicalCard.header')}
            onValidate={onValidate}
        >
            <TextInput
                inputID="phoneNumber"
                name="phoneNumber"
                label={translate('getPhysicalCard.phoneNumber')}
                aria-label={translate('getPhysicalCard.phoneNumber')}
                role={CONST.ACCESSIBILITY_ROLE.TEXT}
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
