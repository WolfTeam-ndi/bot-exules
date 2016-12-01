var restify = require('restify');
var builder = require('botbuilder');


//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

var pasTrouve = [
    "Je n'ai pas compris... :(",
    "Je n'ai pas pu comprendre votre demande... Pouvez-vous la reformuler ?",
    "Je n'ai pas saisir votre demande... Serait-il possible que vous la formulez d'une autre manière ?"
];

bot.dialog('/', new builder.IntentDialog()
    .matches(/(manger|loger)/i, function (session) {
        session.send("ça marche");
    })
    .onDefault(function (session) {
        session.send(pasTrouve[Math.floor(Math.random()*pasTrouve.length)]);
    })
);