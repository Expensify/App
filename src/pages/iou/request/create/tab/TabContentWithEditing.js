import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import FullPageNotFoundView from '../../../../../components/BlockingViews/FullPageNotFoundView';
import styles from '../../../../../styles/styles';
import HeaderWithBackButton from '../../../../../components/HeaderWithBackButton';
import ScreenWrapper from '../../../../../components/ScreenWrapper';

const propTypes = {
    /** The main content to display in the tab */
    children: PropTypes.node.isRequired,

    /** Whether or not the field is being created the first time or changed later (but before saved) */
    isEditing: PropTypes.bool.isRequired,

    /** A function that is called when the back button is pressed */
    onBackButtonPress: PropTypes.func.isRequired,

    /** Whether or not the NOT FOUND component should be showen */
    shouldShowNotFound: PropTypes.bool.isRequired,

    /** The title to display in the header */
    title: PropTypes.string.isRequired,

    /** An ID used for selecting this UI in tests */
    testID: PropTypes.string.isRequired,
};

function TabContentWithEditing({children, onBackButtonPress, shouldShowNotFound, testID, title, isEditing}) {
    // ScreenWrapper is only needed in edit mode because we have a dedicated route for the edit amount page (MoneyRequestEditAmountPage).
    // The rest of the cases this component is rendered through <MoneyRequestSelectorPage /> which has it's own ScreenWrapper
    if (!isEditing) {
        return children;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            // @TODO figure out how to add this back onEntryTransitionEnd={focusTextInput}
            onEntryTransitionEnd={() => {}}
            testID={testID}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={shouldShowNotFound}>
                    <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                        <HeaderWithBackButton
                            title={title}
                            onBackButtonPress={onBackButtonPress}
                        />
                        {children}
                    </View>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

TabContentWithEditing.propTypes = propTypes;
TabContentWithEditing.displayName = 'TabContentWithEditing';

export default TabContentWithEditing;
