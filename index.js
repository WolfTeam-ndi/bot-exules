var restify = require('restify');
var builder = require('botbuilder');

var data = require('./db.json');


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


var nourriture=/(manger|nourriture|nourrir|faim)/i;
var loger=/(loger|logement|logements|a la rue|maison|appartement|foyer)/i;
var aide=/(besoin|aide|)/i;


var pasTrouve = [
    "je n'ai pas compris... :(",
    "je n'ai pas pu comprendre votre demande... Pouvez-vous la reformuler ?",
    "je n'ai pas saisir votre demande... Serait-il possible que vous la formulez d'une autre manière ?"
];


bot.dialog('/', [
    function (session) {
        session.beginDialog('/Dialogue', session.userData.profile);
    },
    function (session, results) {
        session.userData.profile = results.response;
        if(session.userData.profile.demande) {
            session.send("%(name)s, voici ce que j'ai trouvé pour vous : %(demande)s", session.userData.profile);
        } else {
            session.send("%(name)s" + pasTrouve[Math.floor(Math.random()*pasTrouve.length)], session.userData.profile);
            session.beginDialog('/Dialogue', session.userData.profile);
        }
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
        if(!session.dialogData.profile.place) {
            builder.Prompts.text(session, "Dans quelle ville êtes-vous ?");
        } else {
            next();
        }
    },
    function (session, results, next) {
        if (results.response) {
            session.dialogData.profile.place = results.response;
        }
        builder.Prompts.text(session, "En quoi puis-je vous aider ? ");
    },
    function (session, results) {
        if (results.response) {
            session.dialogData.profile.demande = results.response;

            // Si il souhaite reset les infos du bot (le nom enregistré)
            if(results.response == '/reset') {
                session.userData.profile=undefined;
                session.beginDialog('/Dialogue', session.userData.profile);
            }

            // Si il souhaite manger
            if(results.response.match(nourriture)) {
                var resto = data[Math.floor(Math.random()*data.length)];
                session.dialogData.profile.demande = "\n\n Je peux vous conseiller un Resto du Coeur qui pourra vous aider !  ";
                session.dialogData.profile.demande += "\n\n Rendez-vous au " + resto.nom;
                session.dialogData.profile.demande += "\n\n      " + resto.adresse;
            }

            // S'il souhaite se loger
            else if(results.response.match(loger)) {
                session.dialogData.profile.demande = "Je vous conseille d'appeler le 115, ils pourront vous aider rapidement !";
            }

            // Si on a pas compris..
            else {
                session.dialogData.profile.demande = false;
            }
        }
        
        session.endDialogWithResult({ response: session.dialogData.profile });
    }
]);
