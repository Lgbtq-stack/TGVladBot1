import asyncio

from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart, Command
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, KeyboardButton, WebAppInfo, ReplyKeyboardMarkup

from Config import API_TOKEN, MINI_APP_URL

bot = Bot(token=API_TOKEN)
dp = Dispatcher()


def get_webapp_button():
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="Open App", web_app=WebAppInfo(url=MINI_APP_URL))]
    ])
    return keyboard

@dp.message(Command("start"))
async def start(message: types.Message):
    await message.answer(
        "Привет! Нажми на кнопку ниже, чтобы открыть веб-приложение.",
        reply_markup=get_webapp_button()
    )

async def main():
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Бот выключен!")
