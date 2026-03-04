import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubPageHeader from '@components/InteractiveStepSubPageHeader';
import {useMultifactorAuthentication} from '@components/MultifactorAuthentication/Context';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDraftValues} from '@libs/actions/FormActions';
import {buildSetPersonalDetailsAndShipExpensifyCardsParams} from '@libs/actions/PersonalDetails';
import type SetPersonalDetailsAndShipExpensifyCardsParams from '@libs/API/parameters/SetPersonalDetailsAndShipExpensifyCardsParams';
import {normalizeCountryCode} from '@libs/CountryUtils';
import Navigation from '@libs/Navigation/Navigation';
import {findPageIndex} from '@libs/SubPageUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isExpensifyCardUkEuSupportedSelector} from '@src/selectors/Card';
import type {PersonalDetailsForm} from '@src/types/form';
import type {CardList, PrivatePersonalDetails} from '@src/types/onyx';
import {usePin} from './PinContext';
import Address from './subPages/Address';
import Confirmation from './subPages/Confirmation';
import DateOfBirth from './subPages/DateOfBirth';
import LegalName from './subPages/LegalName';
import PhoneNumber from './subPages/PhoneNumber';
import Pin from './subPages/Pin';
import type {CustomSubPageProps} from './types';
import {getInitialSubPage, getSubPageValues} from './utils';

type MissingPersonalDetailsContentProps = {
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;
    draftValues: OnyxEntry<PersonalDetailsForm>;

    /** Optional custom header title */
    headerTitle?: string;

    /** Completion handler */
    onComplete: () => void;

    /** Card ID for the card that the user is adding personal details to */
    cardID: string;

    /** Whether this is the card-ordering flow */
    isCardOrderFlow?: boolean;
};

const baseFormPages = [
    {pageName: CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.LEGAL_NAME, component: LegalName},
    {pageName: CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.DATE_OF_BIRTH, component: DateOfBirth},
    {pageName: CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.ADDRESS, component: Address},
    {pageName: CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.PHONE_NUMBER, component: PhoneNumber},
];

const pinPage = {pageName: CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.PIN, component: Pin};
const confirmPage = {pageName: CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.CONFIRM, component: Confirmation};

function MissingPersonalDetailsContent({privatePersonalDetails, draftValues, headerTitle, onComplete, cardID, isCardOrderFlow = false}: MissingPersonalDetailsContentProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {executeScenario} = useMultifactorAuthentication();
    const {translate} = useLocalize();
    const isUKEUCardSelector = useCallback((cardList: OnyxEntry<CardList>) => isExpensifyCardUkEuSupportedSelector(cardList, cardID), [cardID]);
    const [isUKEUCard] = useOnyx(ONYXKEYS.CARD_LIST, {selector: isUKEUCardSelector});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const {pin, isConfirmStep, setIsConfirmStep} = usePin();
    const shouldCollectPin = isCardOrderFlow && !!isUKEUCard;

    // Build form pages dynamically based on whether this is a UK/EU card
    const formPages = useMemo(() => {
        if (shouldCollectPin) {
            return [...baseFormPages, pinPage, confirmPage];
        }
        return [...baseFormPages, confirmPage];
    }, [shouldCollectPin]);

    const stepIndexList = shouldCollectPin ? CONST.MISSING_PERSONAL_DETAILS.STEP_INDEX_LIST_WITH_PIN : CONST.MISSING_PERSONAL_DETAILS.STEP_INDEX_LIST;

    const values = useMemo(() => normalizeCountryCode(getSubPageValues(privatePersonalDetails, draftValues)) as PersonalDetailsForm, [privatePersonalDetails, draftValues]);

    const startFrom = useMemo(() => {
        const initialPage = getInitialSubPage(values, shouldCollectPin, pin);
        return findPageIndex<CustomSubPageProps>(formPages, initialPage);
    }, [formPages, values, shouldCollectPin, pin]);

    const handleFinishStep = () => {
        if (shouldCollectPin) {
            if (isOffline || !cardID) {
                return;
            }

            if (!pin) {
                Navigation.navigate(ROUTES.MISSING_PERSONAL_DETAILS.getRoute(cardID, CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.PIN));
                return;
            }

            const personalDetailsParams: Omit<SetPersonalDetailsAndShipExpensifyCardsParams, 'validateCode'> = buildSetPersonalDetailsAndShipExpensifyCardsParams(values, countryCode);
            executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.SET_PIN_ORDER_CARD, {
                ...personalDetailsParams,
                pin,
                cardID,
            });
        } else {
            onComplete();
        }
    };

    const {CurrentPage, isEditing, currentPageName, pageIndex, prevPage, nextPage, moveTo, isRedirecting} = useSubPage<CustomSubPageProps>({
        pages: formPages,
        startFrom,
        onFinished: handleFinishStep,
        buildRoute: (pageName, action) => ROUTES.MISSING_PERSONAL_DETAILS.getRoute(cardID, pageName, action),
    });

    if (isRedirecting) {
        return <FullScreenLoadingIndicator />;
    }

    const handleBackButtonPress = () => {
        // If on PIN confirmation step, go back to PIN entry step
        if (currentPageName === CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.PIN && isConfirmStep) {
            setIsConfirmStep(false);
            return;
        }

        if (isEditing) {
            Navigation.goBack(ROUTES.MISSING_PERSONAL_DETAILS.getRoute(cardID, CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.CONFIRM));
            return;
        }

        // Clicking back on the first screen should dismiss the modal
        if (currentPageName === CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.LEGAL_NAME) {
            clearDraftValues(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM);
            Navigation.closeRHPFlow();
            return;
        }
        prevPage();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID="MissingPersonalDetailsContent"
        >
            <HeaderWithBackButton
                title={headerTitle ?? translate('workspace.expensifyCard.addShippingDetails')}
                onBackButtonPress={handleBackButtonPress}
            />
            <View style={[styles.ph5, styles.mb3, styles.mt3, {height: CONST.NETSUITE_FORM_STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubPageHeader
                    stepNames={stepIndexList}
                    currentStepIndex={pageIndex}
                    onStepSelected={moveTo}
                />
            </View>
            <CurrentPage
                isEditing={isEditing}
                onNext={nextPage}
                onMove={moveTo}
                currentPageName={currentPageName}
                personalDetailsValues={values}
                shouldCollectPin={shouldCollectPin}
            />
        </ScreenWrapper>
    );
}

export default MissingPersonalDetailsContent;
