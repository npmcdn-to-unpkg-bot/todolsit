Usage instructions
==================

Setup
-----

#### Install Nodejs depencencies

	In api/node/ run:
	npm install

#### Install PHP dependencies

	In api/php/ run:
	composer install

Startup
-------

#### Start Nodejs Api
	
	In api/node/ run:
	nodejs server.js

#### Start frontend and PHP server

	In the root projectfolder (/) run:
	php -S 127.0.0.1:8000

Usage
-----

The jQuery frontend is available at:
[http://127.0.0.1:8000/frontend/index.html](http://127.0.0.1:8000/frontend/index.html)

The PHP api is available at:
[http://127.0.0.1:8000/api/php/task/](http://127.0.0.1:8000/api/php/task/)

The Nodejs api is available at:
[http://127.0.0.1:8080/task/](http://127.0.0.1:8080/task/)

To switch between Nodejs and PHP Api in the jQuery frontend there is a "api" variable
in the init section of todo-jquery.js for easy switching.

Database
--------

Currently we are using the same sqlite3 database for both Api solutions, but
this could be "easily" changed to another SQL for either one separately. If
we want to change to NoSQL storage more adjustments would be needed.
