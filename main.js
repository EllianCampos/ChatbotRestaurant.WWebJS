// The token is used to avoid that anybody could use the API
const TOKEN = 'my-secret-token';

// Backend where to send the messages 
const BACKEND_WEB_HOOK = "https://localhost:7190/api/whatsappweb/get-from-wa"

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const app = express();
const port = 8000;

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

app.use(express.json());

// Crear cliente de WhatsApp
// const client = new Client({
//     authStrategy: new LocalAuth(),
//     puppeteer: {headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-extensions']}
// });

const client = new Client({
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Escanea el código QR con WhatsApp');
});

client.on('ready', () => {
    console.log('Cliente conectado');
});

// Ejemplo: Escuchar mensajes
client.on('message', async (message) => {
    const phone = message?.from.split("@")[0]
    const body = message.body
    const userName = message._data.notifyName
 
    // fetch(BACKEND_WEB_HOOK, {
    //     method: 'POST',
    //     headers: {
    //         "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify({
    //         phone: phone,
    //         username: userName,
    //         message: body
    //     })
    // })
    console.log(body)
});

// Ejemplo: Función para enviar mensaje
async function enviarMensaje(numero, mensaje) {
    const chatId = numero.includes('@c.us') ? numero : `${numero}@c.us`;
    await client.sendMessage(chatId, mensaje);
}

app.post('/send', (req, res) => {
    try{
        // Validate token
        const token = req.headers['authorization'];
        if (!token || token !== TOKEN) {
            return res.status(403).json({ error: 'Unauthorized: Invalid token' });
        }

        // Validate data
        const { number, message } = req.body;
        if (!number || !message) {
            return res.status(400).json({ error: 'number and message are required' });
        }
    
        enviarMensaje(number, message)
        return res.status(204).json();
    } catch{
        return res.status(500).json()
    }
});

app.get('/', (req, res) => res.status(200).json({ online: true }))

client.initialize();
app.listen(port, () => console.log(`Server is running on port ${port}`));





































// const express = require('express');
// const { Client } = require('whatsapp-web.js');
// const qrcode = require('qrcode-terminal');

// const app = express();
// const port = 8000;

// const client = new Client({
//     puppeteer: {
//         headless: true,
//         args: ['--no-sandbox', '--disable-setuid-sandbox']
//     }
// });

// client.on('qr', (qr) => {
//     qrcode.generate(qr, { small: true });
// });

// client.on('ready', () => {
//     console.log('Client is ready!');
// });

// client.on('message', msg => {
//     if (msg.body === 'ping') {
//         msg.reply('pong');
//     }
// });

// client.initialize();

// app.get('/', (req, res) => {
//     res.send('WhatsApp Web is running!');
// });

// app.listen(port, () => {
//     console.log(`App listening at http://localhost:${port}`);
// });