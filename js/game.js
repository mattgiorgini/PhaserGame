var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-game',
{preload: preload,
create: create,
update: update,
render: render});

//Inizializzazione variabili globali
var player;
var starfield;
var bgm;
var bullets;
var enemyBullets;
var enemies;
var blueEnemies;
var enemiesTimer;
var blueEnemiesTimer;
var explosions;
var shields;
var gameOver;
var scoreText;
var restartButton;
var mute;
var cursors;
var fireButton;
var bulletTimer = 0;
var score = 0;

function preload(){
  game.load.image('starfield', 'assets/starfield.png');
  game.load.image('ship', 'assets/player.png');
  game.load.image('bullet', 'assets/bullet.png');
  game.load.image('enemy-base', 'assets/enemy-base.png');
  game.load.image('enemy-blue', 'assets/enemy-blue.png');
  game.load.image('enemy-bullet', 'assets/enemy-bullet.png');
  game.load.spritesheet('explosion', 'assets/explode.png', 128, 128);
  game.load.audio('bgm', 'assets/bgm.ogg');
}

function create(){
  //Background
  starfield = game.add.tileSprite(0, 0, 800, 600,'starfield');

  //BGM
  bgm = game.add.audio('bgm');
  bgm.play();

  //Gruppo proiettili
  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  bullets.createMultiple(30, 'bullet');
  bullets.setAll('anchor.x', 0.5);
  bullets.setAll('anchor.y', 1);
  bullets.setAll('outOfBoundsKill', true);
  bullets.setAll('checkWorldBounds', true);

  //Gruppo esplosione
  explosions = game.add.group();
  explosions.enableBody = true;
  explosions.physicsBodyType = Phaser.Physics.ARCADE;
  explosions.createMultiple(30, 'explosion');
  explosions.setAll('anchor.x', 0.5);
  explosions.setAll('anchor.y', 0.5);

  explosions.forEach(function(explosion) {
    explosion.animations.add('explosion');
  });

  //Gruppo nemici
  enemies = game.add.group();
  enemies.enableBody = true;
  enemies.physicsBodyType = Phaser.Physics.ARCADE;
  enemies.createMultiple(5, 'enemy-base');
  enemies.setAll('anchor.x', 0.5);
  enemies.setAll('anchor.y', 0.5);
  enemies.setAll('scale.x', 0.5);
  enemies.setAll('scale.y', 0.5);
  enemies.setAll('angle', 180);
  enemies.setAll('outOfBoundsKill', true);
  enemies.setAll('checkWorldBounds', true);
  //Miglioramento delle Hitbox
  enemies.forEach(function(enemy){
    enemy.body.setSize(enemy.width * 3 / 4, enemy.height * 3 / 4);
    enemy.damageAmount = 20;
  });
  
  //Lancio dei nemici con timer
  game.time.events.add(1000, launchEnemies);

  //Gruppo proiettili nemici
  blueEnemyBullets = game.add.group();
  blueEnemyBullets.enableBody = true;
  blueEnemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
  blueEnemyBullets.createMultiple(30, 'enemy-bullet');
  blueEnemyBullets.callAll('crop', null, {x: 90, y: 0, width: 90, height: 70});
  blueEnemyBullets.setAll('alpha', 0.9);
  blueEnemyBullets.setAll('anchor.x', 0.5);
  blueEnemyBullets.setAll('anchor.y', 0.5);
  blueEnemyBullets.setAll('outOfBoundsKill', true);
  blueEnemyBullets.setAll('checkWorldBounds', true);
  blueEnemyBullets.forEach(function(enemy){
      enemy.body.setSize(20, 20);
  });

  //Gruppo nemici blue
  blueEnemies = game.add.group();
  blueEnemies.enableBody = true;
  blueEnemies.physicsBodyType = Phaser.Physics.ARCADE;
  blueEnemies.createMultiple(30, 'enemy-blue');
  blueEnemies.setAll('anchor.x', 0.5);
  blueEnemies.setAll('anchor.y', 0.5);
  blueEnemies.setAll('scale.x', 0.5);
  blueEnemies.setAll('scale.y', 0.5);
  blueEnemies.setAll('angle', 180);
  blueEnemies.forEach(function(enemy){
      enemy.damageAmount = 40;
  });

  //Lancio dei nemici blue con timer
  game.time.events.add(1000, launchBlueEnemies);
  
  //Player
  player = game.add.sprite(400, 500, 'ship');
  player.health = 100;
  player.anchor.setTo(0.5, 0.5);
  //Aggiungere la fisica al player
  game.physics.enable(player, Phaser.Physics.ARCADE);
  
  //Scudo
  shields = game.add.text(game.world.width - 150, 10, 'Shields: ' + player.health + '%', {font: '20px Arial', fill: '#fff'});
  shields.render = function() {
    shields.text = 'Shields: ' + Math.max(player.health, 0) + '%';
  };

  //Punteggio
  scoreText = game.add.text(10, 10, '', {font: '20px Arial', fill: '#fff'});
  scoreText.render = function() {
    scoreText.text = 'Score: ' + score;
  };
  scoreText.render();

  //Game Over
  gameOver = game.add.text(game.world.centerX, game.world.centerY, 'GAME OVER!', {font: '72px Arial', fill: '#fff'});
  gameOver.anchor.setTo(0.5, 0.5);
  gameOver.visible = false;

  //Controlli di gioco
  cursors = game.input.keyboard.createCursorKeys();
  fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  restartButton = game.input.keyboard.addKey(Phaser.Keyboard.R);
  mute = game.input.keyboard.addKey(Phaser.Keyboard.M);
}

