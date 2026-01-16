import {deepEqual} from 'fast-equals';
import React, {useCallback, useEffect, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import {clearCardListErrors, requestReplacementExpensifyCard} from '@libs/actions/Card';
import {setErrors} from '@libs/actions/FormActions';
import {requestValidateCodeAction, resetValidateActionCodeSent} from '@libs/actions/User';
import {getLatestErrorMessageField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import SuccessReportCardLost from './SuccessReportCardLost';

type ReportCardLostConfirmMagicCodePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.REPORT_CARD_LOST_OR_DAMAGED_CONFIRM_MAGIC_CODE>;

function ReportCardLostConfirmMagicCodePage({
    route: {
        params: {cardID = '', reason = 'damaged'},
    },
}: ReportCardLostConfirmMagicCodePageProps) {
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const [formData] = useOnyx(ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM, {canBeMissing: true});

    const primaryLogin = account?.primaryLogin ?? '';
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const physicalCard = cardList?.[cardID];
    const [newCardID, setNewCardID] = useState<string>('');
    const previousCardList = usePrevious(cardList);
    const validateError = getLatestErrorMessageField(physicalCard);

    useEffect(() => {
        const newID = Object.keys(cardList ?? {}).find((cardKey) => cardList?.[cardKey]?.cardID && !(cardKey in (previousCardList ?? {})));
        if (!newID || physicalCard?.cardID) {
            return;
        }
        setNewCardID(newID);
    }, [cardList, physicalCard?.cardID, previousCardList]);

    useEffect(() => {
        if (formData?.isLoading) {
            return;
        }

        const newErrors = physicalCard?.errors ?? {};
        // Only update if errors have actually changed to prevent additional rerender
        if (deepEqual(newErrors, formData?.errors ?? {})) {
            return;
        }
        setErrors(ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM, newErrors);
    }, [formData?.isLoading, formData?.errors, physicalCard?.errors]);

    const handleValidateCodeEntered = useCallback(
        (validateCode: string) => {
            if (!physicalCard) {
                return;
            }
            requestReplacementExpensifyCard(physicalCard.cardID, reason, validateCode);
        },
        [physicalCard, reason],
    );

    if (newCardID) {
        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom
                testID="ReportCardLostConfirmMagicCodePage"
            >
                <HeaderWithBackButton
                    title={translate('common.success')}
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_WALLET_DOMAIN_CARD.getRoute(newCardID))}
                />
                <SuccessReportCardLost cardID={newCardID} />
            </ScreenWrapper>
        );
    }

    return (
        <ValidateCodeActionContent
            validateCodeActionErrorField="replaceLostCard"
            handleSubmitForm={handleValidateCodeEntered}
            isLoading={formData?.isLoading}
            title={translate('cardPage.validateCardTitle')}
            descriptionPrimary={translate('cardPage.enterMagicCode', primaryLogin)}
            sendValidateCode={() => requestValidateCodeAction()}
            validateError={validateError}
            clearError={() => {
                if (!physicalCard?.cardID) {
                    return;
                }
                clearCardListErrors(physicalCard?.cardID);
            }}
            onClose={() => {
                resetValidateActionCodeSent();
                Navigation.goBack(ROUTES.SETTINGS_WALLET_REPORT_CARD_LOST_OR_DAMAGED.getRoute(cardID));
            }}
        />
    );
}

export default ReportCardLostConfirmMagicCodePage;
