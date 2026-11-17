/** Formats a dependent tag's stored ancestor path without exposing separator escapes. */
import {Str} from 'expensify-common';

import {getTagArrayFromName} from './TransactionUtils';

function formatTagParentPath(parentTagPath: string | undefined): string {
    return parentTagPath
        ? getTagArrayFromName(parentTagPath)
              .map((tag) => Str.htmlDecode(tag.replaceAll(/\\([\\:])/g, '$1')))
              .join(' › ')
        : '';
}

export default formatTagParentPath;
