# Minecraft heroku server (WIP)
Minecraft server to be hosted on heroku with dropbox storage and ngrok support


# Installation

Clone the repo
```
https://github.com/latinrev/minecraftserver
```

And then as you would normally do
```
$ npm install
```


# Configuration


## Local Config

There is an example.env(Rename this to .env ) file in the repo telling you where to put your tokens

#### NGROK
  Create an account in ngrok, retrieve your access token and paste it in your .env file
#### DROPBOX  
  Create an account in dropbox, create a new application of type folder and retrieve your folder access token and paste it in your .env file


## Heroku Config
#### HEROKU
  Create an application and follow the instructions to push the repository
#### NGROK
  Create an account in ngrok, retrieve your access token and paste it under the name NGROK_TOKEN in your Enviroment variables in heroku's dashboard
#### DROPBOX  
  Create an account in dropbox, create a new application of type folder and retrieve your folder access token and paste it under the name DROPBOX_TOKEN in your Enviroment variables in heroku's dashboard
#### KEEP-ALIVE URL
  Paste https:// "YOUR HEROKU APP NAME" .herokuapp.com/ under the name BACKUP_URL in your Enviroment variables in heroku's dashboard
  
# Usage

## Local
  Just do 
```
$ npm start
```
    Navigate to localhost:5000 to start the server
## Heroku 
  Heroku will automatically detect the procfile and start the webpage, if that doesn't work go into the dashboard/resources and scalate the dyno to be on.
  
    To start the server go to https:// "YOUR HEROKU APP NAME" .herokuapp.com/
