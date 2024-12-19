import asyncio
import json

from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo

from Config import API_TOKEN, MINI_APP_URL

bot = Bot(token=API_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def start(message: types.Message):
    await message.answer(
        "Привет! Нажми на кнопку ниже, чтобы открыть веб-приложение.",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="Open App", web_app=WebAppInfo(url=MINI_APP_URL))]]))


@dp.callback_query_handler()
async def handle_callback_query(callback_query: types.CallbackQuery):
    try:
        data = json.loads(callback_query.data)
        action = data.get("action")
        server_id = data.get("server_id")

        user_id = callback_query.from_user.id

        await bot.answer_callback_query(callback_query.id, text="Данные получены!")

        if action == "buy_server" and server_id:
            await bot.send_message(user_id, f"Вы хотите купить сервер с ID: {server_id}")
        else:
            await bot.send_message(user_id, "Неверные данные. Попробуйте снова.")
    except json.JSONDecodeError:
        await bot.answer_callback_query(callback_query.id, text="Ошибка обработки данных.")
        await bot.send_message(callback_query.from_user.id, "Ошибка обработки данных.")

async def main():
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Бот выключен!")
