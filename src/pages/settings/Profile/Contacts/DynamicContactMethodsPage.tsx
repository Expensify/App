import React from 'react';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import ContactMethodsPageBase from './ContactMethodsPageBase';

function DynamicContactMethodsPage() {
    const navigateBackTo = useDynamicBackPath(DYNAMIC_ROUTES.SETTINGS_CONTACT_METHODS.path);

    return <ContactMethodsPageBase navigateBackTo={navigateBackTo} />;
}

export default DynamicContactMethodsPage;
