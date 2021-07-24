require('dotenv').config();
const Web3 = require("web3");
const mec = require('./WEB3/mecWeb3.js');
const database = require('./db.js');
const { Telegraf, Markup } = require('telegraf');
const Stage = require('telegraf/stage');
const Scene = require('telegraf/scenes/base');
const session = require('telegraf/session');
const stage = new Stage()
const eth = require('./WEB3/etherTransfer.js');
const bot = new Telegraf(process.env.GET_TOKEN);
bot.use(session())
bot.use(stage.middleware())
var _tokens = 50;
var _ethers = 0.1; 





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

const providerUrl = process.env.providerUrl;

const helpMsg = "You can control me by using the following commands: \n/createaccount - To create a new mec_coin account\n/getbalance -  To know your account balance \n/transfer -  to transfer mec_coin to another user\n/userid  - Get your User Id\n/help - To get all the bot commands";
/*************************************************************/

const web3 = new Web3(providerUrl);

bot.start(async (ctx) => {
  console.log('In Start for: ' + ctx.message.from.id);
  await ctx.replyWithPhoto(startPhotoUrl);
  await ctx.reply(startMsg); 
  await bot.telegram.sendMessage(ctx.chat.id,
    "Let's create an account for you shall we?",
    Markup.keyboard([ ["/createaccount"],
                      ["/quit"],  ]).oneTime().resize().extra()
  )
  
});

/******** CREATE ACCOUNT SCENARIOS ******************/

/*************************************/
//       FOLLOWS SAME ORDER
const getName = new Scene('getName')
stage.register(getName)
const getCollege = new Scene('getCollege');
stage.register(getCollege);
const getPhone = new Scene('getPhone');
stage.register(getPhone);
const attemptCreate = new Scene('attemptCreate');
stage.register(attemptCreate);
const options = new Scene('options');
stage.register(options);
const getBalance = new Scene('getBalance')
stage.register(getBalance)
const transfer = new Scene('transfer')
stage.register(transfer)

/*************************************/

