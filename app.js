/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

require( 'dotenv' ).config( {silent: true} );

var express = require( 'express' );  // app server
var bodyParser = require( 'body-parser' );  // parser for post requests
var watson = require( 'watson-developer-cloud' );  // watson sdk
var http = require('http');

// The following requires are needed for logging purposes
var uuid = require( 'uuid' );
var vcapServices = require( 'vcap_services' );
var basicAuth = require( 'basic-auth-connect' );

var app = express();

// Bootstrap application settings
app.use( express.static( './public' ) ); // load UI from public folder
app.use( bodyParser.json() );

// Create the service wrapper
var conversation = watson.conversation( {
  url: 'https://gateway.watsonplatform.net/conversation/api',
  username: process.env.CONVERSATION_USERNAME || '<username>',
  password: process.env.CONVERSATION_PASSWORD || '<password>',
  version_date: '2017-02-03',
  version: 'v1'
} );

// Create service wrapper for Tone Analyzer
var tone_analyzer = watson.tone_analyzer({
  username: process.env.TONE_ANALYZER_USERNAME || '{username}',
  password: process.env.TONE_ANALYZER_PASSWORD || '{password}',
  version: 'v3',
  version_date: '2016-05-19'
});


/*
tone data: {"document_tone":{"tone_categories":[{"tones":[{"score":0.004075,"tone_id":"anger","tone_name":"Anger"},{"score":0.001487,"tone_id":"disgust","tone_name":"Disgust"},{"score":0.070839,"tone_id":"fear","tone_name":"Fear"},{"score":0.889328,"tone_id":"joy","tone_name":"Joy"},{"score":0.01741,"tone_id":"sadness","tone_name":"Sadness"}],"category_id":"emotion_tone","category_name":"Emotion Tone"},{"tones":[{"score":0,"tone_id":"analytical","tone_name":"Analytical"},{"score":0,"tone_id":"confident","tone_name":"Confident"},{"score":0,"tone_id":"tentative","tone_name":"Tentative"}],"category_id":"language_tone","category_name":"Language Tone"},{"tones":[{"score":0.138909,"tone_id":"openness_big5","tone_name":"Openness"},{"score":0.274024,"tone_id":"conscientiousness_big5","tone_name":"Conscientiousness"},{"score":0.547691,"tone_id":"extraversion_big5","tone_name":"Extraversion"},{"score":0.60039,"tone_id":"agreeableness_big5","tone_name":"Agreeableness"},{"score":0.231551,"tone_id":"emotional_range_big5","tone_name":"Emotional Range"}],"category_id":"social_tone","category_name":"Social Tone"}]}}
*/

// Endpoint to be call from the client side
app.post( '/api/message', function(req, res) {
  var workspace = process.env.WORKSPACE_ID || '<workspace-id>';
  if ( !workspace || workspace === '<workspace-id>' ) {
    return res.json( {
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' +
        '<a href="https://github.com/watson-developer-cloud/conversation-simple">README</a> documentation on how to set this variable. <br>' +
        'Once a workspace has been defined the intents may be imported from ' +
        '<a href="https://github.com/watson-developer-cloud/conversation-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
      }
    } );
  }
  var payload = {
    workspace_id: workspace,
    context: {},
    input: {}
  };
  if ( req.body ) {
    if ( req.body.input ) {
      payload.input = req.body.input;
    }
    if ( req.body.context ) {
      // The client must maintain context/state
      payload.context = req.body.context;
    }
  }

  //payload.context.tone = "joy";
  if (payload.context.checkTone) {
  // Send the input to the conversation service
    var reftext = payload.input.text;
    tone_analyzer.tone({text: reftext}, function (taerr, tadata) {
	var toneData = tadata.document_tone.tone_categories;
	var maxTone = 0.0;
	var mainTone = "none";
	for (var i=0;i<toneData.length; i++) {
	  if(toneData[i].category_id == "emotion_tone") {
	    var emotionToneData = toneData[i].tones;
	    for(var j=0; j < emotionToneData.length; j++) {
	      if(emotionToneData[j].score > maxTone) {
	        maxTone = emotionToneData[j].score;
	        mainTone = emotionToneData[j].tone_id;
	      }
	    }
	  }
	}
	payload.context.tone = mainTone;
        conversation.message(payload, function(err, data) {
           if (err) {
            return res.status(err.code || 500).json(err);
           }
            //updateResponse(res, data);
	   return res.json(data);
	});
    });
  } else {
        conversation.message(payload, function(err, data) {
           if (err) {
            return res.status(err.code || 500).json(err);
           }
           // updateResponse(res, data);
	   return res.json(data);
        });
  }
});

/*
// Weather API key (https://www.wunderground.com/weather/api/)
var weather_api_key = process.env.WEATHER_API_KEY || 'YOUR_WEATHER_API_KEY';
function updateResponse(res, data) {

  var weatherflag = checkWeather(data);
  if(weatherflag) {
   var path = null;
   if((data.context.appCity != null) && (data.context.appST != null)) {
     path = '/api/' + weather_api_key + '/forecast/q/' + data.context.appST + '/' + data.context.appCity + '.json';
   }
   if (path == null) {
    return res.json(data)
   }
   var options = {
     host: 'api.wunderground.com',
     path: path
   };
   http.get(options, function(resp) {
     var chunkText = '';
     resp.on('data', function(chunk) {
     chunkText += chunk.toString('utf8');
     });

     resp.on('end', function() {
	var chunkJSON = JSON.parse(chunkText);
	var forecast = chunkJSON.forecast.txt_forecast.forecastday[0].fcttext;
	data.output.text = 'The weather in ' + data.context.appCity + ', ' + data.context.appST + ' will be ' + forecast;
	return res.json(data);
     });
    }).on('error', function(e) {
       console.log('failed');
    });
   } else {
     return res.json(data);
   }
};

function checkWeather(data) {
  return data.intents && data.intents.length > 0 && data.intents[0].intent === 'weather'
     && (data.context != null) && (data.context.appCity != null) && (data.context.appST != null);
};
*/

module.exports = app;
