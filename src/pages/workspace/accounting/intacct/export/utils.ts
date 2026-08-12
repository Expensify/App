import type {SageIntacctDataElementWithValue} from '@src/types/onyx/Policy';

function getDefaultVendorName(defaultVendor?: string, vendors?: SageIntacctDataElementWithValue[]): string | undefined {
    return (vendors ?? []).find((vendor) => vendor.id === defaultVendor)?.value ?? defaultVendor;
}

/* oxlint-disable-next-line hosted/prefer-default-export */ // eslint-disable-next-line import/prefer-default-export
export {getDefaultVendorName};
