import React from 'react';
import {Text} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {useRoute} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import useLocalize from '../../../../../../hooks/useLocalize';
import * as IOUUtils from '../../../../../../libs/IOUUtils';
import TabContentWithEditing from '../TabContentWithEditing';

const propTypes = {};

const defaultProps = {};

function IOUCreateRequestTabDistance(props) {
    const route = useRoute();
    const iouType = lodashGet(route, 'params.iouType');
    console.log('[tim] distance', props);
    const {translate} = useLocalize();

    // @TODO const content = (
    //     <MoneyRequestAmountForm
    //         isEditing={isEditing}
    //         currency={currency}
    //         amount={iou.amount}
    //         ref={(e) => (textInput.current = e)}
    //         onCurrencyButtonPress={navigateToCurrencySelectionPage}
    //         onSubmitButtonPress={navigateToNextPage}
    //     />
    // );

    return (
        <TabContentWithEditing
            // @TODO onBackButtonPress={navigateBack}
            onBackButtonPress={() => {}}
            shouldShowNotFound={!IOUUtils.isValidMoneyRequestType(iouType)}
            title={translate('iou.amount')}
            testID={IOUCreateRequestTabDistance.displayName}
        >
            <Text>Distance Tab</Text>
        </TabContentWithEditing>
    );
}

IOUCreateRequestTabDistance.propTypes = propTypes;
IOUCreateRequestTabDistance.defaultProps = defaultProps;
IOUCreateRequestTabDistance.displayName = 'IOUCreateRequestTabDistance';

export default withOnyx({})(IOUCreateRequestTabDistance);
