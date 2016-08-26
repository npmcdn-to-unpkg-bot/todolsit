var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var bodyParser  = require('body-parser');
var jsonParser  = bodyParser.json();
var app = express();

// Routing
app.get('/task/:id?', function (req, res) {
	taskApi.get(req, res);
});

app.post('/task', jsonParser, function (req, res) {
	taskApi.post(req, res);
});

app.put('/task/:id', jsonParser, function (req, res) {
	taskApi.put(req, res);
});

app.delete('/task/:id', function (req, res) {
	taskApi.delete(req, res);
});

//Task api
taskApi = {
	conn: null,
	config: {
		'dbpath': '../../db/todo.sqlite',
	}
};
taskApi.getConn = function() {
	if(taskApi.conn === null) {
		try{
			taskApi.conn = new sqlite3.Database(taskApi.config.dbpath);
		} catch(e) {
			console.log("Unable to load sqlite database file.");
		}
	}

	return taskApi.conn;
};

taskApi.get = function(req, res) {
	var conn = taskApi.getConn();
	if(typeof(req.params.id) !== 'undefined') {
		conn.get("SELECT * FROM task WHERE id = $id", {
			$id: req.params.id,
		}, function(err, row) {
			if(typeof(row) !== 'undefined') {
				res.writeHeader(200, {'Content-Type': 'application/json'});
				res.end(JSON.stringify(row));
			} else {
				res.writeHeader(404, {'Content-Type': 'application/json'});
				res.end();
			}
		});
	} else {
		conn.all("SELECT * FROM task", function(err, rows) {
			console.log(rows);
			if(rows.length > 0) {
				res.writeHeader(200, {'Content-Type': 'application/json'});
				res.end(JSON.stringify(rows));
			} else {
				res.writeHeader(404, {'Content-Type': 'application/json'});
				res.end();
			}
		});
	}
};

taskApi.post = function(req, res) {
	var conn = taskApi.getConn();
	conn.run("INSERT INTO task (title, description, status) VALUES ($title, $description, $status)", {
		$title: req.body.title,
		$description: req.body.description,
		$status: req.body.status
	}, function(err) {
		if(this.changes === 1) {
			conn.get("SELECT * FROM task WHERE id = " + this.lastID, function(err, row) {
				res.writeHeader(200, {'Content-Type': 'application/json'});
				res.end(JSON.stringify(row));
			});
		} else {
			res.writeHeader(500, {'Content-Type': 'application/json'});
			res.end();
		}
	});
};

taskApi.put = function(req, res) {
	var conn = taskApi.getConn();
	conn.run("UPDATE task SET title = $title, description = $description, status = $status WHERE id = $id", {
		$title: req.body.title,
		$description: req.body.description,
		$status: req.body.status,
		$id: req.params.id
	}, function(err) {
		if(this.changes === 1) {
			res.writeHeader(200, {'Content-Type': 'application/json'});
		} else {
			res.writeHeader(304, {'Content-Type': 'application/json'});
		}
		res.end();
	});
};

taskApi.delete = function(req, res) {
	var conn = taskApi.getConn();
	conn.run("DELETE FROM task WHERE id = $id", {
		$id: req.params.id
	}, function(err) {
		if(this.changes === 1) {
			res.writeHeader(200, {'Content-Type': 'application/json'});
		} else {
			res.writeHeader(404, {'Content-Type': 'application/json'});
		}
		res.end();
	});
};

var server = app.listen(8080, function() {
	console.log("Listening on port " + server.address().port);
});
