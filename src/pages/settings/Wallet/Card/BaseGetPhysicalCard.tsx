import React, {useCallback, useEffect, useRef} from 'react';
import type {ReactNode} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import * as FormActions from '@libs/actions/FormActions';
import * as Wallet from '@libs/actions/Wallet';
import * as CardUtils from '@libs/CardUtils';
import * as GetPhysicalCardUtils from '@libs/GetPhysicalCardUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {GetPhysicalCardForm} from '@src/types/form';
import type {CardList, LoginList, PrivatePersonalDetails, Session} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type OnValidate = (values: OnyxEntry<GetPhysicalCardForm>) => Errors;

type RenderContentProps = ChildrenProps & {
    onSubmit: () => void;
    submitButtonText: string;
    onValidate: OnValidate;
};

type BaseGetPhysicalCardOnyxProps = {
    /** List of available assigned cards */
    cardList: OnyxEntry<CardList>;

    /** User's private personal details */
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;

    /** Draft values used by the get physical card form */
    draftValues: OnyxEntry<GetPhysicalCardForm>;

    /** Session info for the currently logged in user. */
    session: OnyxEntry<Session>;

    /** List of available login methods */
    loginList: OnyxEntry<LoginList>;
};

type BaseGetPhysicalCardProps = BaseGetPhysicalCardOnyxProps & {
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
            onSubmit={onSubmit}
            style={[styles.flex1, styles.mh5]}
            validate={onValidate}
        >
            {children}
        </FormProvider>
    );
}

function BaseGetPhysicalCard({
    cardList,
    children,
    currentRoute,
    domain,
    draftValues,
    privatePersonalDetails,
    headline,
    isConfirmation = false,
    loginList,
    renderContent = DefaultRenderContent,
    session,
    submitButtonText,
    title,
    onValidate = () => ({}),
}: BaseGetPhysicalCardProps) {
    const styles = useThemeStyles();
    const isRouteSet = useRef(false);

    const domainCards = CardUtils.getDomainCards(cardList)[domain] || [];
    const cardToBeIssued = domainCards.find((card) => !card?.nameValuePairs?.isVirtual && card?.state === CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED);
    const cardID = cardToBeIssued?.cardID.toString() ?? '-1';

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

    const onSubmit = useCallback(() => {
        const updatedPrivatePersonalDetails = GetPhysicalCardUtils.getUpdatedPrivatePersonalDetails(draftValues, privatePersonalDetails);
        // If the current step of the get physical card flow is the confirmation page
        if (isConfirmation) {
            Wallet.requestPhysicalExpensifyCard(cardToBeIssued?.cardID ?? -1, session?.authToken ?? '', updatedPrivatePersonalDetails);
            // Form draft data needs to be erased when the flow is complete,
            // so that no stale data is left on Onyx
            FormActions.clearDraftValues(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM);
            Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(cardID.toString()));
            return;
        }
        GetPhysicalCardUtils.goToNextPhysicalCardRoute(domain, updatedPrivatePersonalDetails);
    }, [cardID, cardToBeIssued?.cardID, domain, draftValues, isConfirmation, session?.authToken, privatePersonalDetails]);
    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicator={false}
            testID={BaseGetPhysicalCard.displayName}
        >
            <HeaderWithBackButton
                title={title}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET_DOMAINCARD.getRoute(cardID))}
            />
            <Text style={[styles.textHeadline, styles.mh5, styles.mb5]}>{headline}</Text>
            {renderContent({onSubmit, submitButtonText, children, onValidate})}
        </ScreenWrapper>
    );
}

BaseGetPhysicalCard.displayName = 'BaseGetPhysicalCard';

export default withOnyx<BaseGetPhysicalCardProps, BaseGetPhysicalCardOnyxProps>({
    cardList: {
        key: ONYXKEYS.CARD_LIST,
    },
    loginList: {
        key: ONYXKEYS.LOGIN_LIST,
    },
    session: {
        key: ONYXKEYS.SESSION,
    },
    privatePersonalDetails: {
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    },
    draftValues: {
        key: ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM_DRAFT,
    },
})(BaseGetPhysicalCard);

export type {RenderContentProps};
