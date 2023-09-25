import React from 'react';
import {View, Text} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {useRoute} from '@react-navigation/native';
import useLocalize from '../../../../../../hooks/useLocalize';
import * as IOUUtils from '../../../../../../libs/IOUUtils';
import FullPageNotFoundView from '../../../../../../components/BlockingViews/FullPageNotFoundView';
import styles from '../../../../../../styles/styles';
import HeaderWithBackButton from '../../../../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../../../../components/ScreenWrapper';

const propTypes = {};

const defaultProps = {};

function IOUCreateRequestTabDistance() {
    const {params: iouType, transactionID, reportID} = useRoute();
    const {translate} = useLocalize();
    const isEditing = false;

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
    const content = <Text>Distance Tab</Text>;

    // ScreenWrapper is only needed in edit mode because we have a dedicated route for the edit amount page (MoneyRequestEditAmountPage).
    // The rest of the cases this component is rendered through <MoneyRequestSelectorPage /> which has it's own ScreenWrapper
    if (!isEditing) {
        return content;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            // @TODO onEntryTransitionEnd={focusTextInput}
            onEntryTransitionEnd={() => {}}
            testID={IOUCreateRequestTabDistance.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType)}>
                    <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                        <HeaderWithBackButton
                            title={translate('iou.amount')}
                            // @TODO onBackButtonPress={navigateBack}
                            onBackButtonPress={() => {}}
                        />
                        {content}
                    </View>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

IOUCreateRequestTabDistance.propTypes = propTypes;
IOUCreateRequestTabDistance.defaultProps = defaultProps;
IOUCreateRequestTabDistance.displayName = 'IOUCreateRequestTabDistance';

export default withOnyx({})(IOUCreateRequestTabDistance);
