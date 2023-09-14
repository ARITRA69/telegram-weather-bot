// import { TEST_USER_ID } from './telegram.constants';

import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
const TelegramBot = require('node-telegram-bot-api');
import * as schedule from 'node-schedule';


const TELEGRAM_TOKEN = "6438874529:AAGdumB3TQEDcEVCjxQF8BS0EYR21cwLE54";

@Injectable()
export class TelegramService { }

const weatherApiOptions: AxiosRequestConfig = {
    method: 'GET',
    url: 'https://weatherapi-com.p.rapidapi.com/current.json',
    params: {},
    headers: {
        'X-RapidAPI-Key': '5b0fecc814msh821de7874edf530p1dede3jsnd2e03d44304c',
        'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com',
    },
};

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

let userCities = {}

bot.on("message", async (msg: any) => {
    const chatId = msg.chat.id;
    const userInput = msg.text;

    // Admin page & help
    if (userInput.toLowerCase().includes('/help') || userInput.toLowerCase().includes('/admin')) {

        const adminURL = "https://example.com/admin";
        if (userInput.toLowerCase().includes('/admin')) {
            bot.sendMessage(chatId, `Here is the admin URL: ${adminURL}`);

        }

        else {
            bot.sendMessage(chatId, `Commands:
            -Type location name to get weather information
            -Type /admin for admin panel`)
        }
    }

    else {
        const location = userInput;

        // Check if userCities[chatId] is not an object, initialize it as an object
        if (typeof userCities[chatId] !== 'object') {
            userCities[chatId] = {};
        }

        // Check if userCities[chatId].scheduled is not defined, initialize it as false
        if (userCities[chatId].scheduled === undefined) {
            userCities[chatId].scheduled = false;
        }

        if (!userCities[chatId].scheduled) {
            scheduleWeather(chatId, location);
            userCities[chatId].scheduled = true;
        }

        try {
            // Update the params object with the extracted location
            weatherApiOptions.params.q = location;
            const response = await axios.request(weatherApiOptions);
            const weatherData = response.data;

            const city = weatherData.location.name
            const country = weatherData.location.country
            const temperature = weatherData.current.temp_c;
            const humidity = weatherData.current.humidity;
            const weatherCondition = weatherData.current.condition.text;
            const windSpeed = weatherData.current.wind_kph;

            // Create a message to send to the user
            const message = `Current Weather in ${city}, ${country}:
                - Temperature: ${temperature}°C
                - Weather Condition: ${weatherCondition}
                - Humidity: ${humidity}%
                - Wind Speed: ${windSpeed} km/h`;

            // Send the weather data as a response to the user
            bot.sendMessage(chatId, message + " " + chatId);
        } catch (error) {
            console.error(error);
        }
    }

});

function scheduleWeather(chatId: any, location: string) {
    // Schedule a task to run at 8 AM every day
    schedule.scheduleJob('0 8 * * *', async function () {
        try {
            weatherApiOptions.params.q = location;
            const response = await axios.request(weatherApiOptions);
            const weatherData = response.data;

            const city = weatherData.location.name;
            const country = weatherData.location.country;
            const temperature = weatherData.current.temp_c;
            const humidity = weatherData.current.humidity;
            const weatherCondition = weatherData.current.condition.text;
            const windSpeed = weatherData.current.wind_kph;

            // Create a message to send to the user
            const message = `Current Weather in ${city}, ${country}:
                - Temperature: ${temperature}°C
                - Weather Condition: ${weatherCondition}
                - Humidity: ${humidity}%
                - Wind Speed: ${windSpeed} km/h`;

            // Send the weather data as a response to the user
            bot.sendMessage(chatId, message);
        } catch (error) {
            console.error(error);
        }
    });
}
