const express = require('express');
const app = express();

app.use(express.static(__dirname + '/public'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});
