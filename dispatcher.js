try {
  require('dotenv').config();
} catch (err) {
  console.log('No .env file loaded');
}

const namespace = process.env.NAMESPACE || 'com.sedes';
const Bench = require('./models/bench');




let currentSession;



getRanking = 

exports.publishRanking = function(params){
  if (currentSession) {
  currentSession.publish(`${namespace}.updateRanking`, [], params);
  }
  };

exports.createBackendDispatcher = function() {

    // COMMUNICATIONS
      // ==============
      /**¨
      * Get namespace
      */
      
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
        
          session.register(`${namespace}.updateRanking`, function(arg,params){
            return params;
          })
          
    
    
        };
    
        connection.open();
    
    };