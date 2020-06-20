//select canvas
const cvs = document.getElementById("pong");
const ctx = cvs.getContext("2d");

const audio = {
    grunt1: new Audio('grunt1.mp3'),
    grunt2: new Audio('grunt2.mp3'),
    point: new Audio('point.mp3')
}

//create user paddle
const user = {
    x:0,
    y:cvs.height/2 - 100/2,
    width:10,
    height:100,
    color:"WHITE",
    score:0
}

const com = {
    x:cvs.width-10,
    y:cvs.height/2-100/2,
    width:10,
    height:100,
    color:"WHITE",
    score:0,
    level:0.1
}

//create ball
const ball = {
    x:cvs.width/2,
    y:cvs.height/2,
    radious:10,
    speed:5,
    velocityX:5,
    velocityY:5,
    color:"WHITE"
}

//create net
const net = {
    x:cvs.width/2-1,
    y:0,
    width:2,
    height:10,
    color:"WHITE"
}

//draw rect
function drawRect(x,y,w,h,color){
    ctx.fillStyle = color;
    ctx.fillRect(x,y,w,h);
}

//draw circle
function drawCircle(x,y,r,color){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2,false);
    ctx.closePath();
    ctx.fill();
}

//draw text
function drawText(text,x,y,color){
    ctx.fillStyle = color;
    ctx.font = "45px fantasy";
    ctx.fillText(text,x,y);
}

function drawNet(){
    for(let i = 0; i <= cvs.height; i+=15){
        drawRect(net.x,net.y+i,net.width,net.height,net.color);
    }
}

//render game
function render(){
    //clear canvas
    drawRect(0,0,cvs.width,cvs.height,"BLACK");
    //draw net
    drawNet();
    //draw score
    drawText(user.score,cvs.width/4,cvs.height/5,"WHITE");
    drawText(com.score,3*cvs.width/4,cvs.height/5,"WHITE");
    //draw level
    drawText("level "+Math.round(com.level*10),4*cvs.width/6,4*cvs.height/5,"WHITE");
    //draw paddles
    drawRect(user.x,user.y,user.width,user.height,user.color);
    drawRect(com.x,com.y,com.width,com.height,com.color);
    //draw ball
    drawCircle(ball.x,ball.y,ball.radious,ball.color);
}

//control user paddle
cvs.addEventListener("mousemove", movePaddle);
function movePaddle(evt){
    let rect = cvs.getBoundingClientRect();

    user.y = event.clientY - rect.top -user.height/2;
}

//collision detection
function collision(b,p){
    b.top = b.y - b.radious;
    b.bottom = b.y + b.radious;
    b.left = b.x - b.radious;
    b.right = b.x + b.radious;

    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom;
}

//reset ball
function resetBall(){
    ball.x = cvs.width/2;
    ball.y = cvs.height/2;
    ball.speed = 5;
    let directionX = (ball.velocityX < 0) ? 1:-1;
    let directionY = (ball.velocityY < 0) ? 1:-1;
    ball.velocityX = ball.speed*directionX;
    ball.velocityY = ball.speed*directionY;
}

//reset score
function resetScore(){
    user.score = 0;
    com.score = 0;
}

//reset game
function resetGame(){
    resetScore();
    com.level = 0.1;
}

function nextLevel(){
    resetScore()
    com.level += 0.1;
    if (com.level == 1){
        resetGame();
    }
}

//game logic
function update(){

    //if scored
    if (ball.x + ball.radious <0){
        audio.point.play();
        com.score++;
        resetBall();
        if(com.score>=10){
            resetGame();
        }
    }else if(ball.x - ball.radious > cvs.width){
        audio.point.play();
        user.score++;
        resetBall();
        if(user.score >= 10){
            nextLevel();
        }
    }

    ball.x+=ball.velocityX;
    ball.y+=ball.velocityY;

    //IA player logic
    com.y += (ball.y - (com.y + com.height/2)) * com.level;

    //ball/wall bouncing
    if (ball.y+ball.radious>cvs.height){
        ball.y = cvs.height-ball.radious;
        ball.velocityY=-ball.velocityY;
    }else if (ball.y-ball.radious<0) {
        ball.y = ball.radious
        ball.velocityY=-ball.velocityY;
    }

    let player = (ball.x < cvs.width/2) ? user: com;

    if(collision(ball,player)){
        //where the ball hit the player
        let collidePoint = ball.y - (player.y + player.height/2);

        //normalization
        collidePoint = collidePoint/(player.height/2);

        //calculate angle
        let angleRad = collidePoint*Math.PI/4;

        //direction X of ball: if player->right, else, left
        let direction = (ball.x < cvs.width/2) ? 1:-1;
        let sound = (direction>0) ? audio.grunt1:audio.grunt2;
        sound.play();

        //change vel X and Y
        ball.velocityX = direction*ball.speed*Math.cos(angleRad);
        ball.velocityY = ball.speed*Math.sin(angleRad);

        //speed increase per hit
        ball.speed += 1;
    }
}

//game init
function game(){
    update();
    render();
}

//loop
const framePerSecond=50;
setInterval(game, 1000/framePerSecond);