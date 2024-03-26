import {useFocusEffect} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as IOUUtils from '@libs/IOUUtils';
import * as MoneyRequestUtils from '@libs/MoneyRequestUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {IOU as IOUType, Report, SelectedTabRequest} from '@src/types/onyx';
import MoneyRequestAmountForm from './MoneyRequestAmountForm';

type NavigateToNextPageOptions = {amount: string};

type NewRequestAmountPageOnyxProps = {
    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: OnyxEntry<IOUType>;

    /** The report on which the request is initiated on */
    report: OnyxEntry<Report>;

    /** The current tab we have navigated to in the request modal. String that corresponds to the request type. */
    selectedTab: OnyxEntry<SelectedTabRequest>;
};

type NewRequestAmountPageProps = NewRequestAmountPageOnyxProps & StackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.AMOUNT>;

function NewRequestAmountPage({route, iou, report, selectedTab}: NewRequestAmountPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const prevMoneyRequestID = useRef(iou?.id);
    const textInput = useRef<BaseTextInputRef | null>(null);

    const iouType = route.params.iouType ?? '';
    const reportID = route.params.reportID ?? '';
    const isEditing = Navigation.getActiveRoute().includes('amount');
    const currentCurrency = route.params.currency ?? '';
    const isDistanceRequestTab = MoneyRequestUtils.isDistanceRequest(iouType, selectedTab);

    const currency = CurrencyUtils.isValidCurrencyCode(currentCurrency) ? currentCurrency : iou?.currency ?? '';

    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => textInput.current?.focus(), CONST.ANIMATED_TRANSITION);
            return () => {
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, []),
    );

    // Because we use Onyx to store IOU info, when we try to make two different money requests from different tabs,
    // it can result in an IOU sent with improper values. In such cases we want to reset the flow and redirect the user to the first step of the IOU.
    useEffect(() => {
        if (isEditing) {
            // ID in Onyx could change by initiating a new request in a separate browser tab or completing a request
            if (prevMoneyRequestID.current !== iou?.id) {
                // The ID is cleared on completing a request. In that case, we will do nothing.
                if (!iou?.id) {
                    return;
                }
                Navigation.goBack(ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(iouType, report?.reportID), true);
                return;
            }
            const moneyRequestID = `${iouType}${reportID}`;
            const shouldReset = iou?.id !== moneyRequestID;
            if (shouldReset) {
                IOU.resetMoneyRequestInfo(moneyRequestID);
            }

            if (!isDistanceRequestTab && (!iou?.participants?.length || iou?.amount === 0 || shouldReset)) {
                Navigation.goBack(ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(iouType, report?.reportID), true);
            }
        }

        return () => {
            prevMoneyRequestID.current = iou?.id;
        };
    }, [isEditing, iouType, reportID, isDistanceRequestTab, report?.reportID, iou?.id, iou?.participants?.length, iou?.amount]);

    const navigateBack = () => {
        Navigation.goBack(isEditing ? ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(iouType, reportID) : ROUTES.HOME);
    };

    const navigateToCurrencySelectionPage = () => {
        // If the money request being created is a distance request, don't allow the user to choose the currency.
        // Only USD is allowed for distance requests.
        if (isDistanceRequestTab) {
            return;
        }

        // Remove query from the route and encode it.
        const activeRoute = encodeURIComponent(Navigation.getActiveRouteWithoutParams());
        Navigation.navigate(ROUTES.MONEY_REQUEST_CURRENCY.getRoute(iouType, reportID, currency, activeRoute));
    };

    const navigateToNextPage = ({amount}: NavigateToNextPageOptions) => {
        const amountInSmallestCurrencyUnits = CurrencyUtils.convertToBackendAmount(Number.parseFloat(amount));
        IOU.setMoneyRequestAmount(amountInSmallestCurrencyUnits);
        IOU.setMoneyRequestCurrency(currency);

        if (isEditing) {
            Navigation.goBack(ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(iouType, reportID));
            return;
        }

        IOU.navigateToNextPage(iou, iouType, report);
    };

    const content = (
        <MoneyRequestAmountForm
            isEditing={isEditing}
            currency={currency}
            amount={iou?.amount}
            ref={textInput}
            onCurrencyButtonPress={navigateToCurrencySelectionPage}
            onSubmitButtonPress={navigateToNextPage}
            selectedTab={selectedTab ?? CONST.TAB_REQUEST.MANUAL}
        />
    );

    // ScreenWrapper is only needed in edit mode because we have a dedicated route for the edit amount page (MoneyRequestEditAmountPage).
    // The rest of the cases this component is rendered through <MoneyRequestSelectorPage /> which has it's own ScreenWrapper
    if (!isEditing) {
        return content;
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            testID={NewRequestAmountPage.displayName}
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

NewRequestAmountPage.displayName = 'NewRequestAmountPage';

export default withOnyx<NewRequestAmountPageProps, NewRequestAmountPageOnyxProps>({
    iou: {key: ONYXKEYS.IOU},
    report: {
        key: ({route}) => `${ONYXKEYS.COLLECTION.REPORT}${route.params.reportID}`,
    },
    selectedTab: {
        key: `${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.RECEIPT_TAB_ID}`,
    },
})(NewRequestAmountPage);
