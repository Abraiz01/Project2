// opens and connect to socket
let socket = io();

let newFeather, clientCount;
let score1 = document.getElementById('player1-score');
let score2 = document.getElementById('player2-score');
let lives1 = document.getElementById('player1-lives');
let lives2 = document.getElementById('player2-lives');
let restartButton = document.getElementById('restart-button');
let height = window.innerHeight;
let width = window.innerWidth;

//listen for confirmation
socket.on('connect', () => {
    console.log("client connected to the game");

    // now that client has connected to server, emit name
    let playerData = {
        'name' : sessionStorage.getItem('name'),
        'room' : sessionStorage.getItem('room')
    }
    socket.emit('playerData', playerData);
})

socket.on('playerTwoName', (data) => {
    console.log(data);
})

socket.on('playerLeft',() => {
    game.playerLeft = true;
})

socket.on('clientCountGame',(data) => {
    // console.log(data);
    clientCount = data;
    if (clientCount == 2) {
        game.ready = true;
    }
})

socket.on('restartServerData',() => {
    game.player2.restart = true;
    if(game.player.restart && game.player2.restart) {
        game.player.restart = false;
        game.player2.restart = false;
        window.location = '/game.html';
    }
})

socket.on('maxPlayersReached',() => {
    alert('This room is full.');
    window.location = '/index.html';
})

socket.on('playerOneServerData', (data) => {  
    ellipse(data.x, data.y, data.r, data.r);
})

window.addEventListener('load', () => {
  
    let lobbyButton = document.getElementById('back-to-lobby-button');

    lobbyButton.addEventListener('click', () => {
        let playerData = {
            'name' : sessionStorage.getItem('name'),
            'room' : sessionStorage.getItem('room')
        }
        socket.emit('returnData', playerData);
        window.location = '/index.html';
    })
    
    score1.innerHTML = ": " + game.player.featherCount;
    score2.innerHTML = ": " + game.player2.featherCount;

    lives1.innerHTML = ": " + game.player.lives;
    lives2.innerHTML = ": " + game.player2.lives;

})

//P5 code

let img, img2;
function preload() {
  playerImg = loadImage('/images/faiza.png');
  playerFlip = loadImage('/images/faiza-flip.png');
  player2Img = loadImage('/images/faiza2.png');
  player2Flip = loadImage('/images/faiza2-flip.png');
  over_bg = loadImage('/images/gameover_background.png');
  enemyImg = loadImage('/images/enemy.png');
  enemyImg2 = loadImage('/images/enemy-flip.png');
  bgImg = loadImage('/images/background1.png');
  featherImg = loadImage('/images/feather.png');
  feather2Img = loadImage('/images/feather2.png');
}

class Creature {
    constructor(x, y, r, img_w, img_h, num_frames) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.vx = 0;
        this.vy = 0;
        this.dir = 1;
        this.img_w = img_w;
        this.img_h = img_h;
        this.num_frames = num_frames;
        this.frame = 0;
    }
    display() {
        this.update();
        // ellipse(this.x, this.y, this.r, this.r);

        if (this.dir == 1) {
            image(img, this.x - floor(this.img_w/2), this.y - floor(this.img_h/2), this.img_w, this.img_h, this.frame * this.img_w, 0, this.img_w, this.img_h);
        }    
        else if (this.dir == 0) {
            image(img2, this.x - floor(this.img_w/2), this.y - floor(this.img_h/2), this.img_w, this.img_h, this.frame * this.img_w, 0, this.img_w, this.img_h);
        }
    }
  }
  
class Player extends Creature {
    constructor(x, y, r, img_w, img_h, num_frames, tx, ty, isPlayer2) {
        super(x, y, r, img_w, img_h, num_frames);
        this.key_handler = {
            left: false,
            right: false,
            up: false,
            down: false
        };
        this.playerPosition = {
            x: this.x,
            y: this.y,
            vx: this.vx,
            vy: this.vy,
            key_handler: this.key_handler
        }
        this.isPlayer2 = isPlayer2;
        this.username;
        this.alive = true;
        this.lives = 3;
        this.featherCount = 0;
        this.winner;
        this.restart = false;
    }

