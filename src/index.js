import dotenv from 'dotenv'
dotenv.config();
import { Telegraf } from "telegraf";
import env from 'env-var'
import quotes from './quoteDb.cjs';
import {exec} from "child_process";
import chalk from 'chalk';
import { stderr } from 'process';
import { text } from 'stream/consumers';
const botToken = env.get('botToken').required().asString();
console.log(botToken)
const bot = new Telegraf(botToken);

bot.start((user)=>{
    bot.telegram.sendMessage(user.chat.id, `Hello ${user.chat.first_name}😊\n Hope you doing well✅`,{
        reply_markup: {
            inline_keyboard:[
                [{text:"Quotes (●'◡'●) ",callback_data:"Quotes"},{text:"Joke's🧑‍💻", callback_data:"Joke"}],
            ],
        },
    });
});
const handleQuotes = async (user) => {
    let random = quotes[Math.floor(Math.random() * quotes.length)];
    let msg = `"${random.quote}"\n\n- ${random.name}`
    await user.editMessageText(msg, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Next⏭️", callback_data: "Quotes" },{text:"Jokes",callback_data:"Joke"}],
                [{text:"Clear chat🗑️",callback_data:"dlt"}]
            ]
        }
    });
    // await bot.telegram.sendMessage(
    //     user.chat.id,
    //     `"${random.quote}"\n\n- ${random.name}`,
    //     {
    //         reply_markup: {
    //             inline_keyboard: [
    //                 [{ text: "Next⏭️", callback_data: "Quotes" }]
    //             ]
    //         }
    //     }
    // );
};
const handleVoice = (user)=>{
   
};
const handleJoke = (user)=>{
    
     exec('python src/python/joke.py',(err,stdout,stderr)=>{
        if (!err) {
            bot.telegram.sendMessage(user.chat.id,stdout.trim(),{
                reply_markup:{
                    inline_keyboard:[
                        [{text:"Next⏭️",callback_data:"Joke"},{text:"Quotes",callback_data:"Quotes"}],
                        [{text:"Clear chat🗑️",callback_data:"dlt"}]
                   ]
                }
            });
        }
    })
}

bot.on("callback_query", async (user) => {
    const choice = user.update.callback_query.data;

    // 👇 Acknowledge the callback or the next one won't work
    await user.answerCbQuery(user.callbackQuery.id);

    switch (choice) {
        case "Quotes":
            handleQuotes(user);
            break;
        case "Joke":
            handleJoke(user);
            break;
        default:
            break;
    }
});

bot.launch()
    .then(()=> console.log(chalk.green.bold("✅Bot is now Online")))
    .catch(err=>{
        console.error("🚫BOT launch error =>",err.message || err)
});