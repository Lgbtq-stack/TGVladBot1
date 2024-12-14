import express from 'express';
import bodyParser from 'body-parser';
import db from './db.js'; // Импортируем knex из db.js
import cors from 'cors';


export const app = express();


app.use(cors());
app.use(bodyParser.json());

// Обработчик для получения кошелька по адресу
app.get('/api/wallets/:wallet_address', async (req, res) => {
    const {wallet_address} = req.params;

    try {
        const wallet = await db('wallets').where({address: wallet_address}).first();

        if (!wallet) {
            return res.status(404).json({error: 'Wallet not found'});
        }

        res.json(wallet); // Отправка записи в формате JSON
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).json({error: 'Server error'});
    }
});

// Обработчик для получения всех кошельков по user_id
app.get('/api/wallets/get_all/:user_id', async (req, res) => {
    const {user_id} = req.params;

    try {
        const wallets = await db('wallets').select('address').where({user_id});

        if (wallets.length === 0) {
            return res.status(404).json({error: 'User not found'});
        }

        res.json(wallets); // Отправка списка адресов
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).json({error: 'Server error'});
    }
});

// Обработчик для получения активного кошелька по user_id
app.get('/api/wallets/active/:user_id', async (req, res) => {
    const {user_id} = req.params;

    try {
        const activeWallet = await db('wallets')
            .where({'wallets.user_id': user_id, 'wallets.active': true})
            .select(
                'wallets.user_id',
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
                (SELECT TO_CHAR(value::TIME, 'HH24:MI') 
                 FROM constants 
                 WHERE key = 'btc_get_time'),
                ''
            ) AS btc_get_time
        `)
            )
            .first();

        console.log(activeWallet);

        if (!activeWallet) {
            return res.status(404).json({error: 'Active wallet not found'});
        }

        res.json(activeWallet);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).json({error: 'Server error'});
    }
});