    update() {

        if ((frameCount % 5) == 0 && (this.vx != 0 || this.vy != 0)) {
            if (this.dir == 1) {
                this.frame = (this.frame + 1) % (this.num_frames - 1);
            }
            else if (this.dir == 0) {
                this.frame = ((this.frame) % (this.num_frames - 1)) + 1;
            }
        }
            
        else if (this.vx == 0 && this.vy == 0) {
            if (this.dir == 1) {
                this.frame = 8;
            }
            else if (this.dir == 0) {
                this.frame = 0;
            }
        }
            

        if (this.key_handler.left == true) {
            this.vx = -2;
            this.dir = 0;
            if (this.x - this.r + this.vx < 6) {
                this.vx = 0
            } 
            this.x += this.vx;
            this.playerPosition.x += this.vx;
        }
        else if (this.key_handler.right == true) {
            this.vx = 2;
            this.dir = 1;
            if (this.x + this.r + this.vx > 1018) {
                this.vx = 0
            } 
            this.x += this.vx;
            this.playerPosition.x += this.vx;
        }
        else {
            this.vx = 0;
        }
        if (this.key_handler.up == true) {
            this.vy = -2;
            if (this.y - this.r + this.vy <= 5) {
                this.vy = 0
            }
            this.y += this.vy;
            this.playerPosition.y += this.vy;
        }
        else if (this.key_handler.down == true) {
            this.vy = 2;
            if (this.y + this.r + this.vy >= 694) {
                this.vy = 0 
            }
            this.y += this.vy;
            this.playerPosition.y += this.vy;
        }
        else {
            this.vy = 0;
        }

    }

    distance(target) {
        return Math.pow(Math.pow(this.x - target.x, 2) + Math.pow(this.y - target.y, 2), 0.5);
    }

    display() {
        this.update();
        // ellipse(this.x, this.y, this.r, this.r);
        if (this.isPlayer2 == false) {
            if (this.dir == 1) {
                image(playerImg, this.x - floor(this.img_w/2), this.y - floor(this.img_h/2), this.img_w, this.img_h, this.frame * this.img_w, 0, this.img_w, this.img_h);
            }    
            else if (this.dir == 0) {
                image(playerFlip, this.x - floor(this.img_w/2), this.y - floor(this.img_h/2), this.img_w, this.img_h, this.frame * this.img_w, 0, this.img_w, this.img_h);
            }
        }
        else if (this.isPlayer2) {
            if (this.dir == 1) {
                image(player2Img, this.x - floor(this.img_w/2), this.y - floor(this.img_h/2), this.img_w, this.img_h, this.frame * this.img_w, 0, this.img_w, this.img_h);
            }    
            else if (this.dir == 0) {
                image(player2Flip, this.x - floor(this.img_w/2), this.y - floor(this.img_h/2), this.img_w, this.img_h, this.frame * this.img_w, 0, this.img_w, this.img_h);
            }
        }
    }

}

class Enemy extends Creature {
    constructor(x, y, r, img_w, img_h, num_frames, tx, ty, tr) {
        super(x, y, r, img_w, img_h, num_frames);
        this.tx = tx;
        this.ty = ty;
        this.tr = tr;
        this.playerPosition = {
            x: this.x,
            y: this.y,
            vx: this.vx,
            vy: this.vy,
        };

        this.vx = 0;
        this.vy = 0;
        this.v = 1.7;
        this.dir = 1;
        this.alive = true;
        this.key_handler = {
            left: false,
            right: false,
            up: false,
            down: false
        };
        this.dummyPosition = {
            tx: this.tx,
            ty: this.ty,
            vx: this.vx,
            vy: this.vy,
            key_handler: this.key_handler
        }; 

    }

