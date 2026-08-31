import type {LinkSuccessMetadata} from 'react-native-plaid-link-sdk';
import type {PlaidLinkOnSuccessMetadata} from 'react-plaid-link';

type PlaidInstitution = PlaidLinkOnSuccessMetadata['institution'] | LinkSuccessMetadata['institution'];

function getPlaidInstitutionID(institution: PlaidInstitution): string | undefined {
    if (!institution) {
        return undefined;
    }
    if ('institution_id' in institution) {
        return institution.institution_id;
    }
    return institution.id;
}

export default getPlaidInstitutionID;
