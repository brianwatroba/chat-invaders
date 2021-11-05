import Phaser from '../lib/phaser.js';

export default class Game extends Phaser.Scene {
	constructor() {
		super('game');
	}

	player;
	platforms;
	cursors;
	score = 0;
	gameOver = false;
	scoreText;
	wordPlatforms;
	randomMessages = [
		'bacon',
		'omegalul',
		'how is this working',
		'please invest in my startup',
	];
	baseXVelocity = 0;

	messageTimer = 0;

	preload() {
		this.load.image('sky', 'assets/sky.png');
		this.load.image('ground', 'assets/platform.png');
		this.load.image('star', 'assets/star.png');
		this.load.image('bomb', 'assets/bomb.png');
		this.load.spritesheet('dude', 'assets/dude.png', {
			frameWidth: 32,
			frameHeight: 48,
		});
	}

	create() {
		//  A simple background for our game
		this.add.image(400, 300, 'sky');

		//  The platforms group contains the ground and the 2 ledges we can jump on
		this.platforms = this.physics.add.staticGroup();

		this.wordPlatforms = this.physics.add.group();

		//  Here we create the ground.
		//  Scale it to fit the width of the game (the original sprite is 400x32 in size)
		this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

		var test_word = this.add
			.text(200, 400, 'testtesttesttest', {
				fontSize: '32px',
				fill: '#FF0000',
				backgroundColor: '#FFF000',
			})
			.setOrigin(0.5);

		this.wordPlatforms.add(test_word);
		console.log(test_word.body);
		test_word.body.allowGravity = false;
		test_word.body.setVelocityX(-10);

		// The player and its settings
		this.player = this.physics.add.sprite(100, 450, 'dude');

		//  Player physics properties. Give the little guy a slight bounce.
		this.player.setBounce(0.1);
		this.player.setCollideWorldBounds(false);

		//  Our player animations, turning, walking left and walking right.
		this.anims.create({
			key: 'left',
			frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
			frameRate: 10,
			repeat: -1,
		});

		this.anims.create({
			key: 'turn',
			frames: [{ key: 'dude', frame: 4 }],
			frameRate: 20,
		});

		this.anims.create({
			key: 'right',
			frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
			frameRate: 10,
			repeat: -1,
		});

		//  Input Events
		this.cursors = this.input.keyboard.createCursorKeys();

		//  The score
		this.scoreText = this.add.text(16, 16, 'score: 0', {
			fontSize: '32px',
			fill: '#000',
		});

		//  Collide the player and the stars with the platforms
		this.physics.add.collider(this.player, this.platforms);
		this.physics.add.collider(this.player, this.wordPlatforms);

		// this.cameras.main.setBounds(-400, 0, 800*3, 600*3);
		this.cameras.main.startFollow(this.player, true);
		this.cameras.main.setZoom(1);
	}

	update() {
		if (this.gameOver) {
			return;
		}

		if (this.cursors.left.isDown) {
			this.player.setVelocityX(this.baseXVelocity - 160);

			this.player.anims.play('left', true);
		} else if (this.cursors.right.isDown) {
			this.player.setVelocityX(this.baseXVelocity + 160);

			this.player.anims.play('right', true);
		} else {
			this.player.setVelocityX(this.baseXVelocity);
			this.player.anims.play('turn');
		}

		if (this.cursors.up.isDown && this.player.body.touching.down) {
			this.player.setVelocityY(-530);
		}

		this.messageTimer += 1;
		if (this.messageTimer > 25) {
			this.ingestMessage(
				this,
				this.randomMessages[
					Math.floor(Math.random() * this.randomMessages.length)
				]
			);
			this.messageTimer = 0;
		}
	}

	ingestMessage(phaser, message) {
		var xPos = this.player.x + 700;
		var yPos = this.player.y - 400 + Math.random() * 800;
		var move_speed = -25 - 300 * Math.random();

		console.log('ingest message: ' + message + ' xPos: ' + xPos);

		var test_word = phaser.add
			.text(xPos, yPos, message, {
				fontSize: '32px',
				fill: '#FFFFFF',
			})
			.setOrigin(0.5);

		this.wordPlatforms.add(test_word);
		test_word.body.allowGravity = false;
		test_word.body.setVelocityX(move_speed);
	}
}