    update() {

        if (frameCount % 6 == 0) {
            if (this.dir == 1) {
                this.frame = (this.frame + 1) % (this.num_frames - 1);
            }
            else if (this.dir == 0) {
                this.frame = ((this.frame) % (this.num_frames - 1)) + 1;
            }
        }
            

        if (this.key_handler.left == true) {
            this.vx = -2;
            this.dir = 0;
            if (this.tx - this.tr + this.vx < 6) {
                this.vx = 0
            } 
            this.tx += this.vx;
            this.dummyPosition.tx += this.vx;
        }
        else if (this.key_handler.right == true) {
            this.vx = 2;
            this.dir = 1;
            if (this.tx + this.tr + this.vx > 1018) {
                this.vx = 0
            } 
            this.tx += this.vx;
            this.dummyPosition.tx += this.vx;
        }
        else {
            this.vx = 0;
        }
        if (this.key_handler.up == true) {
            this.vy = -2;
            if (this.ty - this.tr + this.vy <= 5) {
                this.vy = 0
            }
            this.ty += this.vy;
            this.dummyPosition.ty += this.vy;
        }
        else if (this.key_handler.down == true) {
            this.vy = 2;
            if (this.ty + this.tr + this.vy >= 762) {
                this.vy = 0 
            }
            this.ty += this.vy;
            this.dummyPosition.ty += this.vy;
        }
        else {
            this.vy = 0;
        }




        this.dy = this.ty - this.y
        this.dx = this.tx - this.x

        if (this.dx == 0 && this.dy > 0) {
        this.angle = radians(90);
        }
        
        else if (this.dx == 0 && this.dy < 0) {
        this.angle = radians(270);
        }
        
        else {
        this.angle = Math.atan((this.dy)/(this.dx));
        }

        
        
        if (this.dx == 0 && this.dy > 0) {
        this.dir = 1;
        this.x += this.v * Math.cos(this.angle)
        this.y += this.v * Math.sin(this.angle)
        }

        if (this.dx == 0 && this.dy < 0){
        this.dir = 1;
        this.x += this.v * Math.cos(this.angle)
        this.y += this.v * Math.sin(this.angle)
        }

        if (this.dx > 0 && this.dy == 0) {
        this.dir = 1;
        this.x += this.v * Math.cos(this.angle)
        this.y += this.v * Math.sin(this.angle)
        }

        if (this.dx < 0 && this.dy == 0) {
        this.dir = 0;
        this.x -= this.v * Math.cos(this.angle)
        this.y += this.v * Math.sin(this.angle)
        }

        if (this.dx > 0 && this.dy > 0) {
        this.dir = 1;
        this.x += this.v * Math.cos(this.angle)
        this.y += this.v * Math.sin(this.angle)
        }

        if (this.dx < 0 && this.dy < 0) {
        this.dir = 0;
        this.x -= this.v * Math.cos(this.angle)
        this.y -= this.v * Math.sin(this.angle)
        }

        if (this.dx < 0 && this.dy > 0) {
        this.dir = 0;
        this.x -= this.v * Math.cos(this.angle)
        this.y -= this.v * Math.sin(this.angle)
        }

        if (this.dx > 0 &&  this.dy < 0) {
        this.dir = 1;
        this.x += this.v * Math.cos(this.angle)
        this.y += this.v * Math.sin(this.angle)
        }
    }

    distance() {
        return Math.pow(Math.pow(this.x - this.tx, 2) + Math.pow(this.y - this.ty, 2), 0.5);
    }

    display() {
        this.update();
        // image(enemyImg, this.x - floor(this.img_w/2), this.y - floor(this.img_h/2), this.img_w, this.img_h, this.frame * this.img_w, 0, this.img_w, this.img_h);

        if (this.dir == 1) {
            image(enemyImg, this.x - floor(this.img_w/2), this.y - floor(this.img_h/2), this.img_w, this.img_h, this.frame * this.img_w, 0, this.img_w, this.img_h);
        }    
        else if (this.dir == 0) {
            image(enemyImg2, this.x - floor(this.img_w/2), this.y - floor(this.img_h/2), this.img_w, this.img_h, this.frame * this.img_w, 0, this.img_w, this.img_h);
        }
    }
}

class Feather extends Creature {
    constructor(x, y, r, img_w, img_h, num_frames, isfeather2) {
        super(x, y, r, img_w, img_h, num_frames);
        this.alive = true;
        this.featherPosition = {
            x: this.x,
            y:this.y
        }
        this.isfeather2 = isfeather2;
    }

    display() {
        fill(255,0,255)
        // ellipse(this.x, this.y, this.r, this.r);

        if (this.isfeather2 == false) {
            image(featherImg, this.x - floor(this.img_w/2), this.y - floor(this.img_h/2));
        }
        else if (this.isfeather2) {
            image(feather2Img, this.x - floor(this.img_w/2), this.y - floor(this.img_h/2));
        }
    }
}
  
