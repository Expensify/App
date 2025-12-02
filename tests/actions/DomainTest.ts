import Onyx from 'react-native-onyx';
import {resetCreateDomainForm} from '@libs/actions/Domain';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

OnyxUpdateManager();
describe('actions/Domain', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        IntlStore.load(CONST.LOCALES.EN);
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('resetCreateDomainForm', () => {
        it('clears form onyx data', async () => {
            await Onyx.set(ONYXKEYS.FORMS.CREATE_DOMAIN_FORM, {
                hasCreationSucceeded: true,
                errors: {123: 'error'},
            });

            resetCreateDomainForm();

            await TestHelper.getOnyxData({
                key: ONYXKEYS.FORMS.CREATE_DOMAIN_FORM,
                waitForCollectionCallback: false,
                callback: (form) => {
                    expect(form?.hasCreationSucceeded).toBeFalsy();
                    expect(form?.errors).toBeFalsy();
                },
            });
        });
    });
});
