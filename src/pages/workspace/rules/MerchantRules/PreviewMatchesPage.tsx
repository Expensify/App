import {useEffect} from 'react';
import {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {MerchantRuleForm} from '@src/types/form';

type PreviewMatchesPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_PREVIEW_MATCHES>;

const merchantRuleFormSelector = (form: OnyxEntry<MerchantRuleForm>) => form?.merchantToMatch ?? '';

function PreviewMatchesPage({route}: PreviewMatchesPageProps) {
    const policyID = route.params.policyID;
    const [merchant = ''] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM, {canBeMissing: true, selector: merchantRuleFormSelector});

    return <></>;
}

PreviewMatchesPage.displayName = 'PreviewMatchesPage';

export default PreviewMatchesPage;
