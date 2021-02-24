require('dotenv').config()

const MAX_SIZE = 10485759;
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

    fs.readdir(process.cwd(), async function (err, files) {
        if (err) {
          console.log(err);
          return;
        }

        const filePath = files.find(x => x.includes('.zip'));
        if (filePath) {
            const stats = fs.statSync(filePath).size;

            // First create upload session
            const session = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${process.env.FOLDERID}:/${filePath}:/createUploadSession`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${res.access_token}`,
                },
            }).then(function(res) {
                console.log(res.status);
                return res.json();
            });
            
            // upload file
            for (let i = 0; i < stats; i+=(MAX_SIZE+1)) {
                console.log(`bytes: ${i} till ${i+MAX_SIZE}`)
                const end = Math.min(i+MAX_SIZE, stats-1);
                const stream = fs.createReadStream(filePath, {start: i, end });

                await fetch(session.uploadUrl, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${res.access_token}`,
                        "Content-length": end-i+1,
                        "Content-Range": `bytes ${i}-${end}/${stats}`
                    },
                    body: stream
                });
            }

            // Complete upload
            await fetch(session.uploadUrl, {method: 'POST'}).then(function(res) { return res.json() });
        }
    });
});