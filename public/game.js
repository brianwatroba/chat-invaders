var GAME_WIDTH = 800;
var GAME_HEIGHT = 600;
var game = new Phaser.Game(
	GAME_WIDTH,
	GAME_HEIGHT,
	Phaser.AUTO,
	'phaser-example',
	{
		preload: preload,
		create: create,
		update: update,
		render: render,
	}
);

function preload() {
	console.log('preloading');
	game.load.image('bullet', './assets/bullet.png');
	game.load.image('enemyBullet', './assets//enemy-bullet.png');
	game.load.spritesheet('invader', './assets/invader32x32x4.png', 32, 32);
	game.load.image('ship', './assets/player.png');
	game.load.spritesheet('kaboom', './assets/explode.png', 128, 128);
	game.load.image('starfield', './assets/starfield.png');
	game.load.image('background', './assets/background2.png');
}

var player;
var aliens;
var bullets;
var bulletTime = 0;
var leftWorldBound;
var cursors;
var fireButton;
var explosions;
var starfield;
var charactersRemaining = 500;
var charactersRemainingString = '';
var charactersRemainingText;
var timerString = '';
var timerText;
var lives;
var enemyBullet;
var firingTimer = 0;
var stateText;
var livingEnemies = [];
var randomMessages = [
	'bacon',
	'omegalul',
	'how is this working',
	'please invest in my startup',
];

function create() {
	game.physics.startSystem(Phaser.Physics.ARCADE);

	//  The scrolling starfield background
	starfield = game.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'starfield');

	//  Our bullet group
	bullets = game.add.group();
	bullets.enableBody = true;
	bullets.physicsBodyType = Phaser.Physics.ARCADE;
	bullets.createMultiple(30, 'bullet');
	bullets.setAll('anchor.x', 0.5);
	bullets.setAll('anchor.y', 1);
	bullets.setAll('outOfBoundsKill', true);
	bullets.setAll('checkWorldBounds', true);

	// The enemy's bullets

	enemyBullets = game.add.group();
	enemyBullets.enableBody = true;
	enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
	enemyBullets.createMultiple(30, 'enemyBullet');
	enemyBullets.setAll('anchor.x', 0.5);
	enemyBullets.setAll('anchor.y', 1);
	enemyBullets.setAll('outOfBoundsKill', true);
	enemyBullets.setAll('checkWorldBounds', true);

	//  The hero!
	player = game.add.sprite(50, 500, 'ship');
	player.anchor.setTo(0.5, 0.5);
	player.angle = 90;
	game.physics.enable(player, Phaser.Physics.ARCADE);

	//  The baddies!
	aliens = game.add.group();
	aliens.enableBody = true;
	aliens.physicsBodyType = Phaser.Physics.ARCADE;

	// Left world border
	leftWorldBound = game.add.graphics(0, 0);
	leftWorldBound.lineStyle(1, 0xfd02eb, 0);
	leftWorldBound.moveTo(0, 0);
	leftWorldBound.lineTo(0, GAME_HEIGHT);
	leftWorldBound.anchor.setTo(0.5, 0.5);
	game.physics.arcade.enable(leftWorldBound);
	leftWorldBound.enableBody = true;

	//  The characters Remaining
	charactersRemainingString = 'Characters Remaining: ';
	charactersRemainingText = game.add.text(
		10,
		10,
		charactersRemainingString + charactersRemaining,
		{
			font: '34px Arial',
			fill: '#fff',
		}
	);

	// Timer
	timerString = '00:00:00';
	timerText = game.add.text(10, 60, timerString, {
		font: '34px Arial',
		fill: '#fff',
	});

	//  Lives
	lives = game.add.group();
	game.add.text(game.world.width - 100, 10, 'Lives : ', {
		font: '34px Arial',
		fill: '#fff',
	});

	//  Text
	stateText = game.add.text(game.world.centerX, game.world.centerY, ' ', {
		font: '84px Arial',
		fill: '#fff',
	});
	stateText.anchor.setTo(0.5, 0.5);
	stateText.visible = false;

	//	Player lives
	for (var i = 0; i < 3; i++) {
		var ship = lives.create(game.world.width - 100 + 30 * i, 60, 'ship');
		ship.anchor.setTo(0.5, 0.5);
		ship.angle = 90;
		ship.alpha = 0.4;
	}

	//  An explosion pool
	explosions = game.add.group();
	explosions.createMultiple(30, 'kaboom');
	explosions.forEach(setupInvader, this);

	//  And some controls to play the game with
	cursors = game.input.keyboard.createCursorKeys();
	fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}
function updateTime() {
	var totalSeconds = game.time.totalElapsedSeconds();

	var minutes = Math.floor(totalSeconds / 60);
	minutes = minutes < 10 ? '0' + minutes : '' + minutes;

	var seconds = Math.floor(totalSeconds % 60);
	seconds = seconds < 10 ? '0' + seconds : '' + seconds;

	var ms = Math.round((totalSeconds % 1) * 60);
	ms = ms < 10 ? '0' + ms : '' + ms;
	timerString = '' + minutes + ':' + seconds + ':' + ms;
	timerText.text = timerString;
}

