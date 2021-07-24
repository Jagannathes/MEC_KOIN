require('dotenv').config();
const fs = require('fs');
const Web3 = require("web3");
const Contract = require('web3-eth-contract');
const mec = require('./mecWeb3.js');
const database = require('./db.js');

const { Telegraf, Markup } = require('telegraf');
const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const session = require('telegraf/session');
const { leave } = Stage;
const stage = new Stage()
/*****************************************************************************/
const startMsg = "Hey there!, welcome to Crytpo Bot.\nLet\'s get started shall we?";
const dataPath = 'DATA/userData.json';
const providerUrl = 'http://localhost:9545';
const helpMsg = "You can control me by using the following commands:\n /createaccount - To create a new mec_coin account\n/getbalance -  To know your account balance \n/transfer -  to transfer mec_coin to another user\n /help - To get all the bot commands";
/*****************************************************************************/


const bot = new Telegraf(process.env.GET_TOKEN);
const web3 = new Web3(providerUrl);  //ee sambhavam koodi matte file il kettano?
bot.use(session())
bot.use(stage.middleware())

//setting up scenes
const getName = new Scene('getName')
stage.register(getName)
const start = new Scene('start');
stage.register(start);
const getNumber = new Scene('getNumber');
stage.register(getNumber);
const getCollege = new Scene('getCollege');
stage.register(getCollege);



// cancel button for  getName scene
const cancelButton = {
  "inline_keyboard": [
    [
      { "text": "Cancel", callback_data: "cancel" },
    ]
  ]
};
const cancelKeyboard = { reply_markup: cancelButton }


getName.action("cancel", async (ctx) => {
  console.log("Cancelling for chat with id:" + ctx.chat.id);
  ctx.deleteMessage();
  ctx.reply('Alright cancelled!');
  await ctx.scene.leave('getName');
  ctx.scene.enter('start');

 });


bot.start(async (ctx) => {
  const userId = ctx.message.from.id;
  console.log('Talking to ' + userId);
  await ctx.replyWithPhoto('https://miro.medium.com/max/2066/1*MAsNORFL89roPfIFMBnA4A.jpeg');
  await ctx.reply(startMsg);
  await bot.telegram.sendMessage(ctx.chat.id,
    "Let's create an account for you shall we?",
    Markup.keyboard([
      ["/createaccount Yep! Lessgooo"],
      ["/quit Nope, go Back"],
    ]).oneTime().resize().extra()
  )
  
});





bot.command('getbalance', async ctx =>{
try{  
  let user =await database.exist(ctx.message.from.id); 
  if(user){
    let _address = user.address;
    console.log("Address for balance:"+_address); 
    
    let  _balance = await mec.checkBalance(_address);
    ctx.reply(_balance);
  }
  else{
    ctx.reply("You need to create an Account first!\n use /createaccount to create an account.")
  }
}
catch(err){
  console.log(err)
  ctx.reply("sorry there was some error");
}
})



bot.command('transfer',async (ctx) =>{
  //transfer(fromAddress,privateKeyFrom,toAddress,tokenCount)
   let user =await database.exist(ctx.message.from.id); 
    if(user){
    let _address = user.address;
    let 
    console.log("Address for balance:"+_address); 
    
    let  _balance = await mec.checkBalance(_address);
    ctx.reply(_balance);
  }
  else{
    ctx.reply("You need to create an Account first!\n use /createaccount to create an account.")
  }
   let a = await mec.transfer(
   ctx.reply("sorry you cannot use feature  right now")
  })

 
bot.help(ctx => {
  const userId = ctx.message.from.id;
  ctx.reply(helpMsg);
})




getName.command('quit', (ctx, next) => {
  ctx.reply("Alright! Use the /createaccount command if you reconsider");
  ctx.scene.leave('getName');
  ctx.scene.enter('start');
})





bot.command('createaccount', async (ctx, next) => {
  let query = await database.exist(ctx.session.userId);
      console.log(ctx.session.userId);
      console.log(query);// changed what?

  if(query != "hi"){
   ctx.reply("Sorry, you already have an account.")
  }
  else{
  console.log("Creating account for:" + ctx.message.from.id);
  let userObject = {};
  ctx.reply("Can we get your Name?", cancelKeyboard);
   ctx.scene.enter('getName');
  }}) 


  getName.on('text', async (ctx) => {
   
    ctx.session= {};
    
    
    ctx.session.userName = ctx.message.text;
    userObject = {};
    userObject.userName = ctx.session.userName;  
   
    
    await ctx.reply('Alright ' + ctx.session.userName + '!');
    ctx.scene.leave('getName')
    ctx.scene.enter('getNumber',ctx.session)  //changed
    let option = {
      "parse_mode": "Markdown",
      "reply_markup": {
        "one_time_keyboard": true,
        "keyboard": [[{
          text: "My phone number",
          request_contact: true
          
        }],[{
          text: "cancel",
          callback_data: "cancel"
        }]]
      }

    };
    
    await ctx.reply("How can we contact you?", option);})


    getNumber.on('text',async (ctx) =>{
      ctx.reply('Alright! use /createAccount command if you reconsider' );
      ctx.scene.leave('getNumber')
      
    })



   
   
   
    getNumber.on("contact", async (ctx) => {
      
    await ctx.reply('We are creating an account for you, please wait.',{reply_markup: { remove_keyboard: true }} );
      ctx.session.phoneNumber = ctx.message.contact.phone_number;
      ctx.session.userId = ctx.message.from.id;
      const account =  web3.eth.accounts.create();
      ctx.session.address =   account.address;  
      ctx.session.privateKey = account.privateKey;

          database.createAccount(ctx.session.userId,ctx.session.userName,ctx.session.phoneNumber,ctx.session.address,ctx.session.privateKey);
          ctx.reply("Your account is created\n Use the /help command to see all bot commands");
          ctx.scene.leave('getNumber');
  });
  //yeey everything is working now. Or I hope so.

bot.launch();