require ('dotenv').config();

let currentSession;

function updateRanking(){

    return console.log("Classement mis à jour");
}

exports.publishRanking = function(){

    connection.onopen = function(session) {
        session.subscribe(`${namespace}.publishRanking`,updateRanking())


    };

    connection.open();
    
}

exports.createBackendDispatcher = function() {

    // COMMUNICATIONS
      // ==============
      /**¨
      * Get namespace
      */
      const namespace = process.env.NAMESPACE || 'com.sedes';
      const secret = process.env.SECRET || '';
    
      // backend's communications with Web Application Messaging Protocol (WAMP)
      const autobahn = require('autobahn');

      const connection = new autobahn.Connection({
        url: 'wss://wamp.archidep.media/ws',
        realm: 'sedes',
        authid: 'sedes',
        authmethods: [ 'ticket' ],
        onchallenge: function(){
            return secret;
        }
      });
    
        connection.onopen = function(session) {
            currentSession = session;
          console.log('Connection to WAMP router established');
          
          session.register(`${namespace}.updateRanking`, () => updateRanking());
    
    
        };
    
        connection.open();
    
    };