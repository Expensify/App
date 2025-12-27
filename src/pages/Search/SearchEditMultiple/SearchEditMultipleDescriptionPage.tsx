import React from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateBulkEditDraftTransaction} from '@libs/actions/IOU';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/SearchEditMultipleDescriptionForm';

function SearchEditMultipleDescriptionPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`, {canBeMissing: true});

    const currentDescription = draftTransaction?.comment?.comment ?? '';

    const saveDescription = (value: FormOnyxValues<typeof ONYXKEYS.FORMS.SEARCH_EDIT_MULTIPLE_DESCRIPTION_FORM>) => {
        const newDescription = value.description?.trim() ?? '';
        updateBulkEditDraftTransaction({
            comment: {comment: newDescription},
        });
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={SearchEditMultipleDescriptionPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('common.description')}
                onBackButtonPress={Navigation.goBack}
            />
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.SEARCH_EDIT_MULTIPLE_DESCRIPTION_FORM}
                onSubmit={saveDescription}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <InputWrapper
                        valueType="string"
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.DESCRIPTION}
                        name={INPUT_IDS.DESCRIPTION}
                        defaultValue={currentDescription}
                        label={translate('common.description')}
                        accessibilityLabel={translate('common.description')}
                        role={CONST.ROLE.PRESENTATION}
                        ref={inputCallbackRef}
                        autoGrowHeight
                        maxAutoGrowHeight={variables.textInputAutoGrowMaxHeight}
                        shouldSubmitForm
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

SearchEditMultipleDescriptionPage.displayName = 'SearchEditMultipleDescriptionPage';

export default SearchEditMultipleDescriptionPage;
