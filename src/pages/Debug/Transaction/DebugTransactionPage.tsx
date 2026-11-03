import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Debug from '@libs/actions/Debug';
import DebugUtils from '@libs/DebugUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {DebugTabNavigatorRoutes} from '@libs/Navigation/DebugTabNavigator';
import DebugTabNavigator from '@libs/Navigation/DebugTabNavigator';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {DebugParamList} from '@libs/Navigation/types';
import {getTagLists} from '@libs/PolicyUtils';
import {hasEnabledTags} from '@libs/TagsOptionsListUtils';

import DebugDetails from '@pages/Debug/DebugDetails';
import DebugJSON from '@pages/Debug/DebugJSON';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

import DebugTransactionViolations from './DebugTransactionViolations';

type DebugTransactionPageProps = PlatformStackScreenProps<DebugParamList, typeof SCREENS.DEBUG.TRANSACTION>;

function DebugTransactionPage({
    route: {
        params: {transactionID},
    },
}: DebugTransactionPageProps) {
    const {translate} = useLocalize();
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transaction?.reportID)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(report?.policyID)}`);
    const policyTagLists = getTagLists(policyTags);

    const styles = useThemeStyles();

    const detailsTab = (
        <DebugDetails
            formType={CONST.DEBUG.FORMS.TRANSACTION}
            data={transaction}
            policyID={report?.policyID}
            policyHasEnabledTags={hasEnabledTags(policyTagLists)}
            onSave={(data) => {
                Debug.setDebugData(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, data);
            }}
            onDelete={() => {
                Navigation.goBack(undefined, {
                    // We need to wait for navigation animations to finish before deleting a transaction,
                    // otherwise the user will see a not found page briefly.
                    afterTransition: () => {
                        Debug.setDebugData(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, null);
                    },
                });
            }}
            validate={DebugUtils.validateTransactionDraftProperty}
        >
            <View style={[styles.mh5, styles.mb5]}>
                <Button
                    onPress={() => {
                        Navigation.navigate(ROUTES.DEBUG_REPORT.getRoute(`${transaction?.reportID}`));
                    }}
                >
                    <Button.Text>{translate('debug.viewReport')}</Button.Text>
                </Button>
            </View>
        </DebugDetails>
    );

    const jsonTab = <DebugJSON data={transaction ?? {}} />;

    const transactionViolationsTab = <DebugTransactionViolations transactionID={transactionID} />;

    const routes: DebugTabNavigatorRoutes = [
        {name: CONST.DEBUG.DETAILS, content: detailsTab},
        {name: CONST.DEBUG.JSON, content: jsonTab},
        {name: CONST.DEBUG.TRANSACTION_VIOLATIONS, content: transactionViolationsTab},
    ];

    if (!transaction) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            shouldEnableMinHeight={canUseTouchScreen()}
            testID="DebugTransactionPage"
        >
            {({safeAreaPaddingBottomStyle}) => (
                <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                    <HeaderWithBackButton
                        title={`${translate('debug.debug')} - ${translate('debug.transaction')}`}
                        onBackButtonPress={Navigation.goBack}
                    />
                    <DebugTabNavigator
                        id={CONST.TAB.DEBUG_TAB_ID}
                        routes={routes}
                    />
                </View>
            )}
        </ScreenWrapper>
    );
}

export default DebugTransactionPage;
