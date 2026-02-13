import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubPageHeader from '@components/InteractiveStepSubPageHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSubPage from '@hooks/useSubPage';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDraftValues} from '@libs/actions/FormActions';
import {isExpensifyCardUkEuSupported} from '@libs/CardUtils';
import {normalizeCountryCode} from '@libs/CountryUtils';
import Navigation from '@libs/Navigation/Navigation';
import {findPageIndex} from '@libs/SubPageUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetailsForm} from '@src/types/form';
import type {PrivatePersonalDetails} from '@src/types/onyx';
import {PinContextProvider} from './PinContext';
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

    /** Optional card ID for UK/EU card PIN flow */
    cardID?: string;
};

const baseFormPages = [
    {pageName: CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.LEGAL_NAME, component: LegalName},
    {pageName: CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.DATE_OF_BIRTH, component: DateOfBirth},
    {pageName: CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.ADDRESS, component: Address},
    {pageName: CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.PHONE_NUMBER, component: PhoneNumber},
];

const pinPage = {pageName: CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.PIN, component: Pin};
const confirmPage = {pageName: CONST.MISSING_PERSONAL_DETAILS.PAGE_NAME.CONFIRM, component: Confirmation};

function MissingPersonalDetailsContent({privatePersonalDetails, draftValues, headerTitle, onComplete, cardID}: MissingPersonalDetailsContentProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const card = cardList?.[Number(cardID)];

    const isUKEUCard = isExpensifyCardUkEuSupported(card);

    // Build form pages dynamically based on whether this is a UK/EU card
    const formPages = useMemo(() => {
        if (isUKEUCard) {
            return [...baseFormPages, pinPage, confirmPage];
        }
        return [...baseFormPages, confirmPage];
    }, [isUKEUCard]);

    const stepIndexList = isUKEUCard ? CONST.MISSING_PERSONAL_DETAILS.STEP_INDEX_LIST_WITH_PIN : CONST.MISSING_PERSONAL_DETAILS.STEP_INDEX_LIST;

    const values = useMemo(() => normalizeCountryCode(getSubPageValues(privatePersonalDetails, draftValues)) as PersonalDetailsForm, [privatePersonalDetails, draftValues]);

    const startFrom = useMemo(() => findPageIndex<CustomSubPageProps>(formPages, getInitialSubPage(values)), [formPages, values]);

    const handleFinishStep = useCallback(() => {
        if (!values) {
            return;
        }
        onComplete();
    }, [onComplete, values]);

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

    const content = (
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
                isUKEUCard={isUKEUCard}
            />
        </ScreenWrapper>
    );

    // Wrap with PinContextProvider for UK/EU cards to manage PIN state
    if (isUKEUCard) {
        return <PinContextProvider>{content}</PinContextProvider>;
    }

    return content;
}

export default MissingPersonalDetailsContent;
