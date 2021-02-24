require('dotenv').config()

const fetch = require('node-fetch');
fetch(`https://login.microsoftonline.com/${process.env.TENANTID}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `client_id=${process.env.CLIENTID}&scope=openid&username=${process.env.USERNAME}&password=${process.env.PASSWORD}&grant_type=password`
}).then((res) => {
    return res.json();
}).then((res) => {
    const fs = require('fs');

    fs.readdir(process.cwd(), function (err, files) {
        if (err) {
          console.log(err);
          return;
        }

        const filePath = files.find(x => x.includes('.zip'));
        if (filePath) {
            const stats = fs.statSync(filePath).size;
            const stream = fs.createReadStream(filePath);

            fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${process.env.FOLDERID}:/${filePath}:/content`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${res.access_token}`,
                    "Content-length": stats
                },
                body: stream
            })
            .then(function(res) {
                console.log(res.status)
                return res.text();
            }).then(function(json) {
                console.log(json);
            }).catch((err) => {
                console.log(err)
            });
        }
    });
});