class Game {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.ready = false;
        this.playerLeft = false;
        this.gameOver = false;
        this.winFeathers = 1;
        this.player = new Player(300, 300, 20, 66, 66, 9, 300, 300, false);
        this.player.username = sessionStorage.getItem('name');
        this.player2 = new Player(300, 300, 20, 66, 66, 9, 300, 300, true); 
        this.enemy = new Enemy(700, 700, 20, 66, 66, 6, 300, 300, this.player.r)      
        this.enemy2 = new Enemy(700, 700, 20, 66, 66, 6, 300, 300, this.player2.r) 
        this.featherList = [];
        this.featherList2 = [];
    }

    update() {

            if (this.enemy.distance() <= this.enemy.r + this.enemy.tr) {
                // this.enemy.alive = false
                // this.player.alive = false
    
                this.player.x = 300;
                this.player.y = 300;
                // this.player.alive = true;
    
                this.enemy.x = 700;
                this.enemy.y = 700;
                this.enemy.tx = 300;
                this.enemy.ty = 300;
                // this.enemy.alive = true;
    
                this.player.lives --;
                lives1.innerHTML = ": " + this.player.lives;
                console.log('player',this.player.lives);
                console.log('player2',this.player2.lives);
            }
    
            if (this.enemy2.distance() <= this.enemy2.r + this.enemy2.tr) {
                // this.enemy2.alive = false
                // this.player2.alive = false
    
                this.player2.x = 300;
                this.player2.y = 300;
                // this.player2.alive = true;
    
                this.enemy2.x = 700;
                this.enemy2.y = 700;
                this.enemy2.tx = 300;
                this.enemy2.ty = 300;
                // this.enemy2.alive = true;
    
                this.player2.lives --;
                lives2.innerHTML = ": " + this.player2.lives;
                console.log('player lives',this.player.lives);
                console.log('player2 lives',this.player2.lives);
            }
    
            if (frameCount % 300 == 0) {
                for (let i=0; i<this.featherList.length; i++) {
                    this.featherList = this.arrayRemove(this.featherList, this.featherList[i]);
                }
                newFeather = new Feather(this.randomInt(20, 780), this.randomInt(20,780), 20, 40, 40, 1, false);
                this.featherList.push(newFeather);
                socket.emit('featherPosition', newFeather.featherPosition);
            }
    
            for (let i=0; i<this.featherList.length; i++) {
                if (this.player.distance(this.featherList[i]) <= this.player.r + this.featherList[i].r) {
                    this.player.featherCount ++;
                    score1.innerHTML = ": " + this.player.featherCount;
                    console.log('player feathers',this.player.featherCount);
                    for (let j=0; j<this.featherList.length; j++) {
                        this.featherList = this.arrayRemove(this.featherList, this.featherList[j]);
                    }
                }
            }
    
            for (let j=0; j<this.featherList2.length; j++) {
                if (this.player2.distance(this.featherList2[j]) <= this.player2.r + this.featherList2[j].r) {
                    this.player2.featherCount ++;
                    score2.innerHTML = ": " + this.player2.featherCount;
                    console.log('player2 feathers',this.player2.featherCount);
                    for (let i=0; i<this.featherList2.length; i++) {
                        this.featherList2 = this.arrayRemove(this.featherList2, this.featherList2[i]);
                    }
                }
            }
    
            if (this.player.featherCount == this.winFeathers || this.player2.featherCount == this.winFeathers) {
                this.gameOver = true;
                if (this.player.featherCount == this.winFeathers) {
                    this.player.winner = "You won!";
                    this.player2.winner = "You lost";
                }
                else {
                    this.player.winner = "You lost";
                    this.player2.winner = "You won!";
                }
            }

            if (this.player.lives == 0 || this.player2.lives == 0) {
                this.gameOver = true;
                if (this.player.lives == 0) {
                    this.player.winner = "You lost";
                    this.player2.winner = "You won!";
                }
                if (this.player2.lives == 0) {
                    this.player.winner = "You won!";
                    this.player2.winner = "You lost";
                }
            }

    }

    display() {
        this.update();
        // this.player.display();
        // this.player2.display();

        if (this.ready == true && this.gameOver == false) {
            this.player.display();
            this.player2.display();
            this.enemy.display();
            this.enemy2.display();
            // this.feather.display();
            for (let i=0; i<this.featherList.length; i++) {
                this.featherList[i].display();
            }
            for (let j=0; j<this.featherList2.length; j++) {
                this.featherList2[j].display();
            }
        }

        if (this.gameOver) {
            image(over_bg, 0, 0)
            textSize(150);
            fill(255, 0, 0);
            text("GAME", 270, 220);
            text("OVER", 290,350);
            textSize(75);
            text(this.player.winner, 370, 550);
            restartButton.style.display = "inline";

            if (this.player.restart == true && this.player2.restart == false) {
                textSize(15);
                fill(0, 255, 0);
                text("Waiting for other player to restart...", 400, 600);
            }

            if (this.player.restart == false && this.player2.restart == true) {
                textSize(15);
                fill(0, 255, 0);
                text("Player 2 is ready, click Play Again for another game!", 355, 600);
            }
        }

        if (this.playerLeft) {
            textSize(15);
            fill(162, 67, 206);
            text("Player 2 has left the game", 450, 650);
        }
    }

    arrayRemove(arr, value) {
        return arr.filter(function(geeks){
            return geeks != value;
        });
    }

    randomInt(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
}

