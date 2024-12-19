import asyncio

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


@dp.callback_query()
async def handle_callback_query(callback_query: types.CallbackQuery):
    data = callback_query.data
    user_id = callback_query.from_user.id

    await bot.answer_callback_query(callback_query.id)

    print(f"Получено сообщение от {user_id}: {data}")

    await bot.send_message(user_id, f"Ваши данные: {data}")


async def main():
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Бот выключен!")
