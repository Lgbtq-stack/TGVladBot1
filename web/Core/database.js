async function getWalletData(wallet_address) {
    try {
        const response = await fetch(`http://localhost:3000/api/wallets/${wallet_address}`);
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Ошибка получения данных кошелька:', error.message);
        throw error;
    }
}


async function getWalletsByUserId(user_id) {
    try {
        const response = await fetch(`http://localhost:3000/api/wallets/get_all/${user_id}`);
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error getting wallets:', error.message);
        throw error;
    }
}

async function getActiveWallet(user_id) {
    try {
        const response = await fetch(`http://localhost:3000/api/wallets/active/${user_id}`);
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error getting wallets:', error.message);
        throw error;
    }
}

getActiveWallet(1195034010).then(r => console.log(r)).catch(e => console.error(e));
//getWalletData("GDTOJL273O5YKNF3PIG72UZRG6CT4TRLDQK2NT5ZBMN3A56IP4JSYRUQ").then(r => console.log(r)).catch(e => console.error(e));