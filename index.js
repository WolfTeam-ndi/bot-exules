var restify = require('restify');
var builder = require('botbuilder');
var nominatim = require('nominatim-client');

// test


var query = {
    q: 'Strasbourg'
};

nominatim.search(query, function(err, data) {
    if (err) {
        throw err;
    }
    
    //console.log(data);
});


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


bot.dialog('/', [
    function (session) {
        session.beginDialog('/Dialogue', session.userData.profile);
    },
    function (session, results) {
        session.userData.profile = results.response;
        if(session.userData.profile.demande) {
            session.send("%(name)s, %(demande)s", session.userData.profile);
        } else {
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
            var query = {
                q: results.response
            };

            nominatim.search(query, function(err, data) {
                if(!err) {

                    // La ville existe, on peut passer à la suite
                    if(data.length > 0) {
                        builder.Prompts.text(session, "En quoi puis-je vous aider ? ");
                    }
                    
                    // La ville n'existe pas
                    else {
                        session.beginDialog('/Dialogue', session.userData.profile);
                    }
                    
                }

            });
            session.dialogData.profile.place = results.response;
        } else {
            builder.Prompts.text(session, "En quoi puis-je vous aider ? ");
        }
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
                session.dialogData.profile.demande = "\n\n je peux vous conseiller un Resto du Coeur qui pourra vous aider !  ";
                session.dialogData.profile.demande += "\n\n Rendez-vous au " + resto.nom;
                session.dialogData.profile.demande += "\n\n      " + resto.adresse;
            }

            // S'il souhaite se loger
            else if(results.response.match(loger)) {
                session.dialogData.profile.demande = "\n\n je vous conseille d'appeler le 115, ils pourront vous aider rapidement !";
            }

            // Si on a pas compris..
            else {
                session.dialogData.profile.demande = " je n'ai pas pu saisir votre demande... Serait-il possible que vous la formulez d'une autre manière ?";
            }
        }
        
        session.endDialogWithResult({ response: session.dialogData.profile });
    }
]);
