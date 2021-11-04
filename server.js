const express = require('express');
const app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/assets'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log('Server listening on http://localhost:5000');
});

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});
