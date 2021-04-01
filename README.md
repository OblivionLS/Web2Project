# Project Description in progress
## Composition
In this project I use a combination of the following web technologies:
* Vue.js
* Node.js
* Socket.io
* p5.js
* docker (docker-compose)
* nginx

## Composition Overview
The following images should give you some Idea of how the different containers and Code parts interact with each other.
(images shall follow)

# Further Documentation
## Deployment
The project was first deployed on Azure by creating a virtual machine. 
On that Ubuntu VM nodejs and docker has to be installed (git is apperantly already there).
Then the project is cloned, built and run.
Domain has to be connected to the IP-Adress of the Azure VM.
For https to work the networksettings have to be adjusted on the Azure VM to verify the server client communication.

### Helpful Links on the Matter
https://www.digitalocean.com/community/tutorials/initial-server-setup-with-ubuntu-18-04
https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-18-04#step-3-%E2%80%94-using-the-docker-command
https://www.digitalocean.com/community/tutorials/how-to-install-docker-compose-on-ubuntu-18-04
clone git project by using: git clone https://url
build project with docker commands
(for the first build some adjustments in docker-compose certbot have to be made to get the https certificate)

#### When using Windows
On windows you can use Putty to connect to the server and run the commands.
download: https://the.earth.li/~sgtatham/putty/latest/w64/putty-64bit-0.74-installer.msi
To connect to the Server you first have to do some ajustments in Putty and deposit your SSH key to connect to the Azure Server.
https://help.communicationsquare.com/article/103-how-to-connect-to-a-linux-vm-using-putty
after connecting you can use your linux commands to do changes on your VM.

### Updating Deploy
Using the following commands to update the webserver. (same can be applied to nodejs)
* login: yourazureuser
* su - username
    * (type your password)
* cd /path/to/Web2Project
* git pull origin
* sudo docker-compose stop webserver
* sudo docker-compose build --force-rm --no-cache webserver
* sudo docker-compose up --no-dep -d webserver

## Performance Issues
One of my biggest issue in terms of performance seemes to be from the graphics function in p5.js.
More precicely the p5.tint() function which changes the transperancy of the graphics you later on draw on the canvas with p5.image(graphics, 0, 0). By disabling it the performance was imensely improved, with the downside, that there isn't a cool fadeout effect anymore of the "majestic flap".

## code chaos
The serverside of the project is kind of a mess at the moment. I'm sorry for anyone who's trying to understand what's happening. I am working on it (maybe).