function update(){
  //Movimento Background
  starfield.tilePosition.y +=2;

  //Implementazione controlli di gioco
  player.body.velocity.setTo(0, 0);
    if (cursors.left.isDown) //left
    {
      player.body.velocity.x = -200;
    }
    if (cursors.right.isDown) //right
    {
      player.body.velocity.x = 200;
    }
    if (cursors.up.isDown) //up
    {
      player.body.velocity.y = -200;
    }
    if (cursors.down.isDown) //down
    {
      player.body.velocity.y = 200;
    }

  //Muta BGM
  if(mute.isDown)
  {
    bgm.mute = true;
  }

  //Margini di gioco
  if (player.x > 780)
  {
    player.body.velocity.x = -200;
  }
  if (player.x < 20)
  {
    player.body.velocity.x = 200;
  }
  if (player.y > 580)
  {
    player.body.velocity.y = -200;
  }
  if (player.y < 20)
  {
    player.body.velocity.y = 200;
  }

  //Spara proiettile
  if (player.alive && fireButton.isDown)
  {
    fireBullet();
  }

  //Collisioni
  game.physics.arcade.overlap(player, enemies, shipCollide, null, this);
  game.physics.arcade.overlap(enemies, bullets, hitEnemy, null, this);
  game.physics.arcade.overlap(player, blueEnemies, shipCollide, null, this);
  game.physics.arcade.overlap(bullets, blueEnemies, hitEnemy, null, this);
  game.physics.arcade.overlap(blueEnemyBullets, player, enemyHitsPlayer, null, this);

  //Controllo del Game Over
  if (! player.alive && gameOver.visible === false)
  {
    gameOver.visible = true;
    gameOver.alpha = 0;
    var fadeInGameOver = game.add.tween(gameOver);
    fadeInGameOver.to({alpha: 1}, 1000, Phaser.Easing.Quintic.Out);
    fadeInGameOver.onComplete.add(setResetHandlers);
    fadeInGameOver.start();

    function setResetHandlers() {
      //Gestore del "Click to Restart"
      spaceRestart = restartButton.onDown.addOnce(_restart, this);

      function _restart() {
        spaceRestart.detach();
        restart();
      }
    }
  }
}

function render(){
}

//FUNZIONI GLOBALI

//Funzione di sparo
function fireBullet() {
  if (game.time.now > bulletTimer)
  {
    var BULLET_SPACING = 250;
    var bullet = bullets.getFirstExists(false);
  }

  if (bullet)
  {
    bullet.reset(player.x, player.y)
    bullet.body.velocity.y = -400;
    bulletTimer = game.time.now + BULLET_SPACING;
  }
}

//Funzione di lancio dei nemici
function launchEnemies() {
  var MIN_ENEMY_SPACING = 300;
  var MAX_ENEMY_SPACING = 1000;
  var ENEMY_SPEED = 400;

  var enemy = enemies.getFirstExists(false);
  if (enemy)
  {
    enemy.reset(game.rnd.integerInRange(0, game.width), -20);
    enemy.body.velocity.x = game.rnd.integerInRange(-300, 300);
    enemy.body.velocity.y = ENEMY_SPEED;
    enemy.body.drag.x = 100;
  }

  //I nemici si spostano in base alla direzione
  enemy.update = function()
  {
    enemy.angle = 180 - game.math.radToDeg(Math.atan2(enemy.body.velocity.x, enemy.body.velocity.y));
  }

  //Lancio del nemico successivo
  enemiesTimer = game.time.events.add(game.rnd.integerInRange(MIN_ENEMY_SPACING, MAX_ENEMY_SPACING), launchEnemies);
}

