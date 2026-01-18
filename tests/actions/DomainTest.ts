import Onyx from 'react-native-onyx';
import {createDomain, resetCreateDomainForm} from '@libs/actions/Domain';
import {WRITE_COMMANDS} from '@libs/API/types';
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

    describe('createDomain', () => {
        const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
        createDomain('test.com');

        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.CREATE_DOMAIN,
            {domainName: 'test.com'},
            {
                successData: [expect.objectContaining({value: {hasCreationSucceeded: true, isLoading: null}})],
                optimisticData: [expect.objectContaining({value: {hasCreationSucceeded: null, isLoading: true}})],
                failureData: [expect.objectContaining({value: {isLoading: null}})],
            },
        );

        apiWriteSpy.mockRestore();
    });

    describe('resetCreateDomainForm', () => {
        it('clears form onyx data', async () => {
            const timestamp = 123;

            await Onyx.set(ONYXKEYS.FORMS.CREATE_DOMAIN_FORM, {
                hasCreationSucceeded: true,
                errors: {[timestamp]: 'error'},
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
