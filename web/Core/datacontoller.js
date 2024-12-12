
//format
// {
//     "wallet":"GDTOJL273O5YKNF3PIG72UZRG6CT4TRLDQK2NT5ZBMN3A56IP4JSYRUQ",
//     "tokens": {
//     "BTC": {
//         "balance": 1.25,
//             "history": {
//             "2024-12-10T13:37:50.124Z": 0.25,
//                 "2024-12-11T13:37:50.124Z": 0.5,
//                 "2024-12-12T13:37:50.124Z": 0.5
//         },
//         "time_to_mine": "2024-12-12T20:00:00Z"
//     }
// }
// }

export async function get_config(user_id) {
    const wallet_data = await getActiveWallet(user_id);

    return {
        "wallet": wallet_data.wallet,
        "tokens": {
            "BTC": {
                "balance": 1.25,
                "history": {
                    "2024-12-10T13:37:50.124Z": 0.25,
                    "2024-12-11T13:37:50.124Z": 0.5,
                    "2024-12-12T13:37:50.124Z": 0.5
                },
                "time_to_mine": "2024-12-12T20:00:00Z"
            }
        }
    };
}