//Funzione di lancio dei nemici blue
function launchBlueEnemies() {
  var startingX = game.rnd.integerInRange(100, game.width - 100);
  var VERTICAL_SPEED = 180;
  var SPREAD = 60;
  var FREQUENCY = 70;
  var VERTICAL_SPACING = 70;
  var NUM_IN_WAVE = 5;
  var TIME_BETWEEN_WAVES = 7000;

  //Lancio onda
  for (var i =0; i < NUM_IN_WAVE; i++) {
    var enemy = blueEnemies.getFirstExists(false);
    if (enemy) {
        enemy.startingX = startingX;
        enemy.reset(game.width / 2, -VERTICAL_SPACING * i);
        enemy.body.velocity.y = VERTICAL_SPEED;

        //Opzioni dei proiettili nemici
        var BULLET_SPEED = 400;
        var FIRING_DELAY = 2000;
        enemy.bullets = 1;
        enemy.lastShot = 0;

        enemy.update = function(){
          //Movimento onda
          this.body.x = this.startingX + Math.sin((this.y) / FREQUENCY) * SPREAD;

          //Rotazione
          bank = Math.cos((this.y + 60) / FREQUENCY)
          this.scale.x = 0.5 - Math.abs(bank) / 8;
          this.angle = 180 - bank * 2;

          //Sparo
          enemyBullet = blueEnemyBullets.getFirstExists(false);
          if (enemyBullet &&
              this.alive &&
              this.bullets &&
              this.y > game.width / 8 &&
              game.time.now > FIRING_DELAY + this.lastShot) {
                this.lastShot = game.time.now;
                this.bullets--;
                enemyBullet.reset(this.x, this.y + this.height / 2);
                enemyBullet.damageAmount = this.damageAmount;
                var angle = game.physics.arcade.moveToObject(enemyBullet, player, BULLET_SPEED);
                enemyBullet.angle = game.math.radToDeg(angle);
            }

          //Distruggi nemici fuori dallo schermo
          if (this.y > game.height + 200) {
            this.kill();
            this.y = -20;
          }
        };
    }
  }

  //Lancio onda nemici successiva
  blueEnemiesTimer = game.time.events.add(TIME_BETWEEN_WAVES, launchBlueEnemies);
}

//Collisione del player e dei nemici
function shipCollide(player, enemy){
  var explosion = explosions.getFirstExists(false);
  explosion.reset(enemy.body.x + enemy.body.halfWidth, enemy.body.y + enemy.body.halfHeight);
  explosion.body.velocity.y = enemy.body.velocity.y;
  explosion.alpha = 0.7;
  explosion.play('explosion', 30, false, true);
  enemy.kill();

  //Danno da collisione
  player.damage(enemy.damageAmount);
  shields.render();
}

//Collisione con i proiettili
function hitEnemy(enemy, bullet){
  var explosion = explosions.getFirstExists(false);
  explosion.reset(enemy.body.x + enemy.body.halfWidth, enemy.body.y + enemy.body.halfHeight);
  explosion.body.velocity.y = enemy.body.velocity.y;
  explosion.alpha = 0.7;
  explosion.play('explosion', 30, false, true);
  enemy.kill();
  bullet.kill();

  //Aumenta punteggio
  //score += enemy.damageAmount * 10;
  score += 100;
  scoreText.render();
}

//Collisione con i proiettili nemici
function enemyHitsPlayer (player, bullet) {
  var explosion = explosions.getFirstExists(false);
  explosion.reset(player.body.x + player.body.halfWidth, player.body.y + player.body.halfHeight);
  explosion.alpha = 0.7;
  explosion.play('explosion', 30, false, true);
  bullet.kill();
  
  //Danno da sparo
  player.damage(bullet.damageAmount);
  shields.render()
}

//Restart Game
function restart() {

  //Reset nemici
  enemies.callAll('kill');
  game.time.events.remove(enemiesTimer);
  game.time.events.add(1000, launchEnemies);
  
  blueEnemies.callAll('kill');
  blueEnemyBullets.callAll('kill');
  game.time.events.remove(blueEnemiesTimer);
  game.time.events.add(1000, launchBlueEnemies);
  
  //Reset player
  player.revive();
  player.health = 100;
  shields.render();
  score = 0;
  scoreText.render();

  gameOver.visible = false;
}