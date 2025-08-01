import dotenv from 'dotenv'
dotenv.config();
import { Telegraf } from "telegraf";
import env from 'env-var'
import quotes from './quoteDb.cjs';
import {exec} from "child_process";
import chalk from 'chalk';
import fs from "fs";
const botToken = env.get('botToken').required().asString();
console.log(botToken)
const bot = new Telegraf(botToken);
let currentTxt;
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
    currentTxt = msg;
    await user.editMessageText(msg, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Next⏭️", callback_data: "Quotes" },{text:"Jokes",callback_data:"Joke"}],
                [{text:"Speek🎤",callback_data:"voice"}]
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
function waitForFile(path, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const check = () => {
            if (fs.existsSync(path) && fs.statSync(path).size > 0) {
                return resolve(true);
            }
            if (Date.now() - start > timeout) {
                return reject(new Error("File creation timed out"));
            }
            setTimeout(check, 100);
        };
        check();
    });
}

const handleVoice = async (user) => {
    const sanitizedTxt = currentTxt?.replace(/"/g, '\\"') ?? "";
    if (!sanitizedTxt) {
        user.reply("⚠️ No text provided.");
        return;
    }

    const outputPath = "Emily_audio.mp3";

    exec(`python src/python/Emily_voice.py "${sanitizedTxt}"`, async (err, stdout, stderr) => {
        if (err || stderr.includes("ERROR")) {
            console.error("Python Error:", stderr || err.message);
            user.reply("❌ Voice generation failed.");
            return;
        }

        try {
            await waitForFile(outputPath);
            const stream = fs.createReadStream(outputPath);
            await user.replyWithVoice({ source: stream });
            fs.unlinkSync(outputPath);
        } catch (error) {
            console.error("Error:", error.message);
            user.reply("❌ Voice file not ready.");
        }
    });
};
const handleJoke = (user)=>{
     exec('python src/python/joke.py',(err,stdout,stderr)=>{
        if (!err) {
            currentTxt=stdout.trim();
            bot.telegram.sendMessage(user.chat.id,stdout.trim(),{
                reply_markup:{
                    inline_keyboard:[
                        [{text:"Next⏭️",callback_data:"Joke"},{text:"Quotes",callback_data:"Quotes"}],
                        [{text:"Speek🎤",callback_data:"voice"}]
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
        case "voice":
            handleVoice(user);
        default:
            break;
    }
});

bot.launch()
    .then(()=> console.log(chalk.green.bold("✅Bot is now Online")))
    .catch(err=>{
        console.error("🚫BOT launch error =>",err.message || err)
});