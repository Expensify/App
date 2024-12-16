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
import * as FormActions from '@libs/actions/FormActions';
import * as User from '@libs/actions/User';
import * as Wallet from '@libs/actions/Wallet';
import * as CardUtils from '@libs/CardUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as GetPhysicalCardUtils from '@libs/GetPhysicalCardUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
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
}: BaseGetPhysicalCardProps) {
    const styles = useThemeStyles();
    const isRouteSet = useRef(false);
    const {translate} = useLocalize();
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);
    const [draftValues] = useOnyx(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM_DRAFT);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [isActionCodeModalVisible, setActionCodeModalVisible] = useState(false);
    const [formData] = useOnyx(ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM);
    const domainCards = CardUtils.getDomainCards(cardList)[domain] || [];
    const cardToBeIssued = domainCards.find((card) => !card?.nameValuePairs?.isVirtual && card?.state === CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED);
    const [currentCardID, setCurrentCardID] = useState<string | undefined>(cardToBeIssued?.cardID.toString());
    const errorMessage = ErrorUtils.getLatestErrorMessageField(cardToBeIssued);

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
            Navigation.goBack(ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(cardToBeIssued.cardID.toString()));
            return;
        }

        if (!draftValues) {
            const updatedDraftValues = GetPhysicalCardUtils.getUpdatedDraftValues(undefined, privatePersonalDetails, loginList);
            // Form draft data needs to be initialized with the private personal details
            // If no draft data exists
            FormActions.setDraftValues(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM, updatedDraftValues);
            return;
        }

        // Redirect user to previous steps of the flow if he hasn't finished them yet
        GetPhysicalCardUtils.setCurrentRoute(currentRoute, domain, GetPhysicalCardUtils.getUpdatedPrivatePersonalDetails(draftValues, privatePersonalDetails));
        isRouteSet.current = true;
    }, [cardList, currentRoute, domain, domainCards.length, draftValues, loginList, cardToBeIssued, privatePersonalDetails]);

    useEffect(() => {
        // Current step of the get physical card flow should be the confirmation page; and
        // Card has NOT_ACTIVATED state when successfully being issued so cardToBeIssued should be undefined
        if (!isConfirmation || !!cardToBeIssued || !currentCardID) {
            return;
        }

        // Form draft data needs to be erased when the flow is complete,
        // so that no stale data is left on Onyx
        FormActions.clearDraftValues(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM);
        Wallet.clearPhysicalCardError(currentCardID);
        Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(currentCardID));
        setCurrentCardID(undefined);
    }, [currentCardID, isConfirmation, cardToBeIssued]);

    const onSubmit = useCallback(() => {
        const updatedPrivatePersonalDetails = GetPhysicalCardUtils.getUpdatedPrivatePersonalDetails(draftValues, privatePersonalDetails);
        if (isConfirmation) {
            setActionCodeModalVisible(true);
            return;
        }
        GetPhysicalCardUtils.goToNextPhysicalCardRoute(domain, updatedPrivatePersonalDetails);
    }, [isConfirmation, domain, draftValues, privatePersonalDetails]);

    const handleIssuePhysicalCard = useCallback(
        (validateCode: string) => {
            setCurrentCardID(cardToBeIssued?.cardID.toString());
            const updatedPrivatePersonalDetails = GetPhysicalCardUtils.getUpdatedPrivatePersonalDetails(draftValues, privatePersonalDetails);
            Wallet.requestPhysicalExpensifyCard(cardToBeIssued?.cardID ?? -1, session?.authToken ?? '', updatedPrivatePersonalDetails, validateCode);
        },
        [cardToBeIssued?.cardID, draftValues, session?.authToken, privatePersonalDetails],
    );

    const handleBackButtonPress = useCallback(() => {
        if (currentCardID) {
            Navigation.goBack(ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(currentCardID));
            return;
        }
        Navigation.goBack();
    }, [currentCardID]);

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicator={false}
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
                sendValidateCode={() => User.requestValidateCodeAction()}
                clearError={() => Wallet.clearPhysicalCardError(currentCardID)}
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
