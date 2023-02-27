const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const WS = require('ws');
const cors = require('@koa/cors');
const router = require('./routes/routes');
const Database = require('./db');

const app = new Koa();
const db = new Database();

// Обработчик тела запроса
app.use(koaBody({
  urlencoded: true,
  multipart: true,
  json: true,
}));

// Cors
app.use(cors());

// Обработчик роутеров
app.use(router());

// Создание серверов
const server = http.createServer(app.callback());
const wsServer = new WS.Server({ server });

wsServer.on('connection', (ws) => {
  const errCallback = (err) => {
    if (err) {
      console.log(err);
    }
  }

  const sending = (data) => {
    [...wsServer.clients]
      .filter((client) => client.readyState === WS.OPEN)
      .forEach((client) => client.send(data, errCallback));
  }

  ws.on('message', async (msg) => {
    const decoder = new TextDecoder('utf-8');
    const data = JSON.parse(decoder.decode(msg));
    console.log('Данные получены  и обработаны:', data);
    if (data.type === 'registration') {
      if (!db.checkName(data.name)) {
        db.addClient(ws, data.name);
        const response = JSON.stringify({
          type: 'registration',
          success: true,
          activeUsers: db.getActiveClients(),
          messages: db.chat
        });
        try {
          sending(response);
          console.log('Список имён и сообщений отправлен:', response);
        }
        catch (err) {
          sending(JSON.stringify({
            type: 'registration',
            success: false,
            error: err.message,
          }));
          console.log('ошибка сервера "registration"')
        }
        
      } else {
        try {
          sending(JSON.stringify({
            type: 'registration',
            success: false,
          }));
          console.log('Такое имя уже занято');
        }
        catch (err) {
          sending(JSON.stringify({
            type: 'registration',
            success: false,
            error: err.message,
          }));
          console.log('ошибка сервера "имя занято"');
        }
      }
    }
    if (data.type === 'message') {
      console.log('сообщение получено:', data);
      const response = JSON.stringify({
        type: 'message',
        success: true,
        messages: db.addMes(data),
      });
      try {
        sending(response);
        console.log('список сообщений отправлен:', response);
      }
      catch (err) {
        sending(JSON.stringify({
          type: 'message',
          success: false,
          error: err.message,
        }));
        console.log('ошибка сервера "message"')
      }
    }
  });

  ws.on('close', () => {
    db.delete(ws);
    const response = JSON.stringify({
      type: 'update',
      success: true,
      activeUsers: db.getActiveClients(),
    });
    try {
      sending(response);
      console.log('Список имён отправлен:', response);
    }
    catch (err) {
      sending(JSON.stringify({
        type: 'update',
        success: false,
        error: err.message,
      }));
      console.log('ошибка сервера "update"');
    }
  });

  console.log('connected');
});

// Прослушивание порта
const port = process.env.PORT || 7070;
server.listen(port);
console.log(`the server is started on port ${port}`);