// opens and connect to socket
let socket = io();

//listen for confirmation
socket.on('connect', () => {
    console.log("client connected to the game");

    // now that client has connected to server, emit name
    let playerData = {
        'name' : sessionStorage.getItem('name'),
        'room' : sessionStorage.getItem('room')
    }
    socket.emit('playerData', playerData);

    // //on disconnection
    // socket.on('disconnect', () => {
    //     let mes = 'player has left the game'
    //     socket.emit('leftGame', mes);
    // })
})

socket.on('clientCountGame',(data) => {
    console.log(data);
})

socket.on('maxPlayersReached',() => {
    alert('This room is full.');
    window.location = '/world.html';
})

socket.on('playerOneServerData', (data) => {
    // background(255,255,255);  
    ellipse(data.x, data.y, data.r, data.r);
})

let lobbyButton = document.getElementById('back-to-lobby-button');

lobbyButton.addEventListener('click', () => {
    let playerData = {
        'name' : sessionStorage.getItem('name'),
        'room' : sessionStorage.getItem('room')
    }
    socket.emit('returnData', playerData);
    window.location = '/world.html';
})

//P5 code

let img, img2;
function preload() {
  img = loadImage('/faiza.png');
  img2 = loadImage('/faiza-flip.png');
}

class Creature {
    constructor(x, y, r, img_w, img_h, num_frames) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.vx = 0;
        this.vy = 0;
        this.dir = 1;
        // this.img = img;
        this.img_w = img_w;
        this.img_h = img_h;
        this.num_frames = num_frames;
        this.frame = 0;
    }
    display() {
        this.update();
        // ellipse(this.x, this.y, this.r, this.r);

        if (this.dir == 1) {
            // image(img, this.x - floor(this.img_w/2), this.y - floor(this.img_h/2), this.img_w, this.img_h, this.frame * this.img_w, 0, (this.frame + 1) * this.img_w, this.img_h);
            image(img, this.x - floor(this.img_w/2), this.y - floor(this.img_h/2), this.img_w, this.img_h, this.frame * this.img_w, 0, this.img_w, this.img_h);
        }    
        else if (this.dir == 0) {
            image(img2, this.x - floor(this.img_w/2), this.y - floor(this.img_h/2), this.img_w, this.img_h, this.frame * this.img_w, 0, this.img_w, this.img_h);
        }
    }
  }
  
class Player extends Creature{
    constructor(x, y, r, img_w, img_h, num_frames, tx, ty) {
        super(x, y, r, img_w, img_h, num_frames);
        this.x = x;
        this.y = y;
        this.tx = tx;
        this.ty = ty;
        this.r = r;
        this.v = 0;
        this.alive = true;

    }

    update() {

        if ((frameCount % 5) == 0 && (this.v != 0)) {
            if (this.dir == 1) {
                this.frame = (this.frame + 1) % (this.num_frames - 1);
            }
            else if (this.dir == 0) {
                this.frame = ((this.frame) % (this.num_frames - 1)) + 1;
            }
        }
            
        else if (this.v == 0) {
            if (this.dir == 1) {
                this.frame = 8;
            }
            else if (this.dir == 0) {
                this.frame = 0;
            }
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

        if (round(this.dx) == 0 && round(this.dy) == 0) {
        this.x = this.tx
        this.y = this.ty
        this.v = 0
        this.dx = 0
        this.dy = 0
        }

    }

}
  
class Game {
    constructor(w, h) {
        this.w = w;
        this.h = h;
        this.player = new Player(300, 300, 20, 66, 66, 9, 300, 300);
        this.player2 = new Player(300, 300, 20, 66, 66, 9, 300, 300);        
    }
    display() {
        this.player.display();
        this.player2.display();
    }
}

game = new Game(50, 50);

function setup() {
    createCanvas(800, 800);
    // image(img, 0, 0);
    socket.on('playerTwoServer', (data) => {
        game.player2.v = 2;
        game.player2.tx = data.x;
        game.player2.ty = data.y;
    })

}
  
function draw() {
    background(220)
    game.display();
    // image(img, 0, 0);
    // socket.once('mouseDataFromServer', (data) => {
    //   clear();
    //   // drawEllipseWithData(data);
    // })
}

//emit information of mouse positon everytime i move mouse
function mouseClicked() {
    let mousePos = 
    { x: mouseX, 
        y: mouseY,
    };
    game.player.v = 2;
    game.player.tx = mouseX;
    game.player.ty = mouseY;
    //emit this information to the server
    socket.emit('mousePositionData', mousePos);
}

