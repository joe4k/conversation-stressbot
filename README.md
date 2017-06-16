# Stress Bot powered by Conversation and Tone Analyzer

This application demonstrates how to integrate [Tone Analyzer](https://www.ibm.com/watson/developercloud/tone-analyzer.html) (TA) service with [Watson Conversation](https://www.ibm.com/watson/developercloud/conversation.html) service to build an empathatic bot based on user tone.
This application is an extension of the [Conversation Simple](https://github.com/watson-developer-cloud/conversation-simple) application where it adds integration to another Watson service, namely Tone Analyzer.

For more information about Conversation, see the [detailed documentation](https://www.ibm.com/watson/developercloud/doc/conversation/index.html).

For more information about Tone Analyzer (TA), see the [detailed documentation](https://www.ibm.com/watson/developercloud/doc/tone-analyzer/index.html).

<b>To explore this application, you need to have a [Bluemix](https://bluemix.net) account to provision the Watson services.</b>

## How the app works
The app interface is designed and trained for chatting with an empathetic bot. The chat interface is on the left, and the JSON that the JavaScript code receives from the server is on the right. Your questions and commands are run against a small set of sample data trained with intents like these:

    telljoke
    games
    playmusic

These intents help the system to understand variations of questions and commands that you might submit.

Example commands that can be executed by the Conversation service are:
  
    tell me a joke
    I'd like to hear about games
    can you play some music

# Getting Started

## Before you begin

1. Ensure that you have a [Bluemix account](https://console.ng.bluemix.net/registration/). While you can do part of this deployment locally, you must still use Bluemix to provision Watson services.

2. Download and install [Cloud Foundry CLI](https://github.com/cloudfoundry/cli#downloads)

3. Download and install [Node.js](http://nodejs.org/) and [npm](https://www.npmjs.com/).

## Running locally
Open a terminal on your machine and execute the following commands:
```sh
1.  mkdir convapp
2.  cd convapp
3.  git clone https://github.com/joe4k/conversation-stressbot.git
4.  cd conversation-stressbot
5.  npm Install  ==> installs node packages defined in package.json
6.  cp .env.example .env  ==> we define service credentials in .env file
7.  edit .env file and copy/paste the credentials for Tone Analyzer and Conversation (you will create these next).
```

To create Tone Analyzer (TA) and Conversation service credentials, on your terminal window, execute the following:
```
1.  cf login   ==>  connects you to your bluemix account
  - API endpoint: https://api.ng.bluemix.net
  - username: your_bluemix_username
  - password:   your_bluemix_password

2.  cf create-service conversation free convapp-conv-service
 ==> create conversation using free plan and call it convapp-conv-service

3.  cf create-service-key convapp-conv-service svcKey

4.  cf service-key convapp-conv-service svcKey
 ==> returns username and password credentials for conversation service

5.  Copy the Conversation username and password to the .env file
CONVERSATION_USERNAME=username
CONVERSATION_PASSWORD=password

6.  cf create-service tone_analyzer lite convapp-ta-service
 ==> create Tone Analyzer service using lite plan and call it convapp-ta-service

7.  cf create-service-key convapp-ta-service svcKey

8.  cf service-key convapp-ta-service svcKey
 ==> returns username and password for Tone Analyzer service

9.  Copy Tone Analyzer username and password to the .env file
TONE_ANALYZER_USERNAME=username
TONE_ANALYZER_PASSWORD =password
```

The last piece of information we need is the WORKSPACE_ID. 
To get this, we need to create a workspace in our conversation service and build a conversation which involves defining intents, entities and building a dialog to orchestrate the interaction with the user. 
To do so:
  * Point your browser to https://bluemix.net
  * Login with your Bluemix credentials
  * Find your conversation service with the name convapp-conv-service. Click to open the page for that service.
  * Find the Launch button and click it to launch the tooling for the conversation service.
  * Click Import to import a json file which defines the conversation workspace ==> Choose file convapp/conversation-nlu/training/stressbot.json
  * This imports intents, entities, and the dialog  for this conversation into a workspace called StressBot.
  * Click the Actions menu (3 vertical dots in top right of workspace tile) to View details.
  * Copy Workspace ID, edit .env file and add workspace id
     WORKSPACE_ID=workspaceID

Now you’re ready to run the application. On the terminal command line, execute this command.
``` sh
node server.js
Point your browser to http://localhost:3000
Experiment with conversation application
   Note the conversation starts out asking how you're feeling and based on your response, it understand the emotional tone and responds accordingly.
```

To push your application to Bluemix:
``` sh
  edit manifest.yml and change name to a unique name (for example, convapp-conv-jk)
  cf push
  point your browser to http://convapp-conv-nlu-jk.mybluemix.net
  Experiment with conversation application
```

# License

  This sample code is licensed under Apache 2.0.
  Full license text is available in [LICENSE](LICENSE).
