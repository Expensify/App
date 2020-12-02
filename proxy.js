const _ = require('underscore');
const http = require('http');
const fetch = require('node-fetch');
const multiparty = require('multiparty');
const FormData = require('form-data');
const fs = require('fs');

/**
 * Local proxy server that hits the production endpoint
 * to get around CORS issues. We use this so that it's
 * possible to work on the app within a limited development
 * environment that has no local API.
 */
const server = http.createServer((request, response) => {
    // We use multiparty to parse multipart/form-data which the
    // API uses when making requests to our web API
    const form = new multiparty.Form();
    form.parse(request, (err, fields, files) => {
        const body = !_.isEmpty(fields) || !_.isEmpty(files) ? new FormData() : '';

        if (!_.isEmpty(fields)) {
            _.each(fields, (value, key) => {
                // Arrays are not valid FormData values so we join those entries
                // together if a client sends them.
                body.append(key, value.join(','));
            });
        }

        // Files need to be treated differently from regular fields
        if (!_.isEmpty(files)) {
            const file = files.file[0];
            body.append('file', fs.createReadStream(file.path), file.originalFilename);
        }

        // Re-make the request with the production endpoint
        fetch(`https://www.expensify.com${request.url}`, {method: 'POST', body})
            .then((res) => {
                const contentType = res.headers.get('content-type');
                response.setHeader('Content-Type', contentType);

                if (contentType === 'application/json') {
                    res.json().then(json => response.end(JSON.stringify(json)));
                    return;
                }

                // If we have something other than JSON just return it as a buffer for
                // now. Everything that is not JSON should be images, files, etc.
                res.buffer()
                    .then(buffer => response.end(buffer));
            })
            .catch((error) => {
                // API errors should be returned as JSON responses. But if something
                // goes wrong with the proxy we'll log it out for context

                /* eslint-disable-next-line no-console */
                console.log(`An error occurred: ${error}`);
                response.end();
            });
    });
});

server.listen(9000, () => {
    /* eslint-disable-next-line no-console */
    console.log('Proxy server listening at http://localhost:9000');
});
