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

<<<<<<< HEAD
var nourriture=/(manger|nourriture|nourrir|faim)/i;
var loger=/(loger|logement|logements|a la rue|maison|appartement|foyer)/i;
var aide=/(besoin|aide|)/i;
=======
>>>>>>> ea8cd5622dceadf485d0dcfae2f5cee44c52ac70
var pasTrouve = [
    "Je n'ai pas compris... :(",
    "Je n'ai pas pu comprendre votre demande... Pouvez-vous la reformuler ?",
    "Je n'ai pas saisir votre demande... Serait-il possible que vous la formulez d'une autre manière ?"
];

<<<<<<< HEAD
/*bot.dialog('/NomDemande', [
    function (session) {
        builder.Prompts.text(session, 'Bonjour, quel est votre nom ?');
    },

    function (session, results) {
        session.endDialogWithResult(results);
    }
]);

bot.dialog('/', [
    function (session) {
        session.beginDialog('/NomDemande');
    },

    function (session, results) {
        session.send('Bonjour %s, que puis-je faire pour vous ?', results.response);
    }
]);

bot.dialog('/Reponse2', new builder.IntentDialog()
    .matches(nourriture, function (session) {
        session.send("Je vais vous fournir la liste des restos du coeur qui sont près de vous !");
    })
    .matches(loger, function(session){
        session.send("Je vais vous mettre à disposition une liste d'endroits où vous pouvez loger en fonction de votre position");
    })
    .onDefault(function (session) {
        session.send(pasTrouve);
    }));*/

bot.dialog('/', [
    function (session) {
        session.beginDialog('/Dialogue', session.userData.profile);
    },
    function (session, results) {
        session.userData.profile = results.response;
        session.send('Bonjour %(name)s ! %(demande)s ', session.userData.profile);
        session.userData=undefined;
    }
]);
bot.dialog('/Dialogue', [
    function (session, args, next) {
        session.dialogData.profile = args || {};
        if (!session.dialogData.profile.name) {
            builder.Prompts.text(session, "Bonjour, quel est votre nom ? ");
        } else {
            next();
        }
    },
    function (session, results, next) {
        if (results.response) {
            session.dialogData.profile.name = results.response;
        }
        if (!session.dialogData.profile.demande) {
            builder.Prompts.text(session, "En quoi puis-je vous aider ? ");
        } else {
            next();
        }
    },
    function (session, results) {
        if (results.response) {
        new builder.IntentDialog()
        .matches(nourriture, function (session) {
        session.dialogData.profile.demande="Je vais vous fournir la liste des restos du coeur qui sont près de vous";
        })
        .matches(loger, function(session){
        session.dialogData.profile.demande="Je vais vous mettre à disposition une liste d'endroits où vous pouvez loger en fonction de votre position";
        })
        .onDefault(function (session) {
        session.dialogData.profile.demande=pasTrouve;
        });
        }
        session.endDialogWithResult({ response: session.dialogData.profile });
    }
]);
=======
bot.dialog('/', new builder.IntentDialog()
    .matches(/(manger|loger)/i, function (session) {
        session.send("ça marche");
    })
    .onDefault(function (session) {
        session.send(pasTrouve[Math.floor(Math.random()*pasTrouve.length)]);
    })
);
>>>>>>> ea8cd5622dceadf485d0dcfae2f5cee44c52ac70
