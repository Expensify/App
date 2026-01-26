import React, {useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchSingleSelectionPicker from '@components/Search/SearchSingleSelectionPicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateDraftMerchantRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getCleanedTagName} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type AddTagPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_TAG>;

function AddTagPage({route}: AddTagPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params?.policyID ?? '-1';
    const policy = usePolicy(policyID);

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM, {canBeMissing: true});

    const selectedTagItem = form?.tag ? {name: getCleanedTagName(form.tag), value: form.tag} : undefined;

    const tagItems = useMemo(() => {
        const tagLists = policy?.tagList ?? {};
        const tags: Array<{name: string; value: string}> = [];

        Object.values(tagLists).forEach((tagList) => {
            Object.values(tagList?.tags ?? {}).forEach((tag) => {
                if (tag.enabled) {
                    tags.push({name: getCleanedTagName(tag.name), value: tag.name});
                }
            });
        });

        return tags;
    }, [policy?.tagList]);

    const backToRoute = ROUTES.RULES_MERCHANT_NEW.getRoute(policyID);

    const onSave = (value?: string) => {
        updateDraftMerchantRule({tag: value});
    };

    return (
        <ScreenWrapper
            testID="AddTagPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.tag')}
                onBackButtonPress={() => Navigation.goBack(backToRoute)}
            />
            <View style={[styles.flex1]}>
                <SearchSingleSelectionPicker
                    backToRoute={backToRoute}
                    initiallySelectedItem={selectedTagItem}
                    items={tagItems}
                    onSaveSelection={onSave}
                    shouldAutoSave
                />
            </View>
        </ScreenWrapper>
    );
}

AddTagPage.displayName = 'AddTagPage';

export default AddTagPage;
