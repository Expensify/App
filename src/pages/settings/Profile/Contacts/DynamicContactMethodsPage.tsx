import React from 'react';
import {useRoute} from '@react-navigation/native';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import ContactMethodsPage from './ContactMethodsPage';

function DynamicContactMethodsPage() {
    const route = useRoute();
    const navigateBackTo = useDynamicBackPath(DYNAMIC_ROUTES.SETTINGS_CONTACT_METHODS.path);

    return (
        <ContactMethodsPage
            route={{
                ...route,
                params: {
                    ...route.params,
                    backTo: navigateBackTo,
                },
            } as React.ComponentProps<typeof ContactMethodsPage>['route']}
        />
    );
}

export default DynamicContactMethodsPage;
