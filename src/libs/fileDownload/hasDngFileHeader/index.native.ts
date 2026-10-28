/** Native gallery picks are sniffed for a DNG header before validation, in processPickedAssets. */
function hasDngFileHeader(): Promise<boolean> {
    return Promise.resolve(false);
}

export default hasDngFileHeader;
