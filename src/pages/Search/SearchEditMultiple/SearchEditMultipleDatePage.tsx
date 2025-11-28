import React, {useCallback} from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/MoneyRequestDateForm';

function SearchEditMultipleDatePage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {canBeMissing: true});

    const currentDate = draftTransaction?.created ?? '';

    const saveDate = useCallback((value: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_DATE_FORM>) => {
        const newDate = value.moneyRequestCreated;
        Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {
            created: newDate,
        });
        Navigation.goBack();
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={SearchEditMultipleDatePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('common.date')}
                onBackButtonPress={Navigation.goBack}
            />
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_DATE_FORM}
                onSubmit={saveDate}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={DatePicker}
                        inputID={INPUT_IDS.MONEY_REQUEST_CREATED}
                        label={translate('common.date')}
                        defaultValue={currentDate}
                        maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                        minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

SearchEditMultipleDatePage.displayName = 'SearchEditMultipleDatePage';

export default SearchEditMultipleDatePage;
