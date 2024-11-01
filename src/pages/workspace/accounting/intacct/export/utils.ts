import type {SageIntacctDataElementWithValue} from '@src/types/onyx/Policy';

function getDefaultVendorName(defaultVendor?: string, vendors?: SageIntacctDataElementWithValue[]): string | undefined {
    return (vendors ?? []).find((vendor) => vendor.id === defaultVendor)?.value ?? defaultVendor;
}

// eslint-disable-next-line import/prefer-default-export
export {getDefaultVendorName};
