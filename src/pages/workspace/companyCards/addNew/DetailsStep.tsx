import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import TextLink from '@components/TextLink';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import * as CompanyCards from '@userActions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/AddNewCardFeedForm';

type DetailsStepProps = {
    /** ID of the current policy */
    policyID: string;
};

function DetailsStep({policyID}: DetailsStepProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);
    const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`);
    const feedProvider = addNewCard?.data?.feedType;
    const isStripeFeedProvider = feedProvider === CONST.COMPANY_CARD.FEED_BANK_NAME.STRIPE;
    const bank = addNewCard?.data?.selectedBank;
    const isOtherBankSelected = bank === CONST.COMPANY_CARDS.BANKS.OTHER;

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_NEW_CARD_FEED_FORM>) => {
        if (!addNewCard?.data) {
            return;
        }

        const feedDetails = Object.entries({
            ...values,
            bankName: addNewCard.data.bankName ?? 'Amex',
        })
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');

        CompanyCards.addNewCompanyCardsFeed(policyID, addNewCard.data.feedType, feedDetails, lastSelectedFeed);
        Navigation.navigate(ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
    };

    const handleBackButtonPress = () => {
        if (isOtherBankSelected) {
            CompanyCards.setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.CARD_NAME});
            return;
        }
        CompanyCards.setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS});
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_NEW_CARD_FEED_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ADD_NEW_CARD_FEED_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.BANK_ID]);

            switch (feedProvider) {
                case CONST.COMPANY_CARD.FEED_BANK_NAME.VISA:
                    if (!values[INPUT_IDS.BANK_ID]) {
                        errors[INPUT_IDS.BANK_ID] = translate('common.error.fieldRequired');
                    }
                    if (!values[INPUT_IDS.PROCESSOR_ID]) {
                        errors[INPUT_IDS.PROCESSOR_ID] = translate('common.error.fieldRequired');
                    }
                    if (!values[INPUT_IDS.COMPANY_ID]) {
                        errors[INPUT_IDS.COMPANY_ID] = translate('common.error.fieldRequired');
                    }
                    break;
                case CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD:
                    if (!values[INPUT_IDS.DISTRIBUTION_ID]) {
                        errors[INPUT_IDS.DISTRIBUTION_ID] = translate('common.error.fieldRequired');
                    }
                    break;
                case CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX:
                    if (!values[INPUT_IDS.DELIVERY_FILE_NAME]) {
                        errors[INPUT_IDS.DELIVERY_FILE_NAME] = translate('common.error.fieldRequired');
                    }
                    break;
                default:
                    break;
            }
            return errors;
        },
        [feedProvider, translate],
    );

    const renderInputs = () => {
        switch (feedProvider) {
            case CONST.COMPANY_CARD.FEED_BANK_NAME.VISA:
                return (
                    <>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.PROCESSOR_ID}
                            label={translate('workspace.companyCards.addNewCard.feedDetails.vcf.processorLabel')}
                            role={CONST.ROLE.PRESENTATION}
                            maxLength={CONST.STANDARD_LENGTH_LIMIT}
                            containerStyles={[styles.mb6]}
                            ref={inputCallbackRef}
                        />
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.BANK_ID}
                            label={translate('workspace.companyCards.addNewCard.feedDetails.vcf.bankLabel')}
                            role={CONST.ROLE.PRESENTATION}
                            maxLength={CONST.STANDARD_LENGTH_LIMIT}
                            containerStyles={[styles.mb6]}
                        />
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.COMPANY_ID}
                            label={translate('workspace.companyCards.addNewCard.feedDetails.vcf.companyLabel')}
                            role={CONST.ROLE.PRESENTATION}
                            maxLength={CONST.STANDARD_LENGTH_LIMIT}
                            containerStyles={[styles.mb6]}
                        />
                    </>
                );
            case CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD:
                return (
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.DISTRIBUTION_ID}
                        label={translate('workspace.companyCards.addNewCard.feedDetails.cdf.distributionLabel')}
                        role={CONST.ROLE.PRESENTATION}
                        maxLength={CONST.STANDARD_LENGTH_LIMIT}
                        containerStyles={[styles.mb6]}
                        ref={inputCallbackRef}
                    />
                );
            case CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX:
                return (
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.DELIVERY_FILE_NAME}
                        label={translate('workspace.companyCards.addNewCard.feedDetails.gl1025.fileNameLabel')}
                        role={CONST.ROLE.PRESENTATION}
                        maxLength={CONST.STANDARD_LENGTH_LIMIT}
                        containerStyles={[styles.mb6]}
                        ref={inputCallbackRef}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <ScreenWrapper
            testID={DetailsStep.displayName}
            includeSafeAreaPaddingBottom
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.addCards')}
                onBackButtonPress={handleBackButtonPress}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.ADD_NEW_CARD_FEED_FORM}
                submitButtonText={translate('common.submit')}
                onSubmit={submit}
                validate={validate}
                style={[styles.mh5, styles.flexGrow1]}
                enabledWhenOffline
            >
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mv3]}>
                    {!!feedProvider && !isStripeFeedProvider ? translate(`workspace.companyCards.addNewCard.feedDetails.${feedProvider}.title`) : ''}
                </Text>
                {renderInputs()}
                {!!feedProvider && !isStripeFeedProvider && (
                    <View style={[styles.flexRow, styles.alignItemsCenter]}>
                        <Icon
                            src={Expensicons.QuestionMark}
                            width={variables.iconSizeExtraSmall}
                            height={variables.iconSizeExtraSmall}
                            fill={theme.icon}
                        />
                        <TextLink
                            style={[styles.label, styles.textLineHeightNormal, styles.ml2]}
                            href={CONST.COMPANY_CARDS_HELP}
                        >
                            {translate(`workspace.companyCards.addNewCard.feedDetails.${feedProvider}.helpLabel`)}
                        </TextLink>
                    </View>
                )}
            </FormProvider>
        </ScreenWrapper>
    );
}

DetailsStep.displayName = 'DetailsStep';

export default DetailsStep;
