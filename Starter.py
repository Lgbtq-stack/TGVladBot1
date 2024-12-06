import asyncio

from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup

API_TOKEN = '7943409440:AAHjA5acGp59nvloeuxE4kZ_3jwCyr01e1o'
MINI_APP_URL = "t.me/TGVladBot1_bot/TGVladBot1"

bot = Bot(token=API_TOKEN)
dp = Dispatcher()


@dp.message(CommandStart())
async def send_welcome(message: types.Message):
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Открыть мини-приложение",url=MINI_APP_URL)]]
    )
    await message.answer("Привет! Нажмите на кнопку ниже, чтобы открыть мини-приложение:",reply_markup=keyboard)

async def main():
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Бот выключен!")
