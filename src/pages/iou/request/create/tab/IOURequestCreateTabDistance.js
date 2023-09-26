import React from 'react';
import {Text} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {useRoute} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import useLocalize from '../../../../../hooks/useLocalize';
import * as IOUUtils from '../../../../../libs/IOUUtils';
import TabContentWithEditing from './TabContentWithEditing';
import ONYXKEYS from '../../../../../ONYXKEYS';
import MoneyRequestAmountForm from '../../../steps/MoneyRequestAmountForm';

const propTypes = {};

const defaultProps = {};

function IOURequestCreateTabDistance(props) {
    console.log('[tim] distance', props);

    const currentCurrency = lodashGet(route, 'params.currency', '');

    const currency = CurrencyUtils.isValidCurrencyCode(currentCurrency) ? currentCurrency : iou.currency;

    return (
        <MoneyRequestAmountForm
            isEditing={false}
            currency={transaction.currency}
            amount={transaction.amount}
            ref={(e) => (textInput.current = e)}
            onCurrencyButtonPress={navigateToCurrencySelectionPage}
            onSubmitButtonPress={navigateToNextPage}
        />
    );
}

IOURequestCreateTabDistance.propTypes = propTypes;
IOURequestCreateTabDistance.defaultProps = defaultProps;
IOURequestCreateTabDistance.displayName = 'IOURequestCreateTabDistance';

export default withOnyx({
    transaction: {
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}new`,
    },
})(IOURequestCreateTabDistance);
