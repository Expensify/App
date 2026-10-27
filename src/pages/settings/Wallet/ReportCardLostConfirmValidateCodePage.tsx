import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useInitialOnyxValue from '@hooks/useInitialOnyxValue';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';

import {clearCardListErrors, requestReplacementExpensifyCard} from '@libs/actions/Card';
import {setErrors} from '@libs/actions/FormActions';
import {requestValidateCodeAction} from '@libs/actions/User';
import {getLatestErrorMessageField} from '@libs/ErrorUtils';
import removeDynamicRouteFromPath from '@libs/Navigation/helpers/dynamicRoutesUtils/removeDynamicRouteFromPath';
import getCardDetailsPathForCard from '@libs/Navigation/helpers/getCardDetailsPathForCard';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {CONST as COMMON_CONST} from 'expensify-common';
import {deepEqual} from 'fast-equals';
import React, {useEffect} from 'react';

import SuccessReportCardLost from './SuccessReportCardLost';

type ReportCardLostConfirmValidateCodePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DYNAMIC_REPORT_CARD_LOST_OR_DAMAGED_CONFIRM_VALIDATE_CODE>;

function ReportCardLostConfirmValidateCodePage({
    route: {
        params: {cardID = '', reason = 'damaged'},
    },
}: ReportCardLostConfirmValidateCodePageProps) {
    const {translate} = useLocalize();
    const [formData] = useOnyx(ONYXKEYS.FORMS.REPORT_PHYSICAL_CARD_FORM);

    const primaryLogin = usePrimaryContactMethod();
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const initialCardList = useInitialOnyxValue(ONYXKEYS.CARD_LIST);
    const physicalCard = cardList?.[cardID];
    const validateError = getLatestErrorMessageField(physicalCard);

    const newCardID = Object.keys(cardList ?? {}).find((key) => !Object.hasOwn(initialCardList ?? {}, key) && cardList?.[key]?.cardID) ?? '';
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WALLET_CARD_REPLACE_VALIDATE_CODE.path);
    const newCardDetailsPath = getCardDetailsPathForCard(removeDynamicRouteFromPath(backPath, DYNAMIC_ROUTES.WALLET_CARD_REPORT_LOST_OR_DAMAGED.path) ?? backPath, newCardID);

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

    const handleValidateCodeEntered = (validateCode: string) => {
        if (!physicalCard) {
            return;
        }
        requestReplacementExpensifyCard(physicalCard.cardID, reason, validateCode);
    };

    if (newCardID) {
        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom
                testID="ReportCardLostConfirmValidateCodePage"
            >
                <HeaderWithBackButton
                    title={translate('common.success')}
                    onBackButtonPress={() => Navigation.goBack(newCardDetailsPath, {compareParams: false})}
                />
                <SuccessReportCardLost cardDetailsPath={newCardDetailsPath} />
            </ScreenWrapper>
        );
    }

    return (
        <ValidateCodeActionContent
            validateCodeActionErrorField="replaceLostCard"
            handleSubmitForm={handleValidateCodeEntered}
            isLoading={formData?.isLoading}
            title={translate('cardPage.validateCardTitle')}
            descriptionPrimary={translate('cardPage.enterSecurityCode', primaryLogin ?? '')}
            sendValidateCode={() => requestValidateCodeAction({reasonCode: COMMON_CONST.VALIDATE_CODE_REASONS.REPLACE_CARD, reasonCardID: Number(cardID)})}
            validateError={validateError}
            clearError={() => {
                if (!physicalCard?.cardID) {
                    return;
                }
                clearCardListErrors(physicalCard?.cardID);
            }}
            onClose={() => {
                Navigation.goBack(backPath);
            }}
        />
    );
}

export default ReportCardLostConfirmValidateCodePage;
