import express from 'express';
import bodyParser from 'body-parser';
import db from './db.js'; // Импортируем knex из db.js
import cors from 'cors';
import fs from 'fs';
import https from 'https';

export const app = express();

app.use(cors());
app.use(bodyParser.json());



function get_servers() {
    return JSON.parse(fs.readFileSync('servers.json'));
}

app.get('/', (req, res) => {
    res.send('Hello, Secure World!');
});


app.get('/api/servers/data', async (req, res) => {
    // Получаем данные серверов из фаила servers.json
    try {
        const servers = get_servers();
        let wallets_servers_dict = {};
        try {
            //получить из таблцы wallets_servers все кошельки и сервера
            const wallets_servers = await db('wallets_servers')
                .select('address', 'server');
            //преобразовать в словарь где ключ - название сервера, значение - количество кошельков
            wallets_servers_dict = wallets_servers.reduce((acc, val) => {
                if (acc[val.server]) {
                    acc[val.server].push(val.address);
                } else {
                    acc[val.server] = [val.address];
                }
                return acc;
            }, {});


        } catch (err) {
            console.error('Error reading wallets_servers:', err);
        }


        // нужно посмотреть сколько всего серверов есть и посчитать разницу доступных из ключа "available"
        let changed = {};
        for (let key in servers) {
            changed[key] = servers[key]
            let len_servers = wallets_servers_dict[key] ? wallets_servers_dict[key].length : 0;
            changed[key].available = servers[key].available - len_servers;
            // если меньше 0, то 0
            if (changed[key].available < 0) {
                changed[key].available = 0;
            }
        }

        res.json(changed);
    } catch (err) {
        console.error('Error reading servers.json:', err);
        res.status(500).json({error: 'Server error'});
    }
});

app.get('/api/servers/income', async (req, res) => {
    // Получаем данные серверов из фаила servers.json и делаем dict[кошелек] = доход
    try {
        const servers = get_servers();
        let income = {};
        for (let key in servers) {
            income[key] = servers[key].btc_mine;
        }
        res.json(income);
    } catch (err) {
        console.error('Error reading servers.json:', err);
        res.status(500).json({error: 'Server error'});
    }
});

app.get('/api/servers/prices', async (req, res) => {
    // Получаем данные серверов из фаила servers.json и делаем dict[кошелек] = цена

    try {
        const servers = get_servers();
        let prices = {};
        for (let key in servers) {
            prices[key] = servers[key].price;
        }
        res.json(prices);
    } catch (err) {
        console.error('Error reading servers.json:', err);
        res.status(500).json({error: 'Server error'});
    }
});


// Обработчик для получения активного кошелька по user_id
app.get('/api/wallets/active/:user_id', async (req, res) => {
    const {user_id} = req.params;
    console.log('Getting active wallet for user', user_id);
    try {
        const result = await db.raw(
            `
                SELECT wallets.user_id,
                       wallets.address,
                       COALESCE((
                                    SELECT JSON_AGG(
                                                   JSON_BUILD_OBJECT(
                                                           'time', TO_CHAR(btc_bonus.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
                                                           'amount', btc_bonus.amount
                                                   )
                                           )
                                    FROM btc_bonus
                                    WHERE btc_bonus.wallet = wallets.address
                                ), '[]') AS history,
                       COALESCE(
                               (SELECT TO_CHAR(value::TIME, 'HH24:MI:SS')
                                FROM constants
                                WHERE key = 'btc_get_time'),
                   ''
               ) AS btc_get_time,
                       COALESCE((
                                    SELECT JSON_AGG(
                                                   JSON_BUILD_OBJECT('server', wallets_servers.server, 'created_at', wallets_servers.created_at)
                                           )
                                    FROM wallets_servers
                                    WHERE wallets_servers.address = wallets.address
                                ), '[]') AS servers
                FROM get_active_wallets(?) AS wallets
            `,
            [user_id]
        );

        const activeWallet = result.rows[0];

        console.log("activeWallet:",activeWallet);

        // переделать servers в массив данных о серверах из get_servers()
        if (activeWallet) {
            const servers_name = activeWallet.servers
            const servers = get_servers();
            // activeWallet.servers -> сделать массивом объектов
            activeWallet.servers = [];
            servers_name.forEach(({server, created_at}) => {
                if (servers[server]) { // Если сервер с таким именем существует в объекте servers
                    const serv_new = servers[server];
                    serv_new.server_name_key = server;
                    serv_new.created_at = created_at;

                    const createdAtDate = new Date(created_at); // Преобразуем created_at в дату
                    const currentDate = new Date(); // Текущая дата

                    serv_new.total_mined_days = Math.floor((currentDate - createdAtDate) / (1000 * 60 * 60 * 24));

                    activeWallet.servers.push(serv_new);
                }
            });
        } else {
            return res.status(404).json({error: 'Active wallet not found'});
        }


        res.json(activeWallet);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).json({error: 'Server error'});
    }
});

app.get('/api/wallets/data/:wallet_address', async (req, res) => {
    const {wallet_address} = req.params;
    console.log('Getting wallet data for ', wallet_address);
    try {
        const activeWallet = await db('wallets')
            .where({'wallets.address': wallet_address})
            .select(
                'wallets.address',
                db.raw(`
                COALESCE((
            SELECT JSON_OBJECT_AGG(
                TO_CHAR(btc_bonus.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
                btc_bonus.amount
            )
            FROM btc_bonus
            WHERE btc_bonus.wallet = wallets.address
        ), '{}') AS history
        `),
                db.raw(`
            COALESCE(
                (SELECT TO_CHAR(value::TIME, 'HH24:MI:SS') 
                 FROM constants 
                 WHERE key = 'btc_get_time'),
                ''
            ) AS btc_get_time
        `)
            )
            .first();

        console.log(activeWallet);

        if (!activeWallet) {
            return res.status(404).json({error: 'Wallet not found'});
        }

        res.json(activeWallet);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).json({error: 'Server error'});
    }
});

//Загрузка SSL сертификатов
const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/miniappserv.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/miniappserv.com/fullchain.pem'),
};

// Запуск HTTPS сервера
https.createServer(options, app).listen(443, () => {
    console.log('HTTPS server running on port 443');
});

// // Запуск HTTP сервера
// app.listen(80, () => {
//     console.log('HTTP server running on port 80');
// });

