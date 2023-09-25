import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import useLocalize from '../../../hooks/useLocalize';
import * as IOUUtils from '../../../libs/IOUUtils';
import FullPageNotFoundView from '../../../components/BlockingViews/FullPageNotFoundView';
import styles from '../../../styles/styles';
import HeaderWithBackButton from '../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../components/ScreenWrapper';

const propTypes = {
    /** React Navigation route */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The type of IOU report, i.e. bill, request, send */
            iouType: PropTypes.string,

            /** The optimistic ID of a new transaction that is being created */
            transactionID: PropTypes.string.isRequired,

            /** The report ID of the IOU */
            reportID: PropTypes.string,
        }),
    }).isRequired,
};

const defaultProps = {};

function CreateIOUStartTabScan() {
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
    const content = null;

    // ScreenWrapper is only needed in edit mode because we have a dedicated route for the edit amount page (MoneyRequestEditAmountPage).
    // The rest of the cases this component is rendered through <MoneyRequestSelectorPage /> which has it's own ScreenWrapper
    if (!isEditing) {
        return content;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            onEntryTransitionEnd={focusTextInput}
            testID={CreateIOUStartTabScan.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType)}>
                    <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                        <HeaderWithBackButton
                            title={translate('iou.amount')}
                            onBackButtonPress={navigateBack}
                        />
                        {content}
                    </View>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

CreateIOUStartTabScan.propTypes = propTypes;
CreateIOUStartTabScan.defaultProps = defaultProps;
CreateIOUStartTabScan.displayName = 'CreateIOUStartTabScan';

export default withOnyx({})(CreateIOUStartTabScan);
