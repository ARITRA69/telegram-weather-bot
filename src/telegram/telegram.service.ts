import { Injectable, Logger } from '@nestjs/common';
import { TEST_USER_ID } from './telegram.constants'
import axios, { AxiosRequestConfig } from 'axios';
const TelegramBot = require('node-telegram-bot-api');

const TELEGRAM_TOKEN = "6438874529:AAGdumB3TQEDcEVCjxQF8BS0EYR21cwLE54"

@Injectable()
export class TelegramService {

    // private readonly bot: any
    // private logger = new Logger(TelegramService.name)

    // constructor() {
    //     this.bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

    //     this.bot.on("message", this.onReceiveMessage);

    //     this.sendMessageToUser(TEST_USER_ID, `Server started at ${new Date()}`)
    // }

    // onReceiveMessage = (msg: any) => {
    //     this.logger.debug(msg);
    // }

    // sendMessageToUser = (userId: string, message: string) => {
    //     this.bot.sendMessage(userId, message);
    // }

}

const weatherApiOptions: AxiosRequestConfig = {
    method: 'GET',
    url: 'https://weatherapi-com.p.rapidapi.com/current.json',
    params: {}, // We'll update this with the location later
    headers: {
        'X-RapidAPI-Key': '5b0fecc814msh821de7874edf530p1dede3jsnd2e03d44304c',
        'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com',
    },
};

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true })

bot.on("message", async (msg: any) => {
    const chatId = msg.chat.id;
    const userInput = msg.text;

    // Check if the user's message contains a location (you can implement your own logic here)
    if (userInput.toLowerCase().includes('/l')) {
        // Extract and format the location from the user's message
        const location = userInput.replace('/l', '').trim();

        // Update the params object with the extracted location
        weatherApiOptions.params.q = location;

        try {
            const response = await axios.request(weatherApiOptions);
            const weatherData = response.data;

            const temperature = weatherData.current.temp_c;
            const humidity = weatherData.current.humidity;
            const weatherCondition = weatherData.current.condition.text;
            const windSpeed = weatherData.current.wind_kph;

            // Create a message to send to the user
            const message = `Current Weather:
            - Temperature: ${temperature}°C
            - Weather Condition: ${weatherCondition}
            - Humidity: ${humidity}%
            - Wind Speed: ${windSpeed} km/h`;

            // Send the weather data as a response to the user
            bot.sendMessage(chatId, message);
        } catch (error) {
            console.error(error);
        }
    }
    if (userInput.toLowerCase().includes('/help')){
        bot.sendMessage(chatId, "use:  /L LOCATION_NAME ")
    }
});