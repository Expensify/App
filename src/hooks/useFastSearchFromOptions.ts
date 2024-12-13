import {useMemo} from 'react';
import FastSearch from '@libs/FastSearch';
import * as OptionsListUtils from '@libs/OptionsListUtils';

type AllOrSelectiveOptions = OptionsListUtils.ReportAndPersonalDetailOptions | OptionsListUtils.Options;

type Options = {
    includeUserToInvite: boolean;
};

// You can either use this to search within report and personal details options
function useFastSearchFromOptions(
    options: OptionsListUtils.ReportAndPersonalDetailOptions,
    config: {includeUserToInvite: false},
): (searchInput: string) => OptionsListUtils.ReportAndPersonalDetailOptions;
// Or you can use this to include the user invite option. This will require passing all options
function useFastSearchFromOptions(options: OptionsListUtils.Options, config: {includeUserToInvite: true}): (searchInput: string) => OptionsListUtils.Options;

/**
 * Hook for making options from OptionsListUtils searchable with FastSearch.
 *
 * @example
 * ```
 * const options = OptionsListUtils.getSearchOptions(...);
 * const filterOptions = useFastSearchFromOptions(options);
 */
function useFastSearchFromOptions(
    options: OptionsListUtils.ReportAndPersonalDetailOptions | OptionsListUtils.Options,
    {includeUserToInvite}: Options = {includeUserToInvite: false},
): (searchInput: string) => AllOrSelectiveOptions {
    const findInSearchTree = useMemo(() => {
        const fastSearch = FastSearch.createFastSearch([
            {
                data: options.personalDetails,
                toSearchableString: (option) => {
                    const displayName = option.participantsList?.[0]?.displayName ?? '';
                    return [option.login ?? '', option.login !== displayName ? displayName : ''].join();
                },
            },
            {
                data: options.recentReports,
                toSearchableString: (option) => {
                    const searchStringForTree = [option.text ?? '', option.login ?? ''];

                    if (option.isThread) {
                        if (option.alternateText) {
                            searchStringForTree.push(option.alternateText);
                        }
                    } else if (!!option.isChatRoom || !!option.isPolicyExpenseChat) {
                        if (option.subtitle) {
                            searchStringForTree.push(option.subtitle);
                        }
                    }

                    return searchStringForTree.join();
                },
            },
        ]);
        function search(searchInput: string): AllOrSelectiveOptions {
            const [personalDetails, recentReports] = fastSearch.search(searchInput);

            if (includeUserToInvite && 'currentUserOption' in options) {
                const userToInvite = OptionsListUtils.filterUserToInvite(options, searchInput);
                return {
                    personalDetails,
                    recentReports,
                    userToInvite,
                    currentUserOption: options.currentUserOption,
                };
            }

            return {
                personalDetails,
                recentReports,
            };
        }

        return search;
    }, [includeUserToInvite, options]);

    return findInSearchTree;
}

export default useFastSearchFromOptions;
