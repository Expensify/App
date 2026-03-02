import {format} from 'date-fns';
import {unescape} from 'lodash';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import lodashIntersection from 'lodash/intersection';
        return '';
    }

    return unescape(reportAction.message?.[0]?.text ?? reportAction.originalMessage?.html ?? '');
}

/**