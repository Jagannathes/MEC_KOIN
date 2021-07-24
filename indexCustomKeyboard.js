require('dotenv').config()

const { Telegraf, Markup } = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.start((ctx) => {ctx.reply('Welcome')
    bot.telegram.sendMessage(ctx.chat.id, 'start message', Markup.keyboard([
                                                                            ["start1"],
                                                                            ["start2"],
                                                                            ["start3"]
                                                                        ]).oneTime().resize().extra())
})


bot.help((ctx) => ctx.reply('Hey there!, How can we help u?', Markup.keyboard([
                                                                                ["hehe"],
                                                                                ["huhu"],
                                                                                ["get out"]
                                                                            ]).oneTime().resize().extra()
                                                                            ))
                                                                            
                                                                            
                                                                            bot.on('sticker', (ctx) => ctx.reply('👍'))
                                                                            bot.hears('hi', (ctx) => ctx.reply('Hey there'))
                                                                            bot.on('message', (ctx) => {
                                                                                // var payload = {"type":"poll","question":"Hello,do you like ice-cream?"};
                                                                                // ctx.reply(ctx.chat) 
    //reply_markup={keyboard:['hi']}
    const buttons =  [ ["Test"], ["Test2"]]
    ctx.reply('Custom buttons keyboard', Markup
    .keyboard([
        ['🔍 Search', '😎 Popular'], // Row1 with 2 buttons
        ['☸ Setting', '📞 Feedback'], // Row2 with 2 buttons
        ['📢 Ads', '⭐️ Rate us', '👥 Share'] // Row3 with 3 buttons
    ]).oneTime().resize().extra()
    )
    
})

bot.command('inline',(ctx)=>{
    const keyboard = {
        "inline_keyboard": [
            [
                {"text": "Cancel", callback_data: "cancel"},
                {"text": "Back", callback_data: "back"}
            ]
        ]
    };
    bot.telegram.sendMessage(ctx.message.from.id, "An Inline Keyboard", { reply_markup: keyboard});
});


bot.action("cancel", (ctx)=>{
    ctx.reply('you said cancel');
    ctx.deleteMessage();
});


bot.launch()