bot.command('createaccount', async (ctx) => {
  let user = await database.exist(ctx.message.from.id);
  if(user){
    ctx.reply("Sorry, you already have an account.");
    ctx.scene.enter('options');
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
  const result = database.createAccount(ctx.session.userId,ctx.session.userName,ctx.session.phone,ctx.session.address,ctx.session.privateKey,ctx.session.college );
  if(result){
    await ctx.reply("Your account is created\n ")
    await ctx.reply("Use the /help command to see all bot commands");
    let eth_transfer = await eth.transfer(ctx.session.address,_ethers)

    if(eth_transfer) { 
      await ctx.reply("Ether transfer failed") ////////////
    }
    let token_transfer = await mec.transfer(process.env.KoinAccount,process.env.KoinAccountPrivate,ctx.session.address, _tokens)
    if(token_transfer){
      console.log("\n transaction was successful, user has "+ _tokens + "tokens in his account\n the transaction hash is: "+ token_transfer);
      await ctx.reply("Yay, you recieved " + _tokens + "Tokens.");
      await ctx.reply("You can use the /transfer command to transfer tokens.")
      }
    else {
      console.log("token transfer failed")
      await ctx.reply("There is some error we cannot transfer tokens now")
    }
  }
  else{
   await ctx.reply("Account creation failed.\nPlease Try Again Later.");
  }
  
  //GOTTA DO ERROR handling.
  
  ctx.scene.leave('attemptCreate');
  ctx.scene.enter('options')
});

/********************************************************************/

bot.action('cancel', async (ctx)=>{
    ctx.session = {};  
    try{
      await ctx.deleteMessage();
    }
    catch(err){
      console.log(err);
    }
    await ctx.reply("Alright, cancelled.");
    ctx.scene.leave();
    if(database.exist(ctx.chat.id))ctx.scene.enter('options');
});

// getbalance command
bot.command('getbalance', async ctx =>{
  ctx.scene.enter("getBalance")
})
getBalance.enter(async ctx=>{
   try{  
    let user =await database.exist(ctx.chat.id); 
    if(user){
      let _address = user.address;
      console.log("Address for balance:"+_address); 
      
      let  _balance = await mec.checkBalance(_address);
      if(_balance){
        await ctx.reply("Your balance: "+_balance);
      }
      else{
       await ctx.reply("Sorry,there was an error please try again later");
      }
    }
    else{
      await ctx.reply("You need to create an Account first!\n use /createaccount to create an account.")
    }
  }
  catch(err){
    console.log(err)
    await ctx.reply("Sorry,there was an error please try again later");
  }
  ctx.scene.leave('getBalance')
  ctx.scene.enter('options')
})

bot.command('help',(ctx)=>{
  ctx.reply(helpMsg);
});

bot.command('hi',async(ctx)=>{
 ctx.replyWithHTML("hello");
});



 //*************Transfer command****************************************
 //INCOMPLETE
const getRecId = new Scene('getRecId')
stage.register(getRecId)
const token = new Scene('token')
stage.register(token)

bot.command('transfer',async (ctx) =>{
  ctx.scene.enter('getRecId')
})

getRecId.enter(async (ctx)=>{
  ctx.reply("Please share the phone number(strt) of the person you want to transfer tokens to",cancelKeyboard);

  getRecId.on('text', async ctx =>{
    //validation to check if person exists in our database
    ctx.session.recId = ctx.message.text;
    ctx.session.recId = ctx.session.recId.replace(/[+ ]/g,'');
    if(ctx.session.recId.length == 10)ctx.session.recId ="91" + ctx.session.recId;
    let user = await database.existNumber(ctx.session.recId);
    if(user){
     await  ctx.reply("You are sending tokens to: " + user.name);
      ctx.scene.leave('getRecId')
      ctx.scene.enter('token')
    }
    else{
      ctx.reply("The userId is invalid.")
      ctx.scene.leave('getRecId')
      ctx.scene.enter('options')
    }

  })
})

token.enter(async (ctx) =>{
  await ctx.reply("How many tokens do you need to transfer",cancelKeyboard);

  token.on('text', async ctx=>{
    ctx.session.token = Number(ctx.message.text);
    if(Number.isInteger(ctx.session.token) && (ctx.session.token > 0)){

    //checking if user has sufficient token_balance to send token
    let user =await database.exist(ctx.message.from.id);   
    if(user){
      let _address = user.address;    
      let  _balance = await mec.checkBalance(_address);
      if(_balance){
        if(_balance <= 0){
          ctx.reply("Transfer amount has to be greater than zero.");
        }
        else if(_balance >= ctx.session.token){
          await ctx.reply("We are transferring your coins. Please wait....");
          let _privateKey = user.privateKey
          console.log("Address for balance:"+_address); 
           
          let  eth_balance = await eth.getBalance(_address);
          if(eth_balance < 0.0005){
              await eth.transfer(_address,_ethers)
          }
          let receiver = await database.existNumber(ctx.session.recId);
          
          let transferHash = await mec.transfer(_address,_privateKey,receiver.address,ctx.session.token);
          if(transferHash){ 
            await ctx.reply("Transaction was successful \n ");
           await ctx.telegram.sendMessage(receiver.id,
      "You recieved "+ctx.session.token + " tokens from " + user.name);
     }
          else ctx.reply("Transaction failed, please try again later")
          ctx.scene.leave('token')
          ctx.scene.enter('options');
         }
        else{
          await ctx.reply("You don't have enough balance to send token!");
          await ctx.reply("Your balance: " + _balance);
        }
        ctx.scene.leave('token');
        
      }
      else{
        ctx.reply("Sorry,there was an error please try again later");
        ctx.scene.leave('token');
        ctx.scene.enter('options');
      }
    }
    else{
      ctx.reply("You need to create an Account first!\n use /createaccount to create an account.")
      ctx.scene.leave('token');
      ctx.scene.enter('options');
    }
    }
    else{
      await ctx.reply(" Sorry, you can cannot transfer tokens with decimal place, please give a non zero integer value ")
      ctx.scene.leave('token')
      ctx.scene.enter('token')


    }
  })
})
  




   //*************************************************************************** **

bot.on('text',async (ctx)=>{
ctx.scene.enter('options')
});

inline_options= {reply_markup :{ "resize_keyboard": true,"inline_keyboard": [
    
    [
      {"text":"Transfer", callback_data : "transfer"}]
    ,
    
   [   {"text":"Balance", callback_data : "balance" }
    ]
    , [
      {"text":"help", callback_data : "help"}]
    
    

  ]}}

 bot.action('transfer', async (ctx)=>{
 //await ctx.deleteMessage();  
 ctx.scene.enter('getRecId')
 })
 bot.action('balance', async (ctx)=>{
   //await ctx.deleteMessage();
 ctx.scene.enter('getBalance')
 })
  bot.action('help', async (ctx)=>{
   await ctx.deleteMessage();
    ctx.reply(helpMsg);
    ctx.scene.enter('options');
 })

options.enter(async ctx=>{
await ctx.reply("How can I help you?",inline_options);

})


bot.launch();


/***********************What was added or changed */
// added /userid command for someone to get their own userid.
// renamed getaddress scene to getRecId  which stands for get Reciever Id
// ctx.session.add  to  ctx.session.recId

//Todo
// complete will transfer part. :)