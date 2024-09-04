window.addEventListener('load', function(){
    // canvas setup
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 500;

    class InputHandler {
        constructor(game){
            this.game = game;
            window.addEventListener('keydown', e => {
                if (( (e.key === 'ArrowUp') ||
                    (e.key === 'ArrowDown') ||
                    (e.key === ' ')
                ) && this.game.keys.indexOf(e.key) === -1){ // if it doesn't already exist in your list of pressed keys
                    this.game.keys.push(e.key);
                } 
                else if (e.key === 'd'){
                    this.game.debug = !this.game.debug;
                }
                // if(this.game.keys.indexOf(' ') > -1) this.game.player.shootTop();
                console.log(this.game.keys);
                console.log(this.game.gameTime)
            });
            window.addEventListener('keyup', e => {
                if (this.game.keys.indexOf(e.key) > -1){
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
                console.log(this.game.keys);
            });

            if(this.game.keys.includes(' ')){
                console.log('Should be shooting.')
                this.game.player.shootTop();
            }
        }
    }
    class SoundController {
        constructor(){
            this.powerUpSound = document.getElementById('powerup');
            this.powerDownSound = document.getElementById('powerdown');
            this.explosionSound = document.getElementById('explosion');
            this.shotSound = document.getElementById('shot');
            this.hitSound = document.getElementById('hit');
            this.shieldSound = document.getElementById('shieldSound');
        }
        powerUp(){
            this.powerUpSound.currentTime = 0;
            this.powerUpSound.play();
        }
        powerDown(){
            this.powerDownSound.currentTime = 0;
            this.powerDownSound.play();
        }
        explosion(){
            this.explosionSound.currentTime = 0;
            this.explosionSound.play();
        }
        shot(){
            this.shotSound.currentTime = 0;
            this.shotSound.play();
        }
        hit(){
            this.hitSound.currentTime = 0;
            this.hitSound.play();
        }
        shield(){
            this.shieldSound.currentTime = 0;
            this.shieldSound.play();
        }
    }
    class Shield {
        constructor(game){
            this.game = game;
            this.width = this.game.player.width;
            this.height = this.game.player.height;
            this.frameX = 0;
            this.maxFrame = 24;
            this.image = document.getElementById('shield');
            this.fps = 30;
            this.timer = 0;
            this.interval = 1000/this.fps;
        }
        update(deltaTime){
            if(this.frameX <= this.maxFrame) {
                if(this.timer > this.interval) {
                    this.frameX++;
                    this.timer = 0;
                } else {
                    this.timer += deltaTime;
                }
            }
        }
        draw(context){
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height,
                this.game.player.x, this.game.player.y, this.game.player.width, this.game.player.height);
        }
        reset(){
            this.frameX = 0;
            this.game.sound.shield();
        }
    }
    class Projectile {
        constructor(game, x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            // this.width = 10;
            this.width = 36.25
            // this.height = 3;
            this.height = 20;
            // this.speed = 3;
            this.speed = Math.random() * 0.2 + 2.8;
            this.markedForDeletion = false;
            this.image = document.getElementById('fireball');
            this.frameX = 0;
            this.maxFrame = 3;
            this.fps = 18;
            this.timer = 0;
            this.interval = 1000/this.fps;
        }
        update(deltaTime){
            this.x += this.speed;
            if(this.timer > this.interval){
                this.timer = 0;
                if(this.frameX < this.maxFrame) this.frameX++;
                else this.frameX = 0;
            } else {
                this.timer += deltaTime;
            }

            if(this.x > this.game.width * 0.8) this.markedForDeletion = true;
        }
        draw(context){
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height,
                this.x, this.y, this.width, this.height);
        }
    }
    class Particle {
        constructor(game, x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.image = document.getElementById('gears');
            this.frameX = Math.floor(Math.random() * 3);
            this.frameY = Math.floor(Math.random() * 3);
            this.spriteSize = 50;
            this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
            this.size = this.spriteSize * this.sizeModifier
            this.speedX = Math.random() * 6 - 3; // random between -3 and 3
            this.speedY = Math.random() * -15; // between 0 and -15;
            this.gravity = 0.5;
            this.markedForDeletion = false;
            this.angle = 0;
            this.va = Math.random() * 0.2 - 0.1; // rotation speed or "velocity of angle"; between -0.1 annd 0.1 radians per animation frame
            this.bounced = 0;
            this.bottomBounceBoundary = Math.random() * 80 + 60;
        }
        update(){
            this.angle += this.va;
            this.speedY += this.gravity;
            this.x -= this.speedX + this.game.speed;
            this.y += this.speedY;
            if(this.y > this.game.height + this.size || this.x < 0 - this.size)
                this.markedForDeletion = true;
            if(this.y > this.game.height - this.bottomBounceBoundary && this.bounced < 2){
                this.bounced++;
                this.speedY *= -0.5;
            }
        }
        draw(context){
            context.save();
            context.translate(this.x, this.y);
            context.rotate(this.angle);
            context.drawImage(this.image,
                this.frameX * this.spriteSize, this.frameY * this.spriteSize, this.spriteSize, this.spriteSize,
                this.size * -0.5, this.size * -0.5, this.size, this.size);
            context.restore();
        }
    }
    class Player {
        constructor(game) {
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
            this.speedY = 0;
            this.maxSpeed = 4;
            this.projectiles = [];
            this.shotTimer = 0;
            this.shotInterval = 83.3;
            this.image = document.getElementById('player');
            this.powerUp = false;
            this.powerUpTimer = 0;
            this.powerUpLimit = 10000;
        }
        update(deltaTime) {
            // handle player moving based on keys
            if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
            else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else this.speedY = 0;
            this.y += this.speedY;

            // handle shooting
            if(this.shotTimer > this.shotInterval) this.shotTimer = 0;
            else this.shotTimer += deltaTime;

            if(this.game.keys.includes(' ') && this.shotTimer == 0){
                this.shootTop();
            }

            // vertical boundaries
            if(this.y > this.game.height - this.height * 0.5) this.y = this.game.height - this.height * 0.5;
            if(this.y < -this.height * 0.5) this.y = -this.height * 0.5;

            // handle projectiles
            this.projectiles.forEach(projectile => {
                projectile.update(deltaTime);
            });
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);

            // sprite animation
            if(this.frameX < this.maxFrame){
                this.frameX++;
            } else {
                this.frameX = 0;
            }

            // power up handling
            if(this.powerUp){
                if(this.powerUpTimer > this.powerUpLimit){
                    this.powerUp = false;
                    this.powerUpTimer = 0;
                    this.frameY = 0;
                    this.game.sound.powerDown();
                } else {
                    this.powerUpTimer += deltaTime;
                    this.frameY = 1;
                    this.game.ammo += 0.1;
                }
            }
        }
        draw(context){
            // toggle debug mode box
            if(this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);

            // draw bullet projectiles
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });

            // draw player
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height,
                this.width, this.height, this.x, this.y, this.width, this.height);
        }
        shootTop(){
            if (this.game.ammo > 0){
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30));
                this.game.ammo--;
                this.game.sound.shot();
            }
            if(this.powerUp) this.shootBottom();
        }
        shootBottom(){
            if (this.game.ammo > 0){
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 175));
            }
        }
        enterPowerUp(){
            this.powerUp = true;
            this.powerUpTimer = 0; // resets your 10 second power up time
            if (this.game.ammo < this.game.maxAmmo)
                this.game.ammo = this.game.maxAmmo;
            this.game.sound.powerUp();
        }
    }
    class Enemy {
        constructor(game){
            this.game = game;
            this.x = this.game.width; // starts enemy all the way at the right
            this.speedX = Math.random()* -1.5 - 0.5; // moves enemy left at random speeds
            this.markedForDeletion = false;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37; // num frames in each enemy animation sprite sheet
        }
        update(){
            this.x += this.speedX - this.game.speed;
            if(this.x + this.width < 0) this.markedForDeletion = true;

            // sprite animation
            if(this.frameX < this.maxFrame){
                this.frameX++;
            } else {
                this.frameX = 0;
            }            
        }
        draw(context){
            if(this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            // grabs a part of the sprite sheet
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height,
                this.width, this.height, this.x, this.y, this.width, this.height);
            context.fillStyle = 'black';
            context.font = '20px Helvetica';
            if(this.game.debug) context.fillText(this.lives, this.x, this.y);
        }
    }
    class Angler1 extends Enemy {
        constructor(game){
            super(game);
            this.height = 169;
            this.width = 228;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('angler1');
            this.frameY = Math.floor(Math.random() * 3);
            this.lives = 5;
            this.score = this.lives;
        }
    }
    class Angler2 extends Enemy {
        constructor(game){
            super(game);
            this.height = 165;
            this.width = 213;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('angler2');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 6;
            this.score = this.lives;
        }
    }
    class LuckyFish extends Enemy {
        constructor(game){
            super(game);
            this.height = 95;
            this.width = 99;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('lucky');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 5;
            this.score = 15;
            this.type = 'lucky';
        }
    }
    class HiveWhale extends Enemy {
        constructor(game){
            super(game);
            this.height = 227;
            this.width = 400;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('hiveWhale');
            this.frameY = 0;
            this.lives = 20;
            this.score = this.lives;
            this.type = 'hive';
            this.speedX = Math.random() * -1.2 - 0.2;
        }
    }
    class Drone extends Enemy {
        constructor(game, x, y){
            super(game);
            this.height = 95;
            this.width = 115;
            this.x = x;
            this.y = y;
            this.image = document.getElementById('drone');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 3;
            this.score = this.lives;
            this.type = 'drone';
            this.speedX = Math.random() * -4.2 - 0.5;
        }
    }
    class BulbWhale extends Enemy {
        constructor(game){
            super(game);
            this.height = 219;
            this.width = 270;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('bulbWhale');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 20;
            this.score = this.lives;
            this.speedX = Math.random() * -1.2 - 0.2;
        }
    }
    class MoonFish extends Enemy {
        constructor(game){
            super(game);
            this.height = 240;
            this.width = 227;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('moonFish');
            this.frameY = 0;
            this.lives = 10;
            this.score = this.lives;
            this.speedX = Math.random() * -1.2 - 2;
            this.type = 'moon';
        }
    }
    class Stalker extends Enemy {
        constructor(game){
            super(game);
            this.height = 123;
            this.width = 243;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('stalker');
            this.frameY = 0;
            this.lives = 5;
            this.score = this.lives;
            this.speedX = Math.random() * -1 - 1;
        }
    }
    class Razorfin extends Enemy {
        constructor(game){
            super(game);
            this.height = 149;
            this.width = 187;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('razorfin');
            this.frameY = 0;
            this.lives = 7;
            this.score = this.lives;
            this.speedX = Math.random() * -1 - 1;
        }
    }
    class Layer {
        constructor(game, image, speedModifier){
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }
        update(){
            if(this.x <= -this.width) this.x = 0;
            this.x -= this.game.speed * this.speedModifier;
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y);
        }
    }
    class Background {
        constructor(game){
            this.game = game;
            this.image1 = document.getElementById('layer1');
            this.image2 = document.getElementById('layer2');
            this.image3 = document.getElementById('layer3');
            this.image4 = document.getElementById('layer4');
            this.layer1 = new Layer(this.game, this.image1, 0.2);
            this.layer2 = new Layer(this.game, this.image2, 0.4);
            this.layer3 = new Layer(this.game, this.image3, 1);
            this.layer4 = new Layer(this.game, this.image4, 1.5);
            this.layers = [this.layer1, this.layer2, this.layer3];
        }
        update(){
            this.layers.forEach(layer => layer.update());
        }
        draw(context){
            this.layers.forEach(layer => layer.draw(context));
        }
    }
    class Explosion {
        constructor(game, x, y){
            this.game = game;
            this.frameX = 0;
            this.spriteWidth = 200;
            this.spriteHeight = 200;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.x = x - this.width * 0.5;
            this.y = y - this.height * 0.5;

            this.fps = 34;
            this.timer = 0;
            this.interval = 1000/this.fps;
            this.markedForDeletion = false;
            this.maxFrame = 8;
        }
        update(deltaTime){
            this.x -= this.game.speed;
            if(this.timer > this.interval){
                this.frameX++;
                this.timer = 0;
            } 
            else this.timer += deltaTime;

            if(this.frameX > this.maxFrame) this.markedForDeletion = true;
        }
        draw(context){
            context.drawImage(this.image, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        }
    }
    class SmokeExplosion extends Explosion {
        constructor(game, x, y){
            super(game, x, y)
            this.image = document.getElementById('smokeExplosion');
        }
    }
    class FireExplosion extends Explosion {
        constructor(game, x, y){
            super(game, x, y)
            this.image = document.getElementById('fireExplosion');
            this.fps = 20;
        }
    }
    class UI {
        constructor(game){
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Bangers';
            this.color = 'lightgray';
        }
        draw(context){
            context.save()
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            context.font = this.fontSize + 'px ' + this.fontFamily;

            // score
            context.fillText('Score: ' + this.game.score, 20, 40);

            // timer
            let formattedTime = ((this.game.timeLimit - this.game.gameTime) * 0.001).toFixed(1);
            
            if(formattedTime <= 10){
                context.fillStyle = 'red';
            }
            if(formattedTime <= 0){
                formattedTime = 0.0;
            }
            context.fillText('Timer: ' + formattedTime, 20, 100);

            // reset color for everything else
            context.fillStyle = this.color;

            // game over messages
            if(this.game.gameOver){
                context.textAlign = 'center';
                let message1;
                let message2;
                if(this.game.score >= this.game.winningscore){
                    message1 = 'Yeah Baby!';
                    message2 = 'Well done!';
                } else {
                    message1 = 'You lost!';
                    message2 = 'Try again! :)';
                }

                // print Game Over message 1
                context.font = '70px ' + this.fontFamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 20);

                // print Game Over message 2
                context.font = '25px ' + this.fontFamily;
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 20);
            }

            // ammo
            if(this.game.player.powerUp) context.fillStyle = '#ffffbd';
            for(let i = 0; i < this.game.ammo; i++){
                context.fillRect(20+ 5 * i, 50, 3, 20);
            }

            context.restore();
        }
    }
    class Game {
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.background = new Background(this);
            this.keys = [];
            this.player = new Player(this);
            this.ui = new UI(this);
            this.sound = new SoundController();
            this.shield = new Shield(this);
            this.input = new InputHandler(this);
            this.enemies = [];
            this.particles = [];
            this.explosions = [];
            this.enemyTimer = 0;
            this.enemyInterval = 2000;
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 350;
            this.gameOver = false;
            this.score = 0;
            this.winningscore = 100;
            this.gameTime = 0;
            this.timeLimit = 30000;
            this.speed = 1;
            this.debug = false;
        }
        update(deltaTime){
            if(!this.gameOver) this.gameTime += deltaTime;
            if(this.gameTime >= this.timeLimit) this.gameOver = true;
            this.background.update();
            this.background.layer4.update();
            this.player.update(deltaTime);
            if(this.ammoTimer > this.ammoInterval) {
                if(this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            }
            this.shield.update(deltaTime);
            this.enemies.forEach(enemy => {
                enemy.update();

                // check for collision between an enemy and the player
                if(this.checkCollision(this.player, enemy)){
                    this.sound.hit();
                    this.shield.reset();
                    enemy.markedForDeletion = true;
                    // make a particle explosion when enemies collide with player
                    for(let i=0; i < enemy.score; i++){
                        this.particles.push(new Particle(game, enemy.x + (enemy.width * 0.5), enemy.y + (enemy.height * 0.5)));
                    }
                    if(enemy.type == 'lucky') this.player.enterPowerUp();
                    else if(!this.gameOver) this.score--;
                }

                // check for collision between an enemy and a projectile
                this.player.projectiles.forEach(projectile => {
                    if (this.checkCollision(projectile, enemy)){
                        this.sound.hit();
                        enemy.lives--;
                        projectile.markedForDeletion = true; // remove projectile after collision
                        // make two particles fly after every collision
                        for(let i=0; i < 2; i++){
                            this.particles.push(new Particle(this, enemy.x + (enemy.width * 0.5), enemy.y + (enemy.height * 0.5)));
                        }
                        if(enemy.lives <= 0){
                            enemy.markedForDeletion = true;
                            // make a particle explosion when enemies die
                            for(let i=0; i < enemy.score; i++){
                                this.particles.push(new Particle(this, enemy.x + (enemy.width * 0.5), enemy.y + (enemy.height * 0.5)));
                            }

                            // make a smoke explosion when enemies die
                            this.addExplosion(enemy);

                            // Create drones if a hive whale dies
                            if (enemy.type == 'hive'){
                                for(let i=0; i < 5; i++){
                                    this.enemies.push(new Drone(this, enemy.x + Math.random() * enemy.width, enemy.y + Math.random() * enemy.height * 0.5));
                                }
                            }
                            if (enemy.type == 'moon') this.player.enterPowerUp();

                            if(!this.gameOver) this.score += enemy.score;
                            //if(this.score >= this.winningscore) this.gameOver = true;
                        }
                    }
                })
            })

            // update each particle's motion and check for ones that need to be deleted
            this.particles.forEach(particle => particle.update());
            this.particles = this.particles.filter(particle => !particle.markedForDeletion);

            // update each explosion's motion and check for ones that need to be deleted
            this.explosions.forEach(explosion => explosion.update(deltaTime));
            this.explosions = this.explosions.filter(explosion => !explosion.markedForDeletion);

            // update enemies array to only include enemies that have not been marked for deletion
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if(this.enemyTimer > this.enemyInterval && !this.gameOver){
                this.addEnemy();
                this.enemyTimer = 0;
            }
            else{
                this.enemyTimer += deltaTime;
            }
        }
        draw(context){
            // draw background first to put it all the way in the back
            this.background.draw(context);
            this.ui.draw(context);
            this.player.draw(context);
            this.shield.draw(context);
            this.particles.forEach(particle => particle.draw(context));
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
            this.explosions.forEach(explosion => explosion.draw(context));
            // draw foreground last to make it overlap all the way in the front
            this.background.layer4.draw(context);
        }
        addEnemy(){
            const randomize = Math.random();
            if (randomize < 0.1) this.enemies.push(new Angler1(this));
            else if (randomize < 0.3) this.enemies.push(new Stalker(this));
            else if (randomize < 0.5) this.enemies.push(new Razorfin(this));
            else if (randomize < 0.6) this.enemies.push(new Angler2(this));
            else if (randomize < 0.7) this.enemies.push(new HiveWhale(this));
            else if (randomize < 0.8) this.enemies.push(new BulbWhale(this));
            else if (randomize < 0.9) this.enemies.push(new MoonFish(this));
            else this.enemies.push(new LuckyFish(this));
        }
        addExplosion(enemy){
            this.sound.explosion();
            const randomize = Math.random();
            if (randomize < 0.5) this.explosions.push(new SmokeExplosion(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
            else this.explosions.push(new FireExplosion(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
        }
        checkCollision(rect1, rect2){
            return(     rect1.x < rect2.x + rect2.width &&
                        rect1.x + rect1.width > rect2.x &&
                        rect1.y < rect2.y + rect2.height &&
                        rect1.y + rect1.height > rect2.y
            )
        }
    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;
    // animation loop
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        // console.log(deltaTime);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.draw(ctx);
        game.update(deltaTime);
        requestAnimationFrame(animate);
    }
    animate(0);
})