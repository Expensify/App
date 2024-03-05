import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Navigation from '@libs/Navigation/Navigation';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import type SCREENS from '@src/SCREENS';
import useThemeStyles from '@hooks/useThemeStyles';
import useLocalize from '@hooks/useLocalize';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import TextInput from '@components/TextInput';
import CONST from '@src/CONST';


type CreateCategoryPageProps = StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.CATEGORY_CREATE>;

function CreateCategoryPage({route}: CreateCategoryPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    style={[styles.defaultModalContainer]}
                    testID={CreateCategoryPage.displayName}
                >
                    <HeaderWithBackButton
                        title={translate('workspace.categories.addCategory')}
                        onBackButtonPress={Navigation.goBack}
                    />
                    <FormProvider
                        onSubmit={() => {}}
                        submitButtonText={translate('common.save')}
                        validate={() => ({})}
                        style={[styles.mh5, styles.flex1]}
                        formID={"test"}
                    >
                        <InputWrapper
                            InputComponent={TextInput}
                            maxLength={100}
                            label={translate('common.name')}
                            accessibilityLabel={translate('common.name')}
                            inputID="categoryName"
                            role={CONST.ROLE.PRESENTATION}
                        />
                    </FormProvider>
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

CreateCategoryPage.displayName = 'CreateCategoryPage';

export default CreateCategoryPage;
