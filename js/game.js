var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-game',
{preload: preload,
create: create,
update: update,
render: render});

//Inizializzazione variabili globali
var player;
var starfield;
var cursors;
var bullets;
var fireButton;
var enemies;
var explosions;
var shields;
var enemiesTimer;
var gameOver;
var scoreText;
var restartButton;
var bulletTimer = 0;
var score = 0;

function preload(){
  game.load.image('starfield', 'assets/starfield.png');
  game.load.image('ship', 'assets/player.png');
  game.load.image('bullet', 'assets/bullet.png');
  game.load.image('enemy-green', 'assets/enemy-green.png')
  game.load.spritesheet('explosion', 'assets/explode.png', 128, 128);
}

function create(){
  //Background
  starfield = game.add.tileSprite(0, 0, 800, 600,'starfield');

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
  enemies.createMultiple(5, 'enemy-green');
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
  
  //Player
  player = game.add.sprite(400, 500, 'ship');
  player.health = 100;
  player.anchor.setTo(0.5, 0.5);
  //Aggiungere la fisica al player
  game.physics.enable(player, Phaser.Physics.ARCADE);
  
  //Statistiche dello scudo
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
  var MAX_ENEMY_SPACING = 3000;
  var ENEMY_SPEED = 300;

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
  score += enemy.damageAmount * 10;
  scoreText.render();
}

  //Restart Game
  function restart() {
    //Reset nemici
    enemies.callAll('kill');
    game.time.events.remove(enemiesTimer);
    game.time.events.add(1000, launchEnemies);

    //Reset player
    player.revive();
    player.health = 100;
    shields.render();
    score = 0;
    scoreText.render();

    gameOver.visible = false;
}