const fs = require('fs');
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const data = require('./data.json');
// Path where the session data will be stored
const SESSION_FILE_PATH = './session.json';

// Load the session data if it has been previously saved
let sessionData;
if(fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}

// Use the saved values
const client = new Client({
    session: sessionData
});

// Save session values to the file upon successful auth
client.on('authenticated', (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
        if (err) {
            console.error(err);
        }
    });
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// client.on('message', message => {
// 	if(message.body == "בדיקה") {
//         message.reply("עובד");
//         client.sendMessage(message.from, 'עובד');
//     }
// });

client.on('message', message => {
    console.log(message)
    if(message.body == '') return;
    let tempData = data.data;
    // console.log(tempData)
    let length = message.body.split(' ').length;
    let messageWords = message.body.split(' ');
    // console.log('messageWords', messageWords)
    for(let i = 0; i < length; ++i) {
        tempData = tempData.filter(x => `${x.firstName} ${x.lastName} ${x.city} ${x.address}`.includes(messageWords[i]));
    }
    let result = '', counter = 1;
    tempData.forEach(x => {
        if(counter > 1) result += '\n--------------------------------------------------------\n';
        result += `*${x.firstTitle || ''} ${x.firstName || ''} ${x.lastName || ''} ${x.lastTitle || ''}*
${x.mobile ? `*נייד*: ${x.mobile}` : ''} ${x.homePhone ? `*טלפון*: ${x.homePhone}` : ''}
${x.address ? `*כתובת*: ${x.address}` : ''} ${x.city ? `*עיר*: ${x.city}` : ''}`;
        ++counter;
    });
    result += `\n \n \n *במידה ולא עלה לכם הפרטים אותם אתם מחפשים או שיש טעות באחד מהפרטים נשמח שתעדכן אותנו כדי שנעדכן אותם במערכת,
לעדכון: a7112079@gmail.com`;
    if(tempData.length > 0) {
         message.reply(result);
    }
    // else {
    //     message.reply('אין תוצאות לחיפוש שהזנת');
    // }
});

client.on('ready', () => {
    console.log('client ready');
});

client.initialize();