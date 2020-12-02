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
    const form = new multiparty.Form();
    form.parse(request, (err, fields, files) => {
        const body = !_.isEmpty(fields) || !_.isEmpty(files) ? new FormData() : '';

        if (!_.isEmpty(fields)) {
            _.each(fields, (value, key) => {
                body.append(key, value.join(','));
            });
        }

        if (!_.isEmpty(files)) {
            const file = files.file[0];
            body.append('file', fs.createReadStream(file.path), file.originalFilename);
        }

        fetch(`https://www.expensify.com${request.url}`, {method: 'POST', body})
            .then((res) => {
                const contentType = res.headers.get('content-type');
                response.setHeader('Content-Type', contentType);

                if (contentType === 'application/json') {
                    res.json().then(json => response.end(JSON.stringify(json)));
                    return;
                }

                res.buffer()
                    .then(buffer => response.end(buffer));
            })
            .catch((error) => {
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
