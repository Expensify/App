/* global _, moment, VictoriaLogsUtils */
/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */

(function ($) {
    var ES_PROXY_URL = '/_devportal/tools/elasticSearchProxy.php';
    var VL_PROXY_URL = VictoriaLogsUtils.PROXY_URL;

    var $panels = $('#ls-panels');
    var $size = $('#ls-size');
    var $sortOrder = $('#ls-sort');
    var $selectColumnsModal = $('#ls-columns');
    var $showShortcuts = $('#ls-shortcuts');
    var $showJSONModal = $('#ls-json');
    var $selectQuietLines = $('#ls-quiet-lines');
    var $query = $('#ls-query');
    var $requestID = $('#ls-requestID');
    var $email = $('#ls-email');
    var $dateRangeStart = $('#ls-dateRangeStart');
    var $dateRangeEnd = $('#ls-dateRangeEnd');
    var searchHistory = [];
    var timestampFormat = localStorage.getItem('logSearch_tsfmt') || 'YYYY-MM-DD HH:mm:ss SSS';
    var showTimezoneLocal = localStorage.getItem('logSearch_timezone') === 'local';
    var showColumns = (localStorage.getItem('logSearch_columns') || 'request_id_html,host,timestamp_html,email_html,blob').split(',');
    var allColumns = 'request_id_html,timestamp_html,email_html,timestamp,@version,_id,_index,_score,_type,email,end_point,file,host,level,message,program,request_id,shortTimestamp,sort,source,tag,tags,thread,tsa,tsb,class,policy_id,blob,process,command'.split(',');
    var allBlacklist = [
        'Timing:',
        'DB_Auditing',
        'APC fetch host configs',
        'Bedrock\\Client - Request finished', // eslint-disable-line no-useless-escape
        'Checking authToken validity',
        'Returning authToken for',
        'Possible hosts',
        'Opening new socket',
        'Reusing socket',
        'AuthRequest #',
        'Queued new',
        'Dequeued command',
        'peeked command',
        'timing info',
        'Waiting for .* to complete',
        'Auth - Call .* return \\d*', // eslint-disable-line no-useless-escape
        'Responding .* to',
        'Transaction rollback with',
        '{:Auth} Processing \'.*',
        'Plugin \'.*\' peeked command \'.*\'',
        'Command \'Get\' requested the following items: .*',
        'Command \'.*\' is not peekable, queuing for processing',
        'Escalating .* to leader .*',
        'Plugin \'.*\' processed command \'.*\'',
        'Processed \'.*\' for \'.*\'',
        'skipping checkpoint with',
        'SQuery \'COMMIT\' took',
        'COMMIT operation wrote',
        'Sending non-parallel command CreateTransaction to sync thread',
        'Sync thread dequeued command',
        'Transaction commit with',
        'Successfully committed ',
        'Sending an .* for',
        'Sending ESCALATE_RESPONSE to ',
        '_syncThreadCommitMutex (shared) acquired in worker in ',
        'Not responding to \'forget\' command',
        'Command \\(.*\\) depends on future commit', // eslint-disable-line no-useless-escape
        'warning: header Subject:',
    ];
    var showBlacklist = localStorage.getItem('logSearch_quietLines') ? localStorage.getItem('logSearch_quietLines').split(',') : allBlacklist;
    window.searchHistory = [];
    window.onhashchange = function () {
        $(this).scrollTop(0);
    };

    /**
     * @param {String} logLine
     * @return {Number}
     */
    function getCommandTotalTime(logLine) {
        var tempElement = document.createElement('div');
        tempElement.innerHTML = logLine;
        var decoded = tempElement.textContent || tempElement.innerText || '';

        // Handle [bench] logs
        if (decoded.startsWith('[bench]')) {
            // Find the index of the first occurrence of '{"total":'
            var startIndex = decoded.indexOf('{"total":') + '{"total":'.length;
            if (startIndex === -1) {
                // If '{"total":' is not found, return 0
                return 0;
            }

            // Extract the number immediately after '{"total":'
            var remainingLog = decoded.substring(startIndex);

            // Extract the number until the first non-digit character (handle decimal too)
            var matches = remainingLog.match(/^\d+(\.\d+)?/);
            if (!matches) {
                return 0;
            }

            var total = parseInt(matches[0], 10);
            return total;
        }

        // Handle 'Profile ~~ ' logs
        var profileIndex = decoded.indexOf('Profile ~~ ');
        if (profileIndex !== -1) {
            // Extract JSON part after 'Profile ~~ '
            var jsonStart = profileIndex + 'Profile ~~ '.length;
            var jsonString = decoded.substring(jsonStart);

            try {
                var profileData = JSON.parse(jsonString);
                if (profileData && profileData.total) {
                    return parseInt(profileData.total, 10);
                }
            } catch (e) {
                // If JSON parsing fails, just ignore this log line
                return 0;
            }
        }

        return 0;
    }

    /**
     * Converts a querystring in the format 'foo=bar&lorem=ipsum' to a JS hash
     * @see http://stackoverflow.com/questions/901115/how-can-i-get-query-string-valuls-in-javascript
     * @param {String} query A www-url-encoded string
     * @return {Object}
     */
    function parseQueryString(query) {
        var result = {};

        // Regex for replacing addition symbol with a space
        var pl = /\+/g;
        var search = /([^&=]+)=?([^&]*)/g;
        var match;

        var decode = function (s) {
            return window.decodeURIComponent(s.replace(pl, ' '));
        };

        match = search.exec(query);
        while (match) {
            result[decode(match[1])] = decode(match[2]);
            match = search.exec(query);
        }

        return result;
    }

    /**
     * Generic ajax error handler.
     * As we are developers, no need to be fancy.
     * @param {jqXHR} response
     * @param {String} status
     * @param {String} text
     */
    function genericFail(response, status, text) {
        console.log(this, arguments);

        if (status === 'error' && text === 'Forbidden') {
            alert('Session expired or non-Expensify account. Please log back in in another tab and try again. More details in the JS console.');
            return;
        }

        if (status === 'success' && text !== undefined) {
            // Try to parse the text response as JSON
            var jsonResponse = (function (responseString) {
                try {
                    return JSON.parse(responseString);
                } catch (error) {
                    return false;
                }
            })(response);

            if (jsonResponse.status === 'error') {
                // We had a JSON response
                alert(jsonResponse.message + ' More details in the JS console.');
                return;
            }
        }

        alert('Oh noes! Something happened. More details in the JS console.');
    }

    /**
     * Get display name for a column
     * @param {String} col Column name
     * @return {String}
     */
    function getColumnDisplayName(col) {
        var columnNames = {
            'request_id_html': 'Request ID',
            'timestamp_html': 'Timestamp',
            'email_html': 'Email',
            'timestamp': 'Timestamp (Raw)',
            '@version': 'Version',
            '_id': 'ID',
            '_index': 'Index',
            '_score': 'Score',
            '_type': 'Type',
            'email': 'Email (Raw)',
            'end_point': 'Endpoint',
            'file': 'File',
            'host': 'Host',
            'level': 'Level',
            'message': 'Message',
            'program': 'Program',
            'request_id': 'Request ID (Raw)',
            'shortTimestamp': 'Short Timestamp',
            'sort': 'Sort',
            'source': 'Source',
            'tag': 'Tag',
            'tags': 'Tags',
            'thread': 'Thread',
            'tsa': 'TSA',
            'tsb': 'TSB',
            'class': 'Class',
            'policy_id': 'Policy ID',
            'blob': 'Message',
            'process': 'Process',
            'command': 'Command'
        };
        return columnNames[col] || col;
    }

    /**
     * Redraws the search result listing
     * @param {Object} searchInfo Search's options (userQuery,panelID,indexName,resultSize,resultOffset)
     * @param {Object} response The ES JSON response
     */
    function redrawResultsPanel(searchInfo, response) {
        var $panel = $('#' + searchInfo.panelID);
        var interpolateRegex = /{([^}]+)}/g;
        var interpolate = function (str, item) {
            return str.replace(interpolateRegex, function (match, name) {
                return _.escape(item[name]);
            });
        };
        var elasticSearchDocUrl;
        var html;
        var titleTemplate;
        var titleHtml;

        // #query=request:id("123") AND @timestamp:[xxx TO yyy]&index=logstash_123
        var requestIDTemplate = '<a href="#query=request_id:(&quot;{request_id}&quot;)+AND+timestamp:[{tsb}+TO+{tsa}]&index={_index}">{request_id}</a>';

        // #query=email:("foo@bar.com") AND @timestamp:[xxx TO yyy]&index=logstash_123
        var betterSupportalLink = '/_support/?supportEmail={encodedEmail}&comment=Logging%20in%20from%20logSearch&location=_support/';
        var emailTemplate = '<a href="#query=email:(&quot;{email}&quot;)+AND+timestamp:[{tsb}+TO+{tsa}]&index={_index}">{email}</a><a href="' + betterSupportalLink + '" target="_blank"><img src="firstaid.gif" class="betterSupportal_icon"></a>';
        var timestampTemplate = '<abbr title="{timestamp}">{shortTimestamp}</abbr>';

        // Handles 400 response Errors, Links to Elastic Search Syntax Documentation
        if (response.status !== 'error' && response.hits === undefined) {
            elasticSearchDocUrl = 'https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax';
            $panel.find('.ls-panel-title').html("Received 400 Error. Make sure to escape special characters ({, :, ^, etc). and make replacements in your query where necessary. <a href='" + elasticSearchDocUrl + "'>Link to syntax documentation.</a>");
            return;
        }

        if (response.status === 'error') {
            $panel.find('.ls-panel-title').html('Error: ' + response.message);
            return;
        }

        // Order logs by timestamp
        response.hits.hits.sort(function (a, b) {
            if (searchInfo.sortOrder === 'asc') {
                return a._source.timestamp < b._source.timestamp ? -1 : 1;
            }
            return a._source.timestamp > b._source.timestamp ? -1 : 1;
        });
        var previousCtx;
        html = _.map(response.hits.hits, function (hit) {
            var isBlacklisted = false;
            var source = hit._source;

            // It must be .utc(false) otherwise moment.js will convert to your local TZ when .toJSON()'ing,
            // thus will generate invalid @timestamp ranges.
            var ts = moment(source.timestamp).utc(false);
            var ctx;
            var columns;

            source.tsb = moment(ts).add(-1, 'hours').toJSON();
            source.tsa = moment(ts).add(1, 'hours').toJSON();

            ctx = _.extend({}, hit, hit._source, {encodedEmail: encodeURIComponent(hit._source.email)});
            isBlacklisted = _.some(showBlacklist, function (pattern) {
                var regex = new RegExp(pattern, 'g');
                return regex.test(ctx.blob);
            });

            // Calculate the difference between the previous and current timestamp
            if (previousCtx) {
                var currentTimestamp = new Date(ctx.timestamp).getTime();
                var previousTimestamp = new Date(previousCtx.timestamp).getTime();
                ctx.timeDifferenceMs = currentTimestamp - previousTimestamp;
            } else {
                ctx.timeDifferenceMs = 0;
            }

            // Format timestamp based on timezone preference
            var displayTimestamp = showTimezoneLocal ? moment(source.timestamp).local() : moment(source.timestamp).utc(false);
            ctx.shortTimestamp = displayTimestamp.format(timestampFormat) + (showTimezoneLocal ? ' [LOCAL]' : '');
            ctx.request_id_html = interpolate(requestIDTemplate, ctx);
            ctx.timestamp_html = interpolate(timestampTemplate, ctx);
            if (ctx.email === undefined) {
                ctx.email_html = '';
            } else {
                ctx.email_html = interpolate(emailTemplate, ctx);
            }
            columns = showColumns.map(function (col) {
                if (col === 'blob') {
                    var message = ctx[col] || JSON.stringify(ctx);
                    if (message.indexOf('Starting a request') > -1) {
                        message = message.replace(/(^.*Starting a request ~~ command: &#039;)(\w+)(&#039;.*$)/, '$1<strong>$2</strong>$3');
                    }
                    var classList = ['ls-blob'];
                    var benchTotal = getCommandTotalTime(message);
                    if (benchTotal > 500 && benchTotal < 1000) {
                        classList.push('slow-command-500');
                    } else if (benchTotal > 1000 && benchTotal < 5000) {
                        classList.push('slow-command-1000');
                    } else if (benchTotal > 5000 && benchTotal < 10000) {
                        classList.push('slow-command-5000');
                    } else if (benchTotal > 10000 && benchTotal < 20000) {
                        classList.push('slow-command-10000');
                    } else if (benchTotal > 20000) {
                        classList.push('slow-command-20000');
                    }

                    return '<td class="' + classList.join(' ') + '"><a href="#" data-toggle="modal" data-target="#ls-json .modal" class="toggle-json"><i class="expensicons expensicons-search expensicons-sm"></i></a>' + message + '</td>';
                }

                // Add a heatmap class to the timestamp cell based on it's time
                if (col === 'timestamp_html') {
                    var heatMapClass = 'performance-0';
                    if (ctx.timeDifferenceMs > 0 && ctx.timeDifferenceMs < 100) {
                        heatMapClass = 'performance-100';
                    } else if (ctx.timeDifferenceMs >= 100 && ctx.timeDifferenceMs < 300) {
                        heatMapClass = 'performance-300';
                    } else if (ctx.timeDifferenceMs >= 300 && ctx.timeDifferenceMs < 500) {
                        heatMapClass = 'performance-500';
                    } else if (ctx.timeDifferenceMs >= 500 && ctx.timeDifferenceMs < 1000) {
                        heatMapClass = 'performance-1000';
                    } else if (ctx.timeDifferenceMs >= 1000) {
                        heatMapClass = 'performance-feelsbadman';
                    }
                    return '<td class="' + heatMapClass + '">' + ctx[col] + '</td>';
                }
                return '<td>' + ctx[col] + '</td>';
            }).join('');
            previousCtx = ctx;
            return '<tr class="level-' + hit._source.level + (isBlacklisted ? ' ls-quiet' : '') + (/Malformed REQUEST/.test(columns) ? ' level-warn' : '') + '">' + columns + '</tr>';
        });

        // Create table header
        var headerHtml = '<tr>' + showColumns.map(function (col) {
            return '<th>' + getColumnDisplayName(col) + '</th>';
        }).join('') + '</tr>';

        titleTemplate = '{hitCount}/{hitTotalText} @{duration}s - {sortOrder} order - <a href="{href}">{query}</a>';
        var hitCount = response.hits.hits.length;
        var hitTotal = response.hits.total.value || 0;
        var hitTotalText = (response.hits.total.relation === 'gte' ? hitTotal + '+' : hitTotal) + ' hits';
        titleHtml = interpolate(titleTemplate, {
            hitCount: hitCount,
            hitTotalText: hitTotalText,
            duration: (response.took / 1000).toFixed(4),
            sortOrder: searchInfo.sortOrder === 'asc' ? 'ASC' : 'DESC',
            href: '#' + $.param({query: searchInfo.userQuery, index: searchInfo.indexName}),
            query: searchInfo.userQuery,
        });
        $panel.data('ls-result', response);
        $panel.data('ls-searchInfo', searchInfo);
        $panel.find('.ls-panel-title').html(titleHtml);
        if (hitCount < hitTotal) {
            var newSize = 20000;
            var hitDifference = hitTotal - hitCount;
            var footerTemplate = '{hitDifference} hidden results. ';

            // If they aren't already doing max search, find the closest size to the total
            if (hitCount < 20000) {
                footerTemplate += '<a href="{href}">Click here</a> for more.';
                var sizes = [100, 500, 1000, 2000, 10000, 20000];
                for (var i = 0; i < sizes.length; i++) {
                    if (sizes[i] > hitTotal) {
                        newSize = sizes[i];
                        break;
                    }
                }
            }
            var footer = $panel.find('.ls-panel-footer');
            footer.html(interpolate(footerTemplate, {
                hitDifference: hitDifference,
                href: '#' + $.param({query: searchInfo.userQuery, index: searchInfo.indexName, size: newSize}),
            }));

            // Only apply if we're adding the text otherwise it messes with the formatting
            footer.addClass('bg-warning');
        }
        
        // Update table structure with header
        var $table = $panel.find('.ls-content table');
        $table.find('thead').remove(); // Remove existing header if any
        $table.prepend('<thead class="ls-table-header">' + headerHtml + '</thead>');
        $table.find('tbody').html(html.length > 0 ? html.join() : '<tr><td colspan="' + showColumns.length + '">No results</td></tr>');
        $panel.find('.ls-content table tr')
            .on('click', function (evt) {
                if (!evt.altKey) {
                    return;
                }
                $(evt.target.parentElement).toggleClass('highlighted');
            });
    }

    /**
     * Redraw all search panels. Usually called when a display option
     * is changed (date format, columns etc)
     */
    function redrawPanels() {
        $('.ls-panel').each(function (_, panel) {
            var data = $(panel).data();
            redrawResultsPanel(data.lsSearchInfo, data.lsResult);
        });
    }

    /**
     * Adds the response from XHR to a global `searchHistory` array.
     * @param {any} response
     */
    function addToSearchHistory(response) {
        searchHistory.push(response);
    }

    /**
     * Searches logs based on the form fields.
     * @param {jQuery.Event} e
     */
    function searchLogs(e) {
        var query;
        var params;
        var dateStart;
        var dateEnd;
        var dateRangeFull = '';

        e.preventDefault();

        // Construct a datetime query appropriate format, [YYYY-MM-DD'T'HH:MM:SS TO YYYY-MM-DD'T'HH:MM:SS]
        // If $dateRangeEnd is not set, search the full day
        if ($dateRangeStart.val() || $dateRangeEnd.val()) {
            dateStart = $dateRangeStart.val() ? $dateRangeStart.val().substr(0, 10) + 'T' + $dateRangeStart.val().substr(11) : '*';
            dateEnd = $dateRangeEnd.val() ? $dateRangeEnd.val().substr(0, 10) + 'T' + $dateRangeEnd.val().substr(11) : $dateRangeStart.val().substr(0, 10) + 'T23:59';
            dateRangeFull = 'timestamp:[' + dateStart + ' TO ' + dateEnd + ']';
        }

        // We just change the window's location hash and let the 'hashchange' event
        // trigger our auto-search feature. This way we have a consistent interface.
        query = _.without([
            $query.val(),
            $requestID.val() ? 'request_id:"' + $requestID.val() + '"' : '',
            $email.val() ? 'email:"' + $email.val() + '"' : '',
            dateRangeFull,
        ], '');
        params = {
            sort: $sortOrder.val(),
            size: $size.val(),
            query: query.join(' AND '),
            engine: $('#ls-search-engine').val(),
        };

        // Stop any query arrays with only 1 item. Since a query always sends with a timestamp,
        // that means that most likely no query, email, or requestID was sent
        if (query.length === 1) {
            alert('Please make sure you\'re sending at least one of the following: query, email, or requestID');
            return;
        }
        window.location.hash = $.param(params);
    }

    /**
     * Closes a panel.
     * @param {jQuery.Event} e
     */
    function closePanel(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).closest('.ls-panel').remove();
    }

    /**
     * Toggles a panel.
     * @param {jQuery.Event} e
     */
    function togglePanel(e) {
        var $panel = $(this).closest('.ls-panel');
        e.preventDefault();
        $panel.find('.ls-content').toggleClass('hidden');
    }

    /**
     * Toggles scrolling on a panel.
     * @param {jQuery.Event} e
     */
    function togglePanelScroll(e) {
        var $panel = $(this).closest('.ls-panel');
        e.preventDefault();
        $panel.find('.ls-content').toggleClass('scrollable');
    }

    /**
     * Toggles wrapping text in a panel
     * @param {jQuery.Event} e
     */
    function togglePannelWrap(e) {
        var $panel = $(this).closest('.ls-panel');
        e.preventDefault();
        $panel.find('.ls-blob').toggleClass('text-wrap');
    }

    /**
     * This will stores the current panel's result in a global variable named `logs`.
     * @param {jQuery.Event} e
     */
    function inspectPanel(e) {
        var response = $(this).closest('.ls-panel').data().lsResult;
        e.preventDefault();
        window.lastSearch = response;
        window.logs = response.hits.hits.map(function (hit) {
            return _.extend({}, hit, hit._source);
        });
    }

    /**
     * Opens a modal where the user can select which columns they wish to see.
     * Every time the modal is opened, we reconstruct the list.
     * @param {jQuery.Event} e
     */
    function populateColumnsModal() {
        var vis = _.invert(showColumns);
        var html = '<div class="ls-columns-help">Select and reorder columns by dragging:</div>';
        html += '<div class="ls-columns-selected">';
        html += '<h4>Selected Columns (drag to reorder):</h4>';
        html += '<ul class="ls-sortable-columns">';
        
        // Add selected columns in order
        showColumns.forEach(function (col) {
            html += '<li data-column="' + col + '"><span class="ls-drag-handle">⋮⋮</span>' + getColumnDisplayName(col) + '<button class="ls-remove-column" data-column="' + col + '">×</button></li>';
        });
        html += '</ul></div>';
        
        html += '<div class="ls-columns-available">';
        html += '<h4>Available Columns:</h4>';
        html += '<ul class="ls-available-columns">';
        
        // Add unselected columns
        allColumns.forEach(function (col) {
            if (showColumns.indexOf(col) === -1) {
                html += '<li data-column="' + col + '">' + getColumnDisplayName(col) + '<button class="ls-add-column" data-column="' + col + '">+</button></li>';
            }
        });
        html += '</ul></div>';
        
        $selectColumnsModal.find('.modal-body').html(html);
        
        // Initialize sortable functionality
        initializeColumnSorting();
    }

    /**
     * Initialize drag and drop functionality for column reordering
     */
    function initializeColumnSorting() {
        var $sortableList = $('.ls-sortable-columns');
        var $availableList = $('.ls-available-columns');
        
        // Make the selected columns sortable
        $sortableList.sortable({
            handle: '.ls-drag-handle',
            axis: 'y',
            containment: 'parent',
            update: function () {
                // Update showColumns order when dragging
                var newOrder = [];
                $sortableList.find('li').each(function () {
                    newOrder.push($(this).data('column'));
                });
                showColumns = newOrder;
                localStorage.setItem('logSearch_columns', showColumns.join(','));
                redrawPanels();
            }
        });
        
        // Handle removing columns
        $(document).off('click', '.ls-remove-column').on('click', '.ls-remove-column', function (e) {
            e.preventDefault();
            var columnToRemove = $(this).data('column');
            var $listItem = $(this).closest('li');
            
            // Remove from showColumns
            showColumns = showColumns.filter(function (col) {
                return col !== columnToRemove;
            });
            
            // Move to available columns
            $availableList.append('<li data-column="' + columnToRemove + '">' + getColumnDisplayName(columnToRemove) + '<button class="ls-add-column" data-column="' + columnToRemove + '">+</button></li>');
            $listItem.remove();
            
            localStorage.setItem('logSearch_columns', showColumns.join(','));
            redrawPanels();
        });
        
        // Handle adding columns
        $(document).off('click', '.ls-add-column').on('click', '.ls-add-column', function (e) {
            e.preventDefault();
            var columnToAdd = $(this).data('column');
            var $listItem = $(this).closest('li');
            
            // Add to showColumns
            showColumns.push(columnToAdd);
            
            // Move to selected columns
            $sortableList.append('<li data-column="' + columnToAdd + '"><span class="ls-drag-handle">⋮⋮</span>' + getColumnDisplayName(columnToAdd) + '<button class="ls-remove-column" data-column="' + columnToAdd + '">×</button></li>');
            $listItem.remove();
            
            localStorage.setItem('logSearch_columns', showColumns.join(','));
            redrawPanels();
        });
    }

    /**
     * Opens a modal where the user can select which lines to include in Quiet and Silent mode.
     */
    function populateQuietLinesModal() {
        $selectQuietLines.find('.modal-body').html(
            allBlacklist.map(function (line) {
                return '<label><input type="checkbox" value="' + line + '"' + (_.contains(showBlacklist, line) ? 'checked' : '') + '> ' + line + '</label>';
            }).join('')
        );
    }

    function refreshQuietLines() {
        showBlacklist = _.pluck($selectQuietLines.find(':checked'), 'value');
        localStorage.setItem('logSearch_quietLines', showBlacklist.join(','));
        redrawPanels();
    }

    /**
     * Redraws all visible panels with the selected columns.
     * Also stores the selection in a `localStorage`.
     * @param {Event} e
     */
    function refreshColumns() {
        showColumns = _.pluck($selectColumnsModal.find(':checked'), 'value');
        localStorage.setItem('logSearch_columns', showColumns.join(','));
        redrawPanels();
    }

    /**
     * Populates the search inputs with a query based on the selected
     * predefined "Quick Query"
     */
    function prefillForm() {
        var selection = $(this).val();

        // Clear out search input fields
        $query.val('');
        $email.val('');
        $requestID.val('');

        // Autofill search inputs based on selection
        // Be sure to detect non-replacements in /_devportal/tools/elasticSearchProxy.php
        // https://github.com/Expensify/Expensify/issues/73964
        switch (selection) {
            case 'scraper_login_logs':
                $query.val('email:"email/+@domain.com" AND type:"scraper" AND command:"getAccountList"');
                break;
            case 'scraper_update_logs':
                $query.val('email:"email/+@domain.com" AND type:"scraper" AND command:"getAccountHistory"');
                break;
            case 'inbox_task_logs':
                $query.val('blob:"Completing inbox task" AND blob:"task: \'optional_inbox_task_name\'" AND blob:"policyID: \'optional_policyID\'"');
                break;
            case 'policy_logs':
                $query.val('policy_id:"replace_with_policyID" AND class:"policyaudit"');
                showColumns = 'request_id_html,host,timestamp_html,email_html,class,policy_id,blob'.split(',');
                break;
            case 'autoexport_logs':
                $query.val('report_id:"replace_with_reportID" AND class:"autoexport"');
                showColumns = 'request_id_html,host,timestamp_html,email_html,class,policy_id,blob'.split(',');
                break;
            case 'ach_reimbursements':
                $query.val('blob:"Processed reimbursement" AND blob:"(replace_with_amount)" AND type:"auth"');
                break;
            case 'billing_support':
                $query.val('blob:"CreateFund" OR blob:"UpdateBillingSubscription"');
                break;
            case 'saml_callback':
                $query.val('email:"email@domain.com" AND blob:"SAML callback"');
                break;
            case 'saml_error':
                $query.val('email:"email@domain.com" AND blob:"SAML error"');
                break;
            case 'sms_error':
                $query.val('email:"phoneNumber@expensify.sms" AND blob:"SMS failed"');
                break;
            case 'mailgun_email':
                $query.val('email:"email@domain.com" AND blob:"Handling mailgun email receipt"');
                break;
            case 'mailgun_subject':
                $query.val('blob:"Handling mailgun email receipt" AND blob:"Fwd: some subject here"');
                break;
            case 'mobile_logs':
                $query.val('blob:"[mobile]"');
                break;
            case 'push_notification':
                $query.val('email:"email@domain.com" AND blob:"Logging request details"');
                break;
            case 'delete_user_domain':
                $query.val('blob:"DomainAPI delete member" AND blob:"enter email address in question"');
                break;
            case 'create_receipt':
                $query.val('blob:"Created receipt" AND email:"email@domain.com" AND type:"auth"');
                break;
            case 'card_limit':
                $query.val('blob:"Checking if amount is over limits"');
                break;
            case 'card_declined_by_expensify':
                $query.val('blob:"Authorization denied Expensify" AND end_point:"/partners/marqeta/gateway.php"');
                break;
            case 'card_declined_by_marqeta':
                $query.val('blob:"Marqeta payload for webhook" AND blob:"DECLINED" AND end_point:"/partners/marqeta/webhook.php"');
                break;
            case 'continuous_rec_journals':
                $query.val('blob:"Generating Journal Entry for domain" AND blob:"DomainNameHere" AND type:integrations');
                break;
            case 'subscription_changes':
                $query.val('blob:"Changing billing subscription"');
                break;
            case 'card_limit_failed':
                $query.val('blob:"domainName: \'replace_with_domain\'" AND blob:"Failed to retrieve Plaid balance"');
                break;
            case 'plaid_':
                $query.val('blob:"Plaid"');
                $email.val('replace_with_email');
                break;
            case 'plaid_connection':
                $query.val('blob:"HANDOFF" AND blob:"replace_with_exact_institution_name"');
                break;
            case 'concierge_agent_logs':
                $query.val('blob:"Agent Concierge Activity" AND blob:"AgentEmail"');
                break;
            case 'concierge_agent_time_working_logs_polling':
                $query.val('blob:"Received agent working ping" AND blob:"replace_with_email"');
                break;
            case 'manifesto_tier_auto_escalations':
                $query.val('blob:"Chat contained word from Never List"');
                break;
            case 'beta_manager':
                $query.val('blob:"Updating beta subscription for" AND blob:"optionally_replace_with_beta_name"');
                break;
            case 'dew_manager':
                $query.val('blob:"Updating DEW on policy" AND blob:"optionally_replace_with_policyID"');
                break;
            case 'export_templates':
                $query.val('blob:"Updating export templates"');
                break;
            case 'update_billing_subscription':
                $query.val('blob:"Updating subscription for optionally_replace_with_email"');
                break;
            case 'clear_owed_amount':
                $query.val('blob:"Successfully cleared the amount owed by replace_optional_email"');
                break;
            case 'commercial_card_feed':
                $query.val('blob:"Commercial card feed updated" AND blob:"replace_optional_email"');
                break;
            case 'update_tax_exempt_status':
                $query.val('blob:"Updated tax exempt status for account"');
                break;
            case 'domain_settings':
                $query.val('blob:"Updated domain settings" AND blob:"replace_optional_domain_com"');
                break;
            case 'domain_add_admin':
                $query.val('blob:"added" AND blob:"as a domain admin for replace_domain_name_com domain"');
                break;
            case 'domain_remove_admin':
                $query.val('blob:"removed" AND blob:"as a domain admin for replace_domain_name_com domain"');
                break;
            case 'bench_totals':
                $query.val('blob: "Bench totals for command ReplaceWithCommand"');
                break;
            default:
                alert('Invalid option selected');
        }
    }

    /**
     * Updates date format
     * @param {Event} e
     */
    function updateDateFormat(e) {
        var fmt = window.prompt('Choose a timestamp format (moment.js). Example: YYYY-MM-DD HH:mm:ss.SSS. Default: DD HH:mm:ss', timestampFormat);
        e.preventDefault();
        if (_.isString(fmt)) {
            timestampFormat = fmt;
            localStorage.setItem('logSearch_tsfmt', fmt);
            redrawPanels();
        }
    }

    /**
     * Toggles between UTC and local timezone display
     * @param {Event} e
     */
    function toggleTimezone(e) {
        e.preventDefault();
        showTimezoneLocal = !showTimezoneLocal;
        localStorage.setItem('logSearch_timezone', showTimezoneLocal ? 'local' : 'utc');
        redrawPanels();

        // Update button text
        var $button = $(this);
        $button.text(showTimezoneLocal ? 'Show times in UTC' : 'Show times in local time');
        $button.attr('title', showTimezoneLocal ? 'Show times in UTC' : 'Show times in local time');
    }

    /**
     * Autofills the date range to span across inputted amount
     * @param {Integer} dateRange amount of days you want to search
     * @param {Event} e
     * @return {Function}
     */
    function onFillOnClick(dateRange) {
        // Grabbing the passed in dateRange, then returning the event handler to avoid multiple methods
        return function (e) {
            e.preventDefault();
            $dateRangeStart.val(moment().subtract(dateRange, 'days').format('YYYY-MM-DD') + ' 00:00');
            $dateRangeEnd.val(moment().add(1, 'days').format('YYYY-MM-DD') + ' 23:59');
            this.blur();
        };
    }

    /**
     * Resets the date search ranges to original
     * @param {Event} e
     */
    function resetDateRanges(e) {
        e.preventDefault();
        $dateRangeStart.val(moment().format('YYYY-MM-DD') + ' 00:00');
        $dateRangeEnd.val(moment().add(1, 'days').format('YYYY-MM-DD') + ' 23:59');
        this.blur();
    }

    /**
     * Performs Elasticsearch search
     * @param {Array} filterTerms The filter terms for the search
     * @param {Object} searchInfo Search information object
     */
    function doElasticsearchSearch(filterTerms, searchInfo) {
        var payload = {
            query: {bool: {must: filterTerms}},
            size: parseInt(searchInfo.resultSize, 10) || 500,
            from: parseInt(searchInfo.resultOffset, 10) || 0,
            sort: [{timestamp: {order: searchInfo.sortOrder}}],
        };

        var ajaxParams = {
            url: ES_PROXY_URL + '?action=search',
            data: {
                query: JSON.stringify(payload),
                indexName: searchInfo.indexName,
            },
        };

        $.ajax(ajaxParams)
            .then(function (response, status) {
                if (status === 'success' && _.isObject(response)) {
                    return response;
                }
                genericFail.apply(this, arguments);
                return $.Deferred().reject().promise();
            })
            .done(_.partial(redrawResultsPanel, searchInfo))
            .done(addToSearchHistory)
            .fail(genericFail);
    }

    /**
     * Performs VictoriaLogs search
     * @param {Array} filterTerms The filter terms for the search
     * @param {Object} searchInfo Search information object
     */
    function doVictoriaLogsSearch(filterTerms, searchInfo) {
        // Convert Elasticsearch query syntax to VictoriaLogs LogsQL
        // preserveLogic: false - LogSearch historically removes AND operators, treating space as AND
        var logsqlQuery = VictoriaLogsUtils.convertElasticsearchToLogsQL(filterTerms, {
            preserveLogic: false,
        });
        var startTime = Date.now();

        var ajaxParams = {
            url: VL_PROXY_URL,
            method: 'POST',
            data: {
                query: logsqlQuery,
                size: parseInt(searchInfo.resultSize, 10) || 500,
                sort: searchInfo.sortOrder,
            },
        };

        $.ajax(ajaxParams)
            .then(function (response, status) {
                if (status === 'success' && _.isObject(response)) {
                    // Check if it's an error response from VictoriaLogs
                    if (response.error) {
                        throw new Error('VictoriaLogs error: ' + response.message);
                    }

                    // Calculate actual timing
                    var actualTiming = Date.now() - startTime;

                    // Convert VictoriaLogs response to Elasticsearch format for LogSearch compatibility
                    // ensureUniqueIds: false - LogSearch expects original VL IDs, not artificially unique ones
                    // includeMetadata: true - LogSearch displays search timing and total result counts
                    // fieldMapping: LogSearch UI expects both 'blob' and 'message' fields with same content
                    return VictoriaLogsUtils.convertResponse(response, {
                        timing: actualTiming,
                        ensureUniqueIds: false,
                        includeMetadata: true,
                        fieldMapping: {
                            message: 'blob',
                        },
                    });
                }
                genericFail.apply(this, arguments);
                return $.Deferred().reject().promise();
            })
            .done(_.partial(redrawResultsPanel, searchInfo))
            .done(addToSearchHistory)
            .fail(function (xhr) {
                // Enhanced error handling for VictoriaLogs
                var errorMessage = 'VictoriaLogs search failed';

                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                } else if (xhr.responseText) {
                    try {
                        var errorData = JSON.parse(xhr.responseText);
                        errorMessage = errorData.message || errorMessage;
                    } catch (e) {
                        errorMessage = xhr.responseText;
                    }
                }

                // Update panel with error message
                $('#' + searchInfo.panelID + ' .ls-panel-title').html('Error: ' + errorMessage);
                console.error('VictoriaLogs Error:', errorMessage, xhr);
            });
    }

    /**
     * Performs a HTTP call to the selected search engine and starts
     * to display the result by creating a panel.
     * @param {Array} filterTerms The terms to be searched by ES or converted to LogsQL for VL.
     * @param {Object} userQuery
     * @param {Int} resultSize How many documents should be fetched
     * @param {Int} resultOffset How many documents to skip
     * @param {String} sortOrder Whether results should be sorted in ASC or DESC order by log date
     */
    function doSearch(filterTerms, userQuery, resultSize, resultOffset, sortOrder) {
        var searchEngine = $('#ls-search-engine').val() || 'victorialogs';
        var indexName = '_all';
        var panelID = _.uniqueId('ls-panel-');

        var searchInfo = {
            userQuery: userQuery,
            panelID: panelID,
            indexName: indexName,
            resultSize: resultSize,
            resultOffset: resultOffset,
            sortOrder: sortOrder,
            searchEngine: searchEngine,
        };

        $panels.prepend(
            '<div class="ls-panel" id="' + panelID + '">'
            + '<div class="close">&times;</div>'
            + '<div class="actions">'
            + '<a href="#" class="toggle-scroll" title="Make the resultset scrollable">Scroll</a>'
            + '<a href="#" class="toggle" title="Show/hide the resultset">Toggle - </a>'
            + '<a href="#" class="inspect" title="Store the response into a global array, so you can inspect it">Inspect - </a>'
            + '<a href="#" class="toggle-wrap" title="Wraps the blob text">Wrap Text - </a>'
            + '<a href="#" class="copy-table" title="Copy table with headers for better pasting">Copy Table - </a>'
            + '</div>'
            + '<div class="ls-panel-title">Loading (' + searchEngine + ')...</div>'
            + '<div class="ls-content">'
            + '<table class="table table-condensed table-fixed ls-results-table">'
            + '<tbody>'
            + '</tbody>'
            + '</table>'
            + '</div>'
            + '<div class="ls-panel-footer"></div>'
            + '</div>'
        );

        if (searchEngine === 'victorialogs') {
            console.log('🔍 Using VictoriaLogs search engine');
            doVictoriaLogsSearch(filterTerms, searchInfo);
        } else {
            console.log('🔍 Using Elasticsearch search engine');
            doElasticsearchSearch(filterTerms, searchInfo);
        }
    }

    /**
     * Copy table data with headers for better pasting
     * @param {jQuery.Event} e
     */
    function copyTableWithHeaders(e) {
        e.preventDefault();
        var $panel = $(this).closest('.ls-panel');
        var $table = $panel.find('.ls-results-table');
        
        if ($table.length === 0) {
            alert('No table data to copy');
            return;
        }
        
        var textToCopy = '';
        var headerTexts = [];
        var rowData = [];
        
        // Get header texts
        $table.find('thead th').each(function () {
            headerTexts.push($(this).text().trim());
        });
        
        // Get row data (text only, no HTML)
        $table.find('tbody tr').each(function () {
            var row = [];
            $(this).find('td').each(function () {
                var cellText = $(this).text().trim();
                // Clean up text by removing extra whitespace and newlines
                cellText = cellText.replace(/\s+/g, ' ');
                row.push(cellText);
            });
            if (row.length > 0) {
                rowData.push(row);
            }
        });
        
        // Create markdown table format
        if (headerTexts.length > 0) {
            // Add header row
            textToCopy = '| ' + headerTexts.join(' | ') + ' |\n';
            // Add separator row
            textToCopy += '|' + headerTexts.map(function () { return ' -- '; }).join('|') + '|\n';
            // Add data rows
            rowData.forEach(function (row) {
                textToCopy += '| ' + row.join(' | ') + ' |\n';
            });
        }
        
        // Copy to clipboard
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(textToCopy).then(function () {
                alert('Table copied to clipboard with headers!');
            }).catch(function () {
                fallbackCopyText(textToCopy);
            });
        } else {
            fallbackCopyText(textToCopy);
        }
    }

    /**
     * Fallback copy method for older browsers
     * @param {String} text
     */
    function fallbackCopyText(text) {
        var textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            alert('Table copied to clipboard with headers!');
        } catch (err) {
            alert('Copy failed. Please copy manually from the table.');
        }
        
        document.body.removeChild(textArea);
    }

    /**
     * Shows or hides LogsQL tips based on the selected search engine
     */
    function toggleLogsQLTips() {
        var searchEngine = $('#ls-search-engine').val();
        var $logsqlTips = $('#logsql-tips');

        if (searchEngine === 'victorialogs') {
            $logsqlTips.show();
        } else {
            $logsqlTips.hide();
        }
    }

    /**
     * Search logs based on URL.
     */
    function parseHashAndSearch() {
        var queryString = window.location.hash.substr(1);
        var params;
        var size;
        var sortOrder;
        var query;
        var queryFilter;
        var email;
        var fromDate;
        var toDate;
        var requestID;
        var messages = [];

        if (queryString.length === 0) {
            return;
        }

        params = parseQueryString(queryString);
        query = params.query || '';

        // If the search box is empty, then the user must be landing from an URL,
        // so let's fill the query input with something, if any.
        if ($email.val() === '' && $requestID.val() === '' && $query.val() === '') {
            if (params.size) {
                $size.val(params.size);
            }

            // Set search engine from URL
            if (params.engine) {
                $('#ls-search-engine').val(params.engine);

                // Update the active tab button
                $('.tab-group:first-child .tab-button').removeClass('active');
                $('.tab-group:first-child .tab-button[data-value="' + params.engine + '"]').addClass('active');

                // Show/hide LogsQL tips based on search engine from URL
                toggleLogsQLTips();
            }

            // Extract query string params and populate the form fields with them
            query = params.query || '';
            _.each(query.split('AND'), function (queryParts) {
                var keyValueArray = queryParts.split(':');
                var timestamp;
                if (keyValueArray.length === 1) {
                    messages.push(keyValueArray[0].trim().replace(/"/g, ''));
                    return;
                }
                if (keyValueArray[0].trim() === 'blob') {
                    messages.push(queryParts.trim());
                    return;
                }
                if (keyValueArray[0].trim() === 'email') {
                    email = keyValueArray[1].trim().replace(/"/g, '');
                    return;
                }
                if (keyValueArray[0].trim() === 'timestamp') {
                    // keyValueArray = [" timestamp", "[2017-12-14T00", "00 TO 2017-12-15T23", "59]"]
                    keyValueArray.shift();

                    // timestamp = [2017-12-14T00:00 TO 2017-12-15T23:59]
                    timestamp = _.map(keyValueArray, function (val) {
                        return val.trim();
                    }).join(':');

                    // timestamp = 2017-12-14T00:00 TO 2017-12-15T23:59
                    timestamp = timestamp.replace(/[[]]/g, '');

                    // timestamp = ["2017-12-14T00:00 ", " 2017-12-15T23:59"]
                    timestamp = timestamp.split('TO');

                    fromDate = timestamp[0].trim().replace('T', ' ').replace('[', '');
                    toDate = timestamp[1].trim().replace('T', ' ').replace(']', '');
                    return;
                }

                // Some URLs look like this #query=request_id:("ELlOlG") so we're removing quotes and parenthesis.
                if (keyValueArray[0].trim() === 'request_id') {
                    requestID = keyValueArray[1].trim().replace(/["()]*/g, '');
                }
            });

            // Update fields
            $email.val(email);
            $requestID.val(requestID);
            $query.val(messages.join(' AND '));

            // Update datepickers only if we parsed values for them
            if (fromDate) {
                $dateRangeStart.val(fromDate);
            }
            if (toDate) {
                $dateRangeEnd.val(toDate);
            }
        }

        size = parseInt(params.size, 10) || parseInt($size.val(), 10);
        sortOrder = params.sort || $sortOrder.val();

        queryFilter = {query_string: {query: query}};
        doSearch([queryFilter], query, size, 0, sortOrder);
    }

    function togglePerformanceMode() {
        $('td.performance-0').toggleClass('visible');
        $('td.performance-100').toggleClass('visible');
        $('td.performance-300').toggleClass('visible');
        $('td.performance-500').toggleClass('visible');
        $('td.performance-1000').toggleClass('visible');
        $('td.performance-feelsbadman').toggleClass('visible');
    }

    function toggleSlowCommandsMode() {
        $('td.slow-command-500').toggleClass('visible');
        $('td.slow-command-1000').toggleClass('visible');
        $('td.slow-command-5000').toggleClass('visible');
        $('td.slow-command-10000').toggleClass('visible');
        $('td.slow-command-20000').toggleClass('visible');
    }

    /**
     * Handle keyboard shortcuts
     * @param {Event} e
     */
    function handleKeyboardShortcuts(e) {
        // Close dialog when ESC is pressed
        if (e.keyCode === 27) {
            e.preventDefault();
            $('.modal-header').find('.close').click();
            return;
        }

        // All shortcuts require shift for now
        if (!e.shiftKey) {
            return;
        }

        // Prevent input text control to trigger this event
        if (e.target.nodeName === 'INPUT' || e.target.nodeName === 'TEXTAREA' || e.target.contentEditable === 'true') {
            return;
        }

        // Close last section when X is pressed
        if (e.keyCode === 88) {
            e.preventDefault();
            $('div.close').last().click();
        }

        // Display dialog with columns and keyboard shortcuts to display
        if (e.keyCode === 191) {
            e.preventDefault();
            $('.show-shortcuts').click();
        }

        // Toggle Quiet mode when Q is pressed
        // Quiet mode de-eemphasizes lines selected as "quiet"
        if (e.keyCode === 81) {
            e.preventDefault();
            $('tr.ls-quiet').toggleClass('ls-quiet-active');
        }

        // Toggle Silent mode when S is pressed
        // Silent mode toggles lines selected as "quiet"
        if (e.keyCode === 83) {
            e.preventDefault();
            $('tr.ls-quiet').toggleClass('hidden');
        }

        // Highlight performance issues in the code by overlaying a heatmap
        if (e.keyCode === 80) {
            e.preventDefault();
            togglePerformanceMode();
        }
    }

    /**
     * Populates keyboard shortcuts modal
     */
    function populateShortcutModal() {
        var shortcuts = {
            'Shift + ?': 'Show this dialog',
            'Shift + X': 'Close last panel',
            'Shift + Q': 'Toggle Quiet mode (quiet mode deemphasizes quiet lines)',
            'Shift + S': 'Toggle Silent mode (silent mode hides quiet lines)',
            'Shift + P': 'Toggle Performance mode (time gaps highlighted)',
            'Alt + click': 'Highlight row',
            'ESC ': 'Close dialog',
        };
        var table = $('<table/>')
            .addClass('table table-hover');
        _.each(shortcuts, function (description, key) {
            table.append($('<tr/>')
                .append('<td><strong><code>' + key + '</code></strong></td>')
                .append('<td>' + description + '</td>'));
        });
        $showShortcuts.find('.modal-body').html(table);
    }

    /**
     * Populates JSON Pretty Print modal
     */
    function populateJSONModal() {
        // Really lazy regex that assumes everything in a log line inside of curly
        // brackets is JSON, which 99% of the time is true.
        var pattern = '{.*}';
        var blob = $(this).parent().text();
        var regex = new RegExp(pattern, 'g');

        // If we are trying to look at a JSON in this line the JSON may end in another line, let's look at the next 5 lines to try to parse the JSON
        var currentRow = $(this).closest('tr');
        var remainingRows = 5;

        // Default to no JSON available
        var prettyJSON = 'No JSON Found to pretty print, sorry!';
        var formattedJSON = false;
        while (remainingRows > 0) {
            try {
                // If there is JSON, make it pretty
                if (regex.test(blob)) {
                    prettyJSON = JSON.stringify(JSON.parse(blob.match(pattern)[0]), null, 4);
                    formattedJSON = true;
                    break;
                } else {
                    var nextRow = currentRow.next('tr');
                    if (!nextRow.length) {
                        break;
                    }
                    var nextBlob = nextRow.find('.ls-blob').text();
                    if (!nextBlob) {
                        break;
                    }

                    blob += nextBlob;
                    currentRow = nextRow;
                    remainingRows--;
                }
            } catch (e) {
                prettyJSON = 'Tried to parse JSON but failed, check the console for what we tried to parse, sorry!';
                console.log(blob);
            }
        }

        // Add our html to the modal
        var html = (formattedJSON ? '<button onclick="navigator.clipboard.writeText(this.nextElementSibling.textContent)" class="btn btn-default" style="margin-bottom: 10px;">Copy JSON</button>' : '')
            + '<pre>' + _.escape(prettyJSON) + '</pre>';

        $showJSONModal.find('.modal-body').html(html);
    }

    // Set datepicker object
    $('#ls-dateRangeStart, #ls-dateRangeEnd').datetimepicker({
        timeInput: true,
        timeFormat: 'HH:mm',
        dateFormat: 'yy-mm-dd',
    });

    // And set From value to today's date and To value to end of tomorrow
    $dateRangeStart.val(moment().format('YYYY-MM-DD') + ' 00:00');
    $dateRangeEnd.val(moment().add(1, 'days').format('YYYY-MM-DD') + ' 23:59');

    // Initialize timezone toggle button text
    $('.toggle-timezone').text(showTimezoneLocal ? 'Show times in UTC' : 'Show times in local time')
        .attr('title', showTimezoneLocal ? 'Show times in UTC' : 'Show times in local time');

    $('#supportal_logSearch')
        .on('submit', 'form.ls-search', searchLogs)
        .on('click', 'form.ls-search .select-columns', populateColumnsModal)
        .on('click', 'form.ls-search .show-shortcuts', populateShortcutModal)
        .on('click', 'form.ls-search .select-quiet-lines', populateQuietLinesModal)
        .on('click', 'form.ls-search .performance-heatmap', togglePerformanceMode)
        .on('click', 'form.ls-search .select-slow-commands', toggleSlowCommandsMode)
        .on('click', 'form.ls-search .choose-date-format', updateDateFormat)
        .on('click', 'form.ls-search .toggle-timezone', toggleTimezone)
        .on('change', '#quick-query-select', prefillForm)
        .on('click', 'form.ls-search .quick-range-1week', onFillOnClick(7))
        .on('click', 'form.ls-search .quick-range-2week', onFillOnClick(14))
        .on('click', 'form.ls-search .quick-range-30days', onFillOnClick(30))
        .on('click', 'form.ls-search .quick-range-max', onFillOnClick(35))
        .on('click', 'form.ls-search .quick-range-reset', resetDateRanges)
        .on('change', '#ls-columns input', refreshColumns)
        .on('change', '#ls-quiet-lines input', refreshQuietLines)
        .on('click', '.ls-panel .toggle', togglePanel)
        .on('click', '.ls-panel .toggle-scroll', togglePanelScroll)
        .on('click', '.ls-panel .toggle-wrap', togglePannelWrap)
        .on('click', '.ls-panel .inspect', inspectPanel)
        .on('click', '.ls-panel .close', closePanel)
        .on('click', '.ls-panel .copy-table', copyTableWithHeaders)
        .on('click', '.ls-blob .toggle-json', populateJSONModal);

    $(window)
        .on('hashchange', parseHashAndSearch)
        .on('keyup', handleKeyboardShortcuts);

    // Forces the event to be triggered when user lands on the page
    $(window).trigger('hashchange');

    // Tab button functionality
    document.addEventListener('DOMContentLoaded', function () {
        var tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                // Remove active class from all buttons in the same group
                var group = this.closest('.tab-group');
                group.querySelectorAll('.tab-button').forEach(function (element) {
                    element.classList.remove('active');
                });

                // Add active class to clicked button
                this.classList.add('active');

                // Update the hidden input value
                var hiddenInput = group.querySelector('input[type="hidden"]');
                hiddenInput.value = this.dataset.value;

                // Show/hide LogsQL tips based on search engine selection
                if (hiddenInput.id === 'ls-search-engine') {
                    toggleLogsQLTips();
                }
            });
        });

        // Initialize LogsQL tips visibility on page load
        toggleLogsQLTips();
    });
})(jQuery);