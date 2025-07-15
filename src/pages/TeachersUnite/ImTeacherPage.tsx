import React from 'react';
import {useSession} from '@components/OnyxProvider';
import * as LoginUtils from '@libs/LoginUtils';
import ImTeacherUpdateEmailPage from './ImTeacherUpdateEmailPage';
import IntroSchoolPrincipalPage from './IntroSchoolPrincipalPage';

function ImTeacherPage() {
    const session = useSession();
    const isLoggedInEmailPublicDomain = LoginUtils.isEmailPublicDomain(session?.email ?? '');
    return isLoggedInEmailPublicDomain ? <ImTeacherUpdateEmailPage /> : <IntroSchoolPrincipalPage />;
}

ImTeacherPage.displayName = 'ImTeacherPage';

export default ImTeacherPage;
