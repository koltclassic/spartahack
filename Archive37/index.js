/**
 * Created by abigaelonchiri on 2/27/16.
 */
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */
 
var https = require('https');
var queryString = require('querystring');
var Firebase = require('firebase');

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
         if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.[unique-value-here]") {
         context.fail("Invalid Application ID");
         }
         */

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};




/*function sendItem(intent, session, callback) {
    
    console.log("in sendItem");
    var itemName;
    var messageString;
    var cardTitle = intent.name;
    var itemSlot = intent.slots.Item;
    
    sessionAttributes = createItemsAttributes(itemSlot);
    
    console.log(itemSlot.value);
    
    if (sessionAttributes) {
       
        itemName = itemSlot.value;
    }
    
    
    // The item to send
    var message = {
        ItemName: itemName, 
    };
    
    console.log(itemName);
     console.log(message);
    
    var itemString = queryString.stringify(message);
    
    console.log(itemString)
    
    // Options and headers for the HTTP request   
    var options = {
        host: '35.14.148.40',
        port: 1337,
        path: '/takepictures',
        method: 'POST',
        headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(itemString),
                 }
    };
    
    // Setup the HTTP request
    var req = https.request(options, function (res) {

        res.setEncoding('utf-8');
        
        console.log(data);
              
        // Collect response data as it comes back.
        var responseString = '';
        res.on('data', function (data) {
            responseString += data;
        });
        
        // Log the responce received from Twilio.
        // Or could use JSON.parse(responseString) here to get at individual properties.
        res.on('end', function () {
            console.log('Item sent was: ' + responseString);
            //completedCallback('Item name was sent successfully');
            var repromptText = null;
            var shouldEndSession = false;
            var speechOutput = "Item name was sent sucessfully " ; // change to "I know know you are looking for response string"
               
            
        callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
            
            
        });
    });
     
    
    // Handler for HTTP request errors.
    req.on('error', function (e) {
        console.error('HTTP error: ' + e.message);
        
        
        var repromptText = null;
        var shouldEndSession = false;
        var speechOutput = "Item name was not sent sucessfully " ;
        
        callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
        //completedCallback('Item name completed with error(s).');
    });
    
    
    // Send the HTTP request to the url
    // Log the message we are sending 
    console.log('Item name sent: ' + messageString);
    
    if (messageString) {
        req.write(messageString);
    }
   
    
    req.end();
  
}*/


function getItem(intent, session, callback) {
    
    console.log("in getItem");
    var messageString;
    var cardTitle = intent.name;
    var itemSlot = intent.slots.Item;
    var itemName;
    var answer = '';
    
    
    sessionAttributes = createItemsAttributes(itemSlot);
    
    console.log(itemSlot.value);
    
    if (sessionAttributes) {
       
        itemName = itemSlot.value;
    }
    
    var myFirebaseRef = new Firebase("https://radiant-inferno-3957.firebaseio.com/");
    myFirebaseRef.child("web/data/name").once("value")		
  		.then(function (snapshot) {
  			console.log("I AM HERE")
  			return snapshot.val()
  		})  		
  		.then(function (cameras) {
  			console.log("Got cameras", cameras)
  			// use cameras.BackCam and cameras.FrontCam
  			answer = actualAnswer(cameras.BackCam , cameras.FrontCam, itemSlot.value);
  		       
  			var shouldEndSession = false;
  		   	console.log("answer", answer);
  		   
  		   	console.log(answer);
    
            if (answer) {
            	speechOutput = "Found it! Your " + itemName + " is "  + answer ;
            	repromptText = " ";
            	shouldEndSession = true;
            }
            else if (answer == ""){
            	speechOutput = "Sorry I couldnt find your " + itemName + " Goodbye" ;
            	repromptText = " ";
            	shouldEndSession = true;
            }
            else {
            	speechOutput = "I am still trying to remember where you left your" + itemName ;
            	repromptText = " ";
            	shouldEndSession = false; 
            }
            
            console.log(speechOutput)
                        
        	callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));	
  		})
  		.catch(function (err) {
  			console.log("ERRRRROR", err);
  		});
   
  
}

function actualAnswer(front , back, item){

 var back = back ;
 var front = front;

    if (item == 'phone'){
      
          item = 'telephone';
    }
    if (item == 'laptop'){
      
          item = 'laptop';
    }
    if (item == 'computer'){
      
          item = 'laptop';
    }
    
    var answer = "";

   
    for( var k=0; k<back.length; k++){
          if (item == back[k]){   
              
             answer = "on the left table" ;
           }
    }

    for( var m=0; m<front.length; m++){
          if (item == front[m]){
                 
             answer = "on the right table" ;
           }     
    }
    
    console.log(answer) ;
    return answer ;
 
} 


/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;
        
    console.log("I am here");
    var myFirebaseRef = new Firebase("https://radiant-inferno-3957.firebaseio.com/");
    
    
    myFirebaseRef.child("web/data/check").set({
  		signal: "takepictures!"
  	}, function () {
  		console.log("answer good");
  		console.log("intent", intentName)
  		
  		    // Dispatch to your skill's intent handlers
    if ("MyColorIsIntent" === intentName) {
        
       // sendItem(intent, session, function callback(sessionAttributes, speechletResponse)
        //{ context.succeed(buildResponse(sessionAttributes, speechletResponse)); });
        
       getItem(intent, session, callback);
        
    } else if ("WhatsMyColorIntent" === intentName) {
       // getColorFromSession(intent, session, callback);
        console.log("going into getitem")
        
       getItem(intent, session, function callback(sessionAttributes, speechletResponse)
       { context.succeed(buildResponse(sessionAttributes, speechletResponse)); });
        
        
    } else if ("AMAZON.HelpIntent" === intentName) {
        getWelcomeResponse(callback);
    } else {
        throw "Invalid intent";
    }
  	});
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "What are you looking for? ";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Please tell me what you are looking for";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Sets the color in the session and prepares the speech to reply to the user.
 */
function setColorInSession(intent, session, callback) {
   // camera1 = "laptop";
   // camera2 = "";

    var cardTitle = intent.name;
    var itemSlot = intent.slots.Item;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    if (itemSlot) {
        var item = itemSlot.value;
        sessionAttributes = createItemsAttributes(item );
        speechOutput = "I now know your looking for your " + item  ;
        repromptText = "Please tell me what you are looking for by saying remember, where I left my phone";
    } else {
        speechOutput = "I'm not sure what you are looking for. Please try again";
        repromptText = "I'm not sure what you are looking for. You can tell me what you are looking for by saying, s" +
            "Remember where I left my phone";
    
    }

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function createItemsAttributes(item) {
    return {
        item: item 
    };
}

function getColorFromSession(intent, session, callback) {
    var item;
    
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";
    var answer = "behind your chair"
    //var answer = ""

    if (session.attributes) {

        item = session.attributes.item;
        
    }

    if (item) {
        if (answer){

            speechOutput = "Found it ! Your " + item + " is " + answer + " .";
            shouldEndSession = true;
        }
        else {

            speechOutput = "I am not sure where your "+ item + "is. Sorry but I gotta go now.";
            shouldEndSession = true;
        }

    } else {

        speechOutput = "I'm not sure what you are looking for";
        
    }

    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.
    callback(sessionAttributes,
        buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}