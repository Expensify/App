import type {SectionListData} from 'react-native';

/**
 * Returns a list of sections with indexOffset
 */
export default function getSectionsWithIndexOffset<ItemT, SectionT>(sections: Array<SectionListData<ItemT, SectionT>>): Array<SectionListData<ItemT, SectionT & {indexOffset?: number}>> {
    return sections.map((section, index) => {
        const indexOffset = [...sections].splice(0, index).reduce((acc, curr) => acc + (curr.data?.length ?? 0), 0);
        return {...section, indexOffset};
    });
}
