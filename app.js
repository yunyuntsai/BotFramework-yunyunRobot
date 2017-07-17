var restify = require('restify');
var builder = require('botbuilder');
var http = require('http');
var url = require("url");

// Setup Restify Server
var server = restify.createServer();

server.use(function (req, res, next) {
serverUrl = "https://"+req.header('Host');
next();
});

server.listen(process.env.port || process.env.PORT || 4040, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    //appId: process.env.MICROSOFT_APP_ID,
    //appPassword: process.env.MICROSOFT_APP_PASSWORD
    appId:  "8f59ee05-7ecb-402c-b590-404da937aed3",
    appPassword: "wMSeAi0hqWO3z4BMs0ofdAG"
});



// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')

/*var bot = new builder.UniversalBot(connector, function (session) {
    session.send("You said: %s", session.message.text);
});*/
var bot = new builder.UniversalBot(connector);

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Create LUIS recognizer 
//var model = process.env.LUIS_MODEL_URL || "https://api.projectoxford.ai/luis/v1/application?id=ceb627e1-2d52-4626-9bbd-543a25983862&subscription-key=35820529a1be4e389462b5b4fd14ef90";
var model = process.env.LUIS_MODEL_URL || "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/ee5a73d8-8455-43a6-9b03-f92a32000e11?subscription-key=3d46c93feade4e799ec49fc7a2e75478&timezoneOffset=0&verbose=true&q=";

var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({
  recognizers: [recognizer]
});

bot.dialog('/', dialog);

dialog.onDefault(builder.DialogAction.send("Hi, 我是點餐機器人，\n請問今天要點什麼主餐?"));

/*bot.dialog('/', function (session, args) {
    session.send("Hi,我是點餐機器人");
    session.send("請問今天想要點什麼?");
});*/

dialog.matches('客人點餐', [

   function(session, args, next){
        console.log("here")
        console.log(session.message.text);
        //builder.Prompts.attachment(session,'請問今天想要點什麼?');
        
        var Food_entity = builder.EntityRecognizer.findEntity(args.entities, '餐點::主餐');
        var Drink_entity = builder.EntityRecognizer.findEntity(args.entities, '餐點::飲料');

        //session.sendTyping() // Loading indicator

        if(Food_entity!=null){
            var reply_str = "好的! 幫你點一份 "+ Food_entity.entity+"\n";
            session.send(reply_str);
            session.dialogData.Food = Food_entity.entity;
        }
         if(Drink_entity!=null){
            var reply_str = "好的! 幫你點一份 "+Drink_entity.entity+"\n";
            session.send(reply_str);
             session.dialogData.Drink = Drink_entity.entity;
        }
        builder.Prompts.text(session, "請問還需要什麼嗎? (yes/no)");
   },
    
/* function (session, args) {

        var Food_entity = builder.EntityRecognizer.findEntity(args.entities, '餐點::主餐');
        //var Drink_entity = builder.EntityRecognizer.findEntity(args.entities, '餐點::飲料');
        
        var reply_str = "好的! 幫你點一份 "+Food_entity.entity+"";
        session.send(reply_str);
        session.dialogData.Food =  Food_entity.entity;

        builder.Prompts.text(session, "請問需要什麼飲料嗎?");
     },
     function (session, args) { 

        session.dialogData.Drink = builder.EntityRecognizer.findEntity(args.entities, '餐點::飲料');
        var reply_str = "好的! 幫你點一杯 "+session.dialogData.Drink+"\n?";
        session.send(reply_str);    
        builder.Prompts.text(session, "請問還需要什麼嗎? (yes/no)");
     },*/
     function (session, results){
        if(results.response=="no"){
            session.send("點餐確認. \n你點的餐點有:<br/> %s <br/> %s ",session.dialogData.Food, session.dialogData.Drink);
            session.endDialog();
      }else{
        var reply_str = "好的! 請問你需要加點什麼?";
         session.send(reply_str);
        return results.response;
      }
    }  
    
]);