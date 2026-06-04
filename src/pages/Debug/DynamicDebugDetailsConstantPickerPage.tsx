import React, {useCallback} from 'react';
import {View} from 'react-native';
import CategoryPicker from '@components/CategoryPicker';
import CurrencySelectionList from '@components/CurrencySelectionList';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {DebugParamList} from '@libs/Navigation/types';
import {appendParam} from '@libs/Url';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import TRANSACTION_FORM_INPUT_IDS from '@src/types/form/DebugTransactionForm';
import ConstantPicker from './ConstantPicker';
import DebugTagPicker from './DebugTagPicker';

type DynamicDebugDetailsConstantPickerPageProps = PlatformStackScreenProps<DebugParamList, typeof SCREENS.DEBUG.DYNAMIC_DETAILS_CONSTANT_PICKER_PAGE>;

function DynamicDebugDetailsConstantPickerPage({
    route: {
        params: {formType, fieldName, fieldValue, policyID = ''},
    },
}: DynamicDebugDetailsConstantPickerPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.DETAILS_CONSTANT_PICKER.path);
    const onSubmit = (item: {text?: string; keyForList?: string}) => {
        const value = item.text === fieldValue ? '' : (item.text ?? '');
        Navigation.goBack(appendParam(backPath, fieldName ?? '', value), {compareParams: false});
    };

    const renderPicker = useCallback(() => {
        if (([TRANSACTION_FORM_INPUT_IDS.CURRENCY, TRANSACTION_FORM_INPUT_IDS.MODIFIED_CURRENCY, TRANSACTION_FORM_INPUT_IDS.ORIGINAL_CURRENCY] as string[]).includes(fieldName)) {
            return (
                <CurrencySelectionList
                    onSelect={({currencyCode}) =>
                        onSubmit({
                            text: currencyCode,
                            keyForList: currencyCode,
                        })
                    }
                    searchInputLabel={translate('common.search')}
                />
            );
        }
        if (formType === CONST.DEBUG.FORMS.TRANSACTION) {
            if (fieldName === TRANSACTION_FORM_INPUT_IDS.CATEGORY) {
                return (
                    <CategoryPicker
                        policyID={policyID}
                        selectedCategory={fieldValue}
                        onSubmit={onSubmit}
                    />
                );
            }
            if (fieldName === TRANSACTION_FORM_INPUT_IDS.TAG) {
                return (
                    <DebugTagPicker
                        policyID={policyID}
                        tagName={fieldValue}
                        onSubmit={onSubmit}
                    />
                );
            }
        }

        return (
            <ConstantPicker
                formType={formType}
                fieldName={fieldName}
                fieldValue={fieldValue}
                onSubmit={onSubmit}
            />
        );
    }, [fieldName, fieldValue, formType, onSubmit, policyID, translate]);

    return (
        <ScreenWrapper testID="DebugDetailsConstantPickerPage">
            <HeaderWithBackButton
                title={fieldName}
                shouldShowBackButton
                onBackButtonPress={() => {
                    Navigation.goBack(fieldValue ? appendParam(backPath, fieldName, fieldValue) : backPath, {compareParams: false});
                }}
            />
            <View style={styles.containerWithSpaceBetween}>{renderPicker()}</View>
        </ScreenWrapper>
    );
}

export default DynamicDebugDetailsConstantPickerPage;
