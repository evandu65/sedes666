require ('dotenv').config();

function updateRanking(){
    return console.log("Bonjour");
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
          console.log('Connection to WAMP router established');
          session.register(`${namespace}.add2`, function(args) {
            return args[0] + args[1];
          });
          session.register(`${namespace}.updateRanking`, () => updateRanking());
    
    
        };
    
        connection.open();
    
    };