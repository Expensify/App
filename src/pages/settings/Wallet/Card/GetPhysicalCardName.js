import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import FormUtils from '@libs/FormUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import BaseGetPhysicalCard from './BaseGetPhysicalCard';

const propTypes = {
    /* Onyx Props */
    /** Draft values used by the get physical card form */
    draftValues: PropTypes.shape({
        legalFirstName: PropTypes.string,
        legalLastName: PropTypes.string,
    }),
};

const defaultProps = {
    draftValues: {
        legalFirstName: '',
        legalLastName: '',
    },
};

function GetPhysicalCardName({draftValues: {legalFirstName, legalLastName}}) {
    const {translate} = useLocalize();
    const onValidate = (values) => {
        const errors = {};

        if (!ValidationUtils.isValidLegalName(values.legalFirstName)) {
            errors.legalFirstName = 'privatePersonalDetails.error.hasInvalidCharacter';
        } else if (_.isEmpty(values.legalFirstName)) {
            errors.legalFirstName = 'common.error.fieldRequired';
        }

        if (!ValidationUtils.isValidLegalName(values.legalLastName)) {
            errors.legalLastName = 'privatePersonalDetails.error.hasInvalidCharacter';
        } else if (_.isEmpty(values.legalLastName)) {
            errors.legalLastName = 'common.error.fieldRequired';
        }

        return errors;
    };

    return (
        <BaseGetPhysicalCard
            headline={translate('getPhysicalCard.nameMessage')}
            submitButtonText={translate('getPhysicalCard.next')}
            title={translate('getPhysicalCard.header')}
            onValidate={onValidate}
        >
            <TextInput
                inputID="legalFirstName"
                name="legalFirstName"
                label={translate('getPhysicalCard.legalFirstName')}
                accessibilityLabel={translate('getPhysicalCard.legalFirstName')}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                autoCapitalize="words"
                defaultValue={legalFirstName}
                containerStyles={[styles.mt5, styles.mh5]}
                shouldSaveDraft
            />
            <TextInput
                inputID="legalLastName"
                name="legalLastName"
                label={translate('getPhysicalCard.legalLastName')}
                accessibilityLabel={translate('getPhysicalCard.legalLastName')}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                autoCapitalize="words"
                defaultValue={legalLastName}
                containerStyles={[styles.mt5, styles.mh5]}
                shouldSaveDraft
            />
        </BaseGetPhysicalCard>
    );
}

GetPhysicalCardName.defaultProps = defaultProps;
GetPhysicalCardName.displayName = 'GetPhysicalCardName';
GetPhysicalCardName.propTypes = propTypes;

export default withOnyx({
    draftValues: {
        key: FormUtils.getDraftKey(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM),
    },
})(GetPhysicalCardName);
