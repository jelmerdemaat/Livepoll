'use strict';

let express = require('express'),
	app = express(),
	router = express.Router(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	path = require('path');


let updateUsers = function() {
	io.emit('update users', io.engine.clientsCount);
}

let total, average;

let updateNumbers = function() {
	total = 0;
	average = 0;

	if(Object.keys(numbers).length > 0) {
		for(let client in numbers) {
			if (!numbers.hasOwnProperty(client)) continue;

			total += numbers[client];
		}

		average = total / Object.keys(numbers).length;
	} else {
		average = 50;
	}

	console.log('avg: ' + average);

	io.emit('average change', Math.round(average));
}

let numbers = {};

io.on('connection', function(socket) {
	updateUsers();
	console.log('user connected: ', socket.id);

	socket.on('range change', function(value) {
		console.log('range change: ' + value + ', user: ' + socket.id);

		numbers[socket.id] = parseInt(value);

		updateNumbers();
	});

	socket.on('disconnect', () => {
		updateUsers();
		delete numbers[socket.id];
		updateNumbers();
		console.log('user disconnected: ', socket.id);
	});

	socket.on('reset', () => {
		console.log('Resetting everything...');
		numbers = {};
		updateNumbers();
	});
});

app.set('port', (process.env.PORT || 3000));

app.use(express.static('views'));
app.use('/scripts', express.static(path.join(__dirname, 'node_modules/')));

app.use(function(req, res, next) {
  res.status(404).send('Damn! 4-oh-4!');
});

http.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