function createAlien(x, y, letters, move_speed) {
	var bmd = game.add.bitmapData(75, 25, 'key');
	bmd.text(letters, 0, 20, '25px Courier', 'rgb(255, 255, 255)');

	var alien = aliens.create(x, y, bmd);
	alien.anchor.setTo(0.5, 0.5);

	alien.body.velocity.x = move_speed;
}

function ingestMessage(message) {
	var yPos = 50 + Math.random() * GAME_HEIGHT * 0.8;
	var move_speed = -25 - 100 * Math.random();

	for (var i = 0; i < message.length / 3; i++) {
		var letters = message.substring(i * 3, (i + 1) * 3);
		createAlien(GAME_WIDTH + 100 + i * 45, yPos, letters, move_speed);
	}
}

function setupInvader(invader) {
	invader.anchor.x = 0.5;
	invader.anchor.y = 0.5;
	invader.animations.add('kaboom');
}

function descend() {
	aliens.y += 10;
}

function update() {
	//  Scroll the background
	starfield.tilePosition.x -= 2;

	if (player.alive) {
		player.body.velocity.setTo(0, 0);

		if (cursors.up.isDown && player.y > 30) {
			player.body.velocity.y = -250;
		} else if (cursors.down.isDown && player.y < GAME_HEIGHT - 30) {
			player.body.velocity.y = 250;
		}

		if (fireButton.isDown) {
			fireBullet();
		}

		//  Run collision
		game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
		game.physics.arcade.overlap(
			enemyBullets,
			player,
			enemyHitsPlayer,
			null,
			this
		);

		game.physics.arcade.overlap(
			aliens,
			leftWorldBound,
			wordHitsEnd,
			null,
			this
		);

		updateTime();
	}
}

function render() {
	// for (var i = 0; i < aliens.length; i++)
	// {
	//     game.debug.body(aliens.children[i]);
	// }
}

function collisionHandler(bullet, alien) {
	//  When a bullet hits an alien we kill them both
	bullet.kill();
	alien.kill();

	// Decrease the characters Remaning
	charactersRemaining -= 3;
	charactersRemainingText.text = 'Characters Remaining: ' + charactersRemaining;

	//  And create an explosion :)
	var explosion = explosions.getFirstExists(false);
	explosion.reset(alien.body.x, alien.body.y);
	explosion.play('kaboom', 30, false, true);

	if (aliens.countLiving() == 0) {
		enemyBullets.callAll('kill', this);
		stateText.text = ' You Won, \n Click to restart';
		stateText.visible = true;

		//the "click to restart" handler
		game.input.onTap.addOnce(restart, this);
	}
}

function wordHitsEnd(leftWorldBound, alien) {
	alien.kill();

	var explosion = explosions.getFirstExists(false);
	explosion.reset(alien.body.x, alien.body.y);
	explosion.play('kaboom', 30, false, true);

	live = lives.getFirstAlive();

	if (live) {
		live.kill();
	}

	if (lives.countLiving() < 1) {
		player.kill();
		enemyBullets.callAll('kill');

		stateText.text = ' GAME OVER \n Click to restart';
		stateText.visible = true;

		//the "click to restart" handler
		game.input.onTap.addOnce(restart, this);
	}
}

function enemyHitsPlayer(player, bullet) {
	bullet.kill();

	live = lives.getFirstAlive();

	if (live) {
		live.kill();
	}

	//  And create an explosion :)
	var explosion = explosions.getFirstExists(false);
	explosion.reset(player.body.x, player.body.y);
	explosion.play('kaboom', 30, false, true);

	// When the player dies
	if (lives.countLiving() < 1) {
		player.kill();
		enemyBullets.callAll('kill');

		stateText.text = ' GAME OVER \n Click to restart';
		stateText.visible = true;

		//the "click to restart" handler
		game.input.onTap.addOnce(restart, this);
	}
}

function fireBullet() {
	//  To avoid them being allowed to fire too fast we set a time limit
	if (game.time.now > bulletTime) {
		//  Grab the first bullet we can from the pool
		bullet = bullets.getFirstExists(false);

		if (bullet) {
			//  And fire it
			bullet.reset(player.x, player.y + 8);
			bullet.body.velocity.x = 400;
			bullet.angle = 90;
			bulletTime = game.time.now + 100;
		}
	}
}

function resetBullet(bullet) {
	//  Called if the bullet goes out of the screen
	bullet.kill();
}

function restart() {
	//  A new level starts

	//resets the life count
	lives.callAll('revive');
	//  And brings the aliens back from the dead :)
	aliens.removeAll();
	createAliens();

	//revives the player
	player.revive();
	//hides the text
	stateText.visible = false;
}

setInterval(function () {
	ingestMessage(
		randomMessages[Math.floor(Math.random() * randomMessages.length)]
	);
}, 1000);
