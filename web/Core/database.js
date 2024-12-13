export async function getActiveWallet(user_id) {
    try {
        const response = await fetch(`https://162.33.177.26:3000/api/wallets/active/${user_id}`);
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error getting wallets:', error.message);
        throw error;
    }
}

