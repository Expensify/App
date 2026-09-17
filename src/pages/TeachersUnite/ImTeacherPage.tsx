import {useSession} from '@components/OnyxListItemProvider';

import {isEmailPublicDomain} from '@libs/LoginUtils';

import React from 'react';

import ImTeacherUpdateEmailPage from './ImTeacherUpdateEmailPage';
import IntroSchoolPrincipalPage from './IntroSchoolPrincipalPage';

function ImTeacherPage() {
    const session = useSession();
    const isLoggedInEmailPublicDomain = isEmailPublicDomain(session?.email ?? '');
    return isLoggedInEmailPublicDomain ? <ImTeacherUpdateEmailPage /> : <IntroSchoolPrincipalPage />;
}

export default ImTeacherPage;
