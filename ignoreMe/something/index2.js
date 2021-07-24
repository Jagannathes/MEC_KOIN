require('dotenv').config();
const Web3 = require("web3");
const mec = require('./mecWeb3.js');
const database = require('./db.js');
const { Telegraf, Markup } = require('telegraf');
const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const session = require('telegraf/session');
const stage = new Stage()

const bot = new Telegraf(process.env.GET_TOKEN);
bot.use(session())
bot.use(stage.middleware())

const start = new Scene('start');
stage.register(start);


/*************************************/
//       FOLLOWS SAME ORDER
const getName = new Scene('getName')
stage.register(getName)
const getCollege = new Scene('getCollege');
stage.register(getCollege);
const getNumber = new Scene('getNumber');
stage.register(getNumber);
const attemptCreate = new Scene('attemptCreate');
stage.register(attemptCreate);
/*************************************/



/***************** UTILITIES ********************************/
const startMsg = "Hey there!, welcome to Crytpo Bot.\nLet\'s get started shall we?";

const startPhotoUrl = 'https://miro.medium.com/max/2066/1*MAsNORFL89roPfIFMBnA4A.jpeg';

const cancelButton = {
  "inline_keyboard": [
    [
      { "text": "Cancel", callback_data: "cancel" },
    ]
  ]
};
const cancelKeyboard = { reply_markup: cancelButton }

const phoneKeyboard = { "parse_mode": "Markdown",
                        "reply_markup": { "one_time_keyboard": true,
                    "keyboard": [[{
          text: "My phone number",
          request_contact: true
          
        }],[{
          text: "cancel",
          callback_data: "cancel"
        }]]
      }

    }  

const providerUrl = 'http://localhost:9545';
/*************************************************************/

const web3 = new Web3(providerUrl);

bot.start(async (ctx) => {
  console.log('In Start for: ' + userId);
  await ctx.replyWithPhoto(startPhotoUrl);
  await ctx.reply(startMsg); 
  await bot.telegram.sendMessage(ctx.chat.id,
    "Let's create an account for you shall we?",
    Markup.keyboard([ ["/createAccount"],
                      ["/quit"],  ]).oneTime().resize().extra()
  )
  
});

/******** CREATE ACCOUNT SCENARIOS ******************/

bot.command('createAccount', async (ctx) => {
  let user = await database.exist(ctx.message.from.id);
  if(user){
    ctx.reply("Sorry, you already have an account.");
    }
  else{
    console.log("Creating account for:" + ctx.message.from.id);
    ctx.session.userId = ctx.message.from.id;
    ctx.scene.enter('getName',ctx);
  }  
    
});

getName.enter( async (ctx)=>{
  await ctx.reply("Enter Your Name", cancelKeyboard);

  getName.on('text', async(ctx)=>{
    ctx.session.userName = ctx.message.text;
    ctx.scene.enter('getCollege',ctx);
  });
});

getCollege.enter( async (ctx)=>{
  await ctx.reply("Enter Your College", cancelKeyboard);

  getCollege.on('text',async (ctx)=>{
    ctx.session.college = ctx.message.text;
    ctx.scene.enter('getPhone');
  });    
});

getPhone.enter( async (ctx)=>{
  ctx.reply("Please share your phone number, so that we can contact you.",phoneKeyboard)
  getPhone.on('contact', (ctx)=>{
      ctx.session.phone = ctx.message.contact.phone_number;
      ctx.scene.enter('attemptCreate');
  });
});

attemptCreate.enter( async(ctx)=>{
  await ctx.reply('We are creating an account for you, please wait.',{reply_markup: { remove_keyboard: true }} );

  const account =  web3.eth.accounts.create();
  ctx.session.address =   account.address;  
  ctx.session.privateKey = account.privateKey;

  database.createAccount(ctx.session.userId,ctx.session.userName,ctx.session.phoneNumber,ctx.session.address,ctx.session.privateKey);

  ctx.reply("Your account is created\n Use the /help command to see all bot commands");
  ctx.scene.leave('attemptCreate');
  
});

/********************************************************************/

bot.action('cancel', async (ctx)=>{
    ctx.session = {};
    await ctx.deleteMessage();
    await ctx.reply("Alright, cancelled.")
    ctx.scene.leave();
});

bot.on('text',(ctx)=>{
  await ctx.reply("You are outside all scenes!");
  await ctx.reply("Program me.");
});

bot.launch();