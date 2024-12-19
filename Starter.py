import asyncio
import json
import logging

from aiogram import Bot, Dispatcher, types, F
from aiogram.enums import ContentType
from aiogram.filters import Command
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo, WebAppData

from Config import API_TOKEN, MINI_APP_URL

bot = Bot(token=API_TOKEN)
dp = Dispatcher()


@dp.message(Command("start"))
async def start(message: types.Message):
    await message.answer(
        "Привет! Нажми на кнопку ниже, чтобы открыть веб-приложение.",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="Open App", web_app=WebAppInfo(url=MINI_APP_URL))]]))


@dp.message(F.content_type == ContentType.WEB_APP_DATA)
async def handle_web_app_data(message: types.Message):
        data = message.web_app_data.data  # Данные из Web App
        print(f"Полученные данные: {data}")
        await message.answer(f"Получены данные из Web App: {data}")


async def main():
    await dp.start_polling(bot)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Бот выключен!")
