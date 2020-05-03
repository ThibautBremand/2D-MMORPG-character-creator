# 2D-MMORPG-character-and-gamemap-creator
The entity administration interfaces for 2D-MMORPG, written in HTML and JavaScript.  
For the server, please see https://github.com/ThibautBremand/2D-MMORPG-server
For the client, please see https://github.com/ThibautBremand/2D-MMORPG-client  

These interfaces allows to create new characters and gamemaps. For more details, please see these Wiki pages:
- [Create new characters](https://github.com/ThibautBremand/2D-MMORPG-client/wiki/Create-new-characters)
- [Create new maps](https://github.com/ThibautBremand/2D-MMORPG-client/wiki/Create-new-maps)

## Demo!  
Go to http://51.91.158.243:8080/ and start playing using these usernames:
- demo
- demo2

You can also create new characters using the following page: http://51.91.158.243:8080/character

## Local installation

- Clone the repo
- Run *git submodule update --init --recursive* in order to clone the submodules.
- Create a *.env* environment variables file using the *.env.sample* as a model. Don't use any separator.
    - **Note:** DEPLOY_PATH value must correspond to the ADMIN_PATH value of the server. That way, once you deploy the admin interfaces, they'll be directly served by the server to the users (cf. https://github.com/ThibautBremand/2D-MMORPG-server).
- Run the script located in *./scripts/deploy.sh* to deploy the interfaces into the DEPLOY_PATH directory.