game = new Game(50, 50);

function setup() {

    let canvas = createCanvas(1024, 700);
    canvas.position(50, 30, 'fixed');
    // canvas.parent('canvas-container');

    // createCanvas(1024, 768);
    socket.on('playerTwoServer', (data) => {
        game.player2.key_handler.left = data.key_handler.left;
        game.player2.key_handler.right = data.key_handler.right;
        game.player2.key_handler.up = data.key_handler.up;
        game.player2.key_handler.down = data.key_handler.down;

        // game.player2.x = data.x;
        // game.player2.y = data.y;

        game.enemy2.key_handler.left = data.key_handler.left;
        game.enemy2.key_handler.right = data.key_handler.right;
        game.enemy2.key_handler.up = data.key_handler.up;
        game.enemy2.key_handler.down = data.key_handler.down;

        // game.enemy2.tx = data.x;
        // game.enemy2.ty = data.y;
    })

    socket.on('featherServer', (data) => {
        for (let j=0; j<game.featherList2.length; j++) {
            game.featherList2 = game.arrayRemove(game.featherList2, game.featherList2[j]);
        }
        feather2 = new Feather(data.x, data.y, 20, 40, 40, 1, true);
        game.featherList2.push(feather2);
    })

}
  
function draw() {
    // image(bgImg, 0, 0);
    clear();
    game.display();

    if (keyIsDown) {
        socket.emit('playerOnePosition', game.player.playerPosition);
        // socket.emit('enemyPosition', game.enemy.dummyPosition);
    }

}

function keyPressed() {
    if (keyCode === LEFT_ARROW) {
        game.player.key_handler.left = true;  
        game.enemy.key_handler.left = true;
  } else if (keyCode === RIGHT_ARROW) {
        game.player.key_handler.right = true; 
        game.enemy.key_handler.right = true; 
  }
    else if (keyCode === UP_ARROW) {
        game.player.key_handler.up = true;
        game.enemy.key_handler.up = true; 
  }
    else if (keyCode === DOWN_ARROW) {
        game.player.key_handler.down = true;
        game.enemy.key_handler.down = true; 
  }
}

function keyReleased() {
    if (keyCode === LEFT_ARROW) {
        game.player.key_handler.left = false;
        game.enemy.key_handler.left = false;
  } else if (keyCode === RIGHT_ARROW) {
        game.player.key_handler.right = false;
        game.enemy.key_handler.right = false;
  }
    else if (keyCode === UP_ARROW) {
        game.player.key_handler.up = false;
        game.enemy.key_handler.up = false;
  }
    else if (keyCode === DOWN_ARROW) {
        game.player.key_handler.down = false;
        game.enemy.key_handler.down = false;
  }
}

restartButton.addEventListener('click', () => {
    // console.log('restart clicked')
    game.gameOver = false;
    game.player.restart = true;
    // console.log(game.gameOver);
    socket.emit('restartClicked');
    if(game.player.restart && game.player2.restart) {
        game.player.restart = false;
        game.player2.restart = false;
        window.location = '/game.html';
    }
})

function arrayRemove(arr, value) {
    return arr.filter(function(geeks){
        return geeks != value;
    });
}

function randomInt(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

