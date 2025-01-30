import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import ValidateCodeActionModal from '@components/ValidateCodeActionModal';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDraftValues, setDraftValues} from '@libs/actions/FormActions';
import {updatePersonalDetailsAndShipExpensifyCards} from '@libs/actions/PersonalDetails';
import {requestValidateCodeAction} from '@libs/actions/User';
import {clearPhysicalCardError} from '@libs/actions/Wallet';
import {getDomainCards} from '@libs/CardUtils';
import {getLatestErrorMessageField} from '@libs/ErrorUtils';
import {getUpdatedDraftValues, getUpdatedPrivatePersonalDetails, goToNextPhysicalCardRoute, setCurrentRoute} from '@libs/GetPhysicalCardUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getSubstepValues} from '@pages/MissingPersonalDetails/utils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {GetPhysicalCardForm} from '@src/types/form';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type OnValidate = (values: OnyxEntry<GetPhysicalCardForm>) => Errors;

type RenderContentProps = ChildrenProps & {
    onSubmit: () => void;
    submitButtonText: string;
    onValidate: OnValidate;
};

type BaseGetPhysicalCardProps = {
    /** Text displayed below page title */
    headline: string;

    /** Children components that will be rendered by renderContent */
    children?: ReactNode;

    /** Current route from ROUTES */
    currentRoute: string;

    /** Expensify card domain */
    domain: string;

    /** Whether or not the current step of the get physical card flow is the confirmation page */
    isConfirmation?: boolean;

    /** Render prop, used to render form content */
    renderContent?: (args: RenderContentProps) => React.ReactNode;

    /** Text displayed on bottom submit button */
    submitButtonText: string;

    /** Title displayed on top of the page */
    title: string;

    /** Callback executed when validating get physical card form data */
    onValidate?: OnValidate;

    /** The route to navigate to when the back button is pressed. */
    backTo?: Route;
};

function DefaultRenderContent({onSubmit, submitButtonText, children, onValidate}: RenderContentProps) {
    const styles = useThemeStyles();

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM}
            submitButtonText={submitButtonText}
            submitButtonStyles={styles.mh5}
            onSubmit={onSubmit}
            style={styles.flex1}
            validate={onValidate}
        >
            {children}
        </FormProvider>
    );
}

function BaseGetPhysicalCard({
    children,
    currentRoute,
    domain,
    headline,
    isConfirmation = false,
    renderContent = DefaultRenderContent,
    submitButtonText,
    title,
    onValidate = () => ({}),
    backTo,
}: BaseGetPhysicalCardProps) {
    const styles = useThemeStyles();
    const isRouteSet = useRef(false);
    const {translate} = useLocalize();
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM_DRAFT);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [isActionCodeModalVisible, setActionCodeModalVisible] = useState(false);
    const [formData] = useOnyx(ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM);
    const domainCards = getDomainCards(cardList)[domain] || [];
    const cardToBeIssued = domainCards.find((card) => !card?.nameValuePairs?.isVirtual && card?.state === CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED);
    const [currentCardID, setCurrentCardID] = useState<string | undefined>(cardToBeIssued?.cardID.toString());
    const errorMessage = getLatestErrorMessageField(cardToBeIssued);

    useBeforeRemove(() => setActionCodeModalVisible(false));

    useEffect(() => {
        if (isRouteSet.current || !privatePersonalDetails || !cardList) {
            return;
        }

        // When there are no cards for the specified domain, user is redirected to the wallet page
        if (domainCards.length === 0 || !cardToBeIssued) {
            Navigation.goBack(ROUTES.SETTINGS_WALLET);
            return;
        }

        // When there's no physical card or it exists but it doesn't have the required state for this flow,
        // redirect user to the espensify card page
        if (cardToBeIssued.state !== CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED) {
            Navigation.goBack(backTo ?? ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(cardToBeIssued.cardID.toString()));
            return;
        }

        if (!draftValues) {
            const updatedDraftValues = getUpdatedDraftValues(undefined, privatePersonalDetails, loginList);
            // Form draft data needs to be initialized with the private personal details
            // If no draft data exists
            setDraftValues(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM, updatedDraftValues);
            return;
        }

        // Redirect user to previous steps of the flow if he hasn't finished them yet
        setCurrentRoute(currentRoute, domain, getUpdatedPrivatePersonalDetails(draftValues, privatePersonalDetails));
        isRouteSet.current = true;
    }, [cardList, currentRoute, domain, domainCards.length, backTo, draftValues, loginList, cardToBeIssued, privatePersonalDetails]);

    useEffect(() => {
        // Current step of the get physical card flow should be the confirmation page; and
        // Card has NOT_ACTIVATED state when successfully being issued so cardToBeIssued should be undefined
        if (!isConfirmation || !!cardToBeIssued || !currentCardID) {
            return;
        }

        // Form draft data needs to be erased when the flow is complete,
        // so that no stale data is left on Onyx
        clearDraftValues(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM);
        clearPhysicalCardError(currentCardID);
        Navigation.navigate(backTo ?? ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(currentCardID));
        setCurrentCardID(undefined);
    }, [currentCardID, isConfirmation, backTo, cardToBeIssued]);

    const onSubmit = useCallback(() => {
        const updatedPrivatePersonalDetails = getUpdatedPrivatePersonalDetails(draftValues, privatePersonalDetails);
        if (isConfirmation) {
            setActionCodeModalVisible(true);
            return;
        }
        goToNextPhysicalCardRoute(domain, updatedPrivatePersonalDetails);
    }, [isConfirmation, domain, draftValues, privatePersonalDetails]);

    const handleIssuePhysicalCard = useCallback(
        (validateCode: string) => {
            const values = getSubstepValues(privatePersonalDetails, undefined);
            setCurrentCardID(cardToBeIssued?.cardID.toString());
            updatePersonalDetailsAndShipExpensifyCards(values, validateCode, cardToBeIssued?.cardID ?? CONST.DEFAULT_NUMBER_ID);
        },
        [cardToBeIssued?.cardID, privatePersonalDetails],
    );

    const handleBackButtonPress = useCallback(() => {
        if (currentCardID) {
            Navigation.goBack(backTo ?? ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(currentCardID));
            return;
        }
        Navigation.goBack();
    }, [currentCardID, backTo]);

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            testID={BaseGetPhysicalCard.displayName}
        >
            <HeaderWithBackButton
                title={title}
                onBackButtonPress={handleBackButtonPress}
            />
            <Text style={[styles.textHeadline, styles.mh5, styles.mb5]}>{headline}</Text>
            {renderContent({onSubmit, submitButtonText, children, onValidate})}
            <ValidateCodeActionModal
                isLoading={formData?.isLoading}
                hasMagicCodeBeenSent={validateCodeAction?.validateCodeSent}
                isVisible={isActionCodeModalVisible}
                sendValidateCode={requestValidateCodeAction}
                clearError={() => clearPhysicalCardError(currentCardID)}
                validateError={!isEmptyObject(formData?.errors) ? formData?.errors : errorMessage}
                handleSubmitForm={handleIssuePhysicalCard}
                title={translate('cardPage.validateCardTitle')}
                onClose={() => setActionCodeModalVisible(false)}
                descriptionPrimary={translate('cardPage.enterMagicCode', {contactMethod: account?.primaryLogin ?? ''})}
            />
        </ScreenWrapper>
    );
}

BaseGetPhysicalCard.displayName = 'BaseGetPhysicalCard';

export default BaseGetPhysicalCard;

export type {RenderContentProps};
