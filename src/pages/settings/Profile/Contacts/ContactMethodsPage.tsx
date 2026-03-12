import React from 'react';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import ContactMethodsPageBase from './ContactMethodsPageBase';

type ContactMethodsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.CONTACT_METHODS>;

function ContactMethodsPage({route}: ContactMethodsPageProps) {
    return <ContactMethodsPageBase navigateBackTo={route?.params?.backTo} />;
}

export default ContactMethodsPage;
