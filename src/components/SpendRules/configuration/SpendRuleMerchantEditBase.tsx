import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/SpendRuleMerchantEditForm';

type SpendRuleMerchantEditBasePageProps = {
    policyID: string;
    merchantIndex: string;
    merchantNames: string[];
    merchantMatchTypes: Array<ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>>;
    onMerchantDataChange: (merchantNames: string[], merchantMatchTypes: Array<ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>>) => void;
};

type MatchTypeItem = ListItem & {
    value: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;
};

function SpendRuleMerchantEditBase({policyID, merchantIndex, merchantMatchTypes, merchantNames, onMerchantDataChange}: SpendRuleMerchantEditBasePageProps) {
    const navigation = useNavigation();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();

    const isNew = merchantIndex === ROUTES.NEW;
    const index = isNew ? -1 : Number(merchantIndex);
    const existingMerchantName = isNew ? undefined : merchantNames.at(index);
    const existingMerchantMatchType = isNew ? undefined : merchantMatchTypes.at(index);

    const [merchantName, setMerchantName] = useState(existingMerchantName ?? '');
    const [matchType, setMatchType] = useState<ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>>(existingMerchantMatchType ?? CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS);

    const matchTypeItems: MatchTypeItem[] = [
        {
            value: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
            keyForList: CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
            text: translate('workspace.rules.merchantRules.matchTypeContains'),
            isSelected: matchType === CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS,
        },
        {
            value: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
            keyForList: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
            text: translate('workspace.rules.merchantRules.matchTypeExact'),
            isSelected: matchType === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
        },
    ];

    const goBack = () => {
        navigation.goBack();
    };

    const submit = () => {
        const trimmedMerchantName = merchantName.trim();

        if (!trimmedMerchantName) {
            if (!isNew) {
                const updatedMerchantNames = merchantNames.filter((_, merchantArrayIndex) => merchantArrayIndex !== index);
                const updatedMerchantMatchTypes = merchantMatchTypes.filter((_, merchantArrayIndex) => merchantArrayIndex !== index);
                onMerchantDataChange(updatedMerchantNames, updatedMerchantMatchTypes);
            }
            goBack();
            return;
        }

        const updatedMerchantNames = isNew
            ? [...merchantNames, trimmedMerchantName]
            : merchantNames.map((name, merchantArrayIndex) => (merchantArrayIndex === index ? trimmedMerchantName : name));

        const updatedMerchantMatchTypes = isNew
            ? [...merchantMatchTypes, matchType]
            : merchantMatchTypes.map((type, merchantArrayIndex) => (merchantArrayIndex === index ? matchType : type));

        onMerchantDataChange(updatedMerchantNames, updatedMerchantMatchTypes);
        goBack();
    };

    const onSelectMatchType = (item: MatchTypeItem) => {
        setMatchType(item.value);
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            <ScreenWrapper
                testID="SpendRuleMerchantEditPage"
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('common.merchant')}
                    onBackButtonPress={goBack}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.SPEND_RULE_MERCHANT_EDIT_FORM}
                    submitButtonText={translate('common.save')}
                    style={[styles.flex1, styles.mt3]}
                    onSubmit={submit}
                    enabledWhenOffline
                    shouldHideFixErrorsAlert
                    submitButtonStyles={[styles.ph5]}
                >
                    <View style={[styles.mb5, styles.ph5]}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.MERCHANT_NAME}
                            label={translate('common.merchant')}
                            accessibilityLabel={translate('common.merchant')}
                            value={merchantName}
                            onChangeText={setMerchantName}
                            ref={inputCallbackRef}
                            role={CONST.ROLE.PRESENTATION}
                        />
                    </View>
                    <View style={[styles.pb2, styles.ph5]}>
                        <Text style={[styles.textLabelSupporting]}>{translate('workspace.rules.spendRules.matchType')}</Text>
                    </View>
                    <SelectionList
                        shouldSingleExecuteRowSelect
                        data={matchTypeItems}
                        ListItem={SingleSelectListItem}
                        onSelectRow={onSelectMatchType}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default SpendRuleMerchantEditBase;
