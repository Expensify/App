const _ = require('underscore');
const http = require('http');
const fetch = require('node-fetch');
const multiparty = require('multiparty');
const FormData = require('form-data');
const fs = require('fs');

const server = http.createServer((request, response) => {
    const form = new multiparty.Form();
    form.parse(request, (err, fields, files) => {
        const body = !_.isEmpty(fields) || !_.isEmpty(files) ? new FormData : '';

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
            .then(res => {
                const contentType = res.headers.get('content-type');
                response.setHeader('Content-Type', contentType);

                if (contentType === 'application/json') {
                    res.json().then((json) => response.end(JSON.stringify(json)));
                    return;
                }

                res.buffer()
                    .then((buffer) => response.end(buffer));
            })
            .catch(err => {
                console.log(`An error occurred: ${err}`);
                response.end();
            });
    });
});

server.listen(9000, () => {
    console.log('Proxy server listening at http://localhost:9000');
});
