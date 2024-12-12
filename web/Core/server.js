import express from 'express';
import bodyParser from 'body-parser';
import db from './db.js'; // Импортируем knex из db.js



export const app = express();

app.use(bodyParser.json());

pool.on('error', (err) => {
    console.error('Error connect to db:', err);
});


// Обработчик для получения кошелька по адресу
app.get('/api/wallets/:wallet_address', async (req, res) => {
    const { wallet_address } = req.params;

    try {
        const wallet = await db('wallets').where({ address: wallet_address }).first();

        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        res.json(wallet); // Отправка записи в формате JSON
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Обработчик для получения всех кошельков по user_id
app.get('/api/wallets/get_all/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const wallets = await db('wallets').select('address').where({ user_id });

        if (wallets.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(wallets); // Отправка списка адресов
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Обработчик для получения активного кошелька по user_id
app.get('/api/wallets/active/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const activeWallet = await db('wallets')
            .where({ user_id, active: true })
            .first();

        if (!activeWallet) {
            return res.status(404).json({ error: 'Active wallet not found' });
        }

        res.json(activeWallet);
    } catch (err) {
        console.error('Error executing query', err);
        res.status(500).json({ error: 'Server error' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started: http://localhost:${PORT}`);
});