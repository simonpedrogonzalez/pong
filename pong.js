
//count accesses
if (localStorage.hasOwnProperty('count')){
    var counter = localStorage.getItem('count');
    counter ++;
    localStorage.setItem('count', counter);
}else{
    localStorage.setItem('count', 1);
}

//select canvas
const cvs = document.getElementById("pong");
const ctx = cvs.getContext("2d");

const audio = {
    grunt1: new Audio('grunt1.mp3'),
    grunt2: new Audio('grunt2.mp3'),
    point: new Audio('point.mp3'),
    on: true
}

//create user paddle
const user = {
    x:0,
    y:cvs.height/2 - 100/2,
    width:10,
    height:100,
    color:"WHITE",
    score:0,
    forward_pos: cvs.width/2 - 70
}



const com = {
    x:cvs.width-10,
    y:cvs.height/2-100/2,
    width:10,
    height:100,
    color:"WHITE",
    score:0,
    speed:0.1,
    forward_prob: 0.5, //probabily of going forward if the ball is in the other side
    response_time: 30, //number of frames that will pass before com is able to go back
    // to normal position if the ball surpases them in forward position
    smash_prob: 0.8,
    forward_cooldown: 50, //cooldown for going forward in frames
    smash_cooldown: 4, // smash cooldown in hits
    smash_strength: 0.5,
    is_forward: false, //if now is in a forward position
    forward_pos: cvs.width/2 + 70
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

function drawSmallText(text,x,y,color){
    ctx.fillStyle = color;
    ctx.font = "12px fantasy";
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
    drawText("level "+Math.round(com.speed*10),4*cvs.width/6,4*cvs.height/5,"WHITE");
    //draw counter
    drawSmallText("access count: "+counter,cvs.width/30,29*cvs.height/30,"WHITE");
    //draw paddles
    drawRect(user.x,user.y,user.width,user.height,user.color);
    drawRect(com.x,com.y,com.width,com.height,com.color);
    //draw ball
    drawCircle(ball.x,ball.y,ball.radious,ball.color);
}

//control user paddle and measure mouse X velocity
var prevMouseX, mouseVelocityX;
cvs.addEventListener("mousemove", movePaddle);
function movePaddle(evt){
    let rect = cvs.getBoundingClientRect();

    //shift key to hold movement
    if (!evt.shiftKey){
        user.y = event.clientY - rect.top -user.height/2;
    }
    
    currMouseX = event.clientX;
    if(prevMouseX&&currMouseX){
        mouseVelocityX = (currMouseX - prevMouseX)/(cvs.width/2);
    }
    prevMouseX = currMouseX;
}

//Listener for any key that may result useful
document.addEventListener('keypress', keyPress);
function keyPress(e){
    switch(e.code){
        case 'KeyM':
            audio.on = !audio.on;
            break;
        case 'KeyA':
            if (framePerSecond == 50) framePerSecond = 15;
            else framePerSecond = 50;
            clearInterval(interval);
            interval = setInterval(game, 1000/framePerSecond);
            break;
        case 'KeyQ':
            if (user.x == 0){
                user.x = user.forward_pos;
            }
            else user.x = 0;
            break;
        case 'KeyP':
            if (framePerSecond == 50) framePerSecond = 0.00001;
            else framePerSecond = 50;
            clearInterval(interval);
            interval = setInterval(game, 1000/framePerSecond);
            break;
    }
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
    com.speed = 0.1;
}

function nextLevel(){
    resetScore()
    com.speed += 0.1;
    if (com.speed == 1){
        resetGame();
    }
}

//ia movement logic
var forward_counter = com.forward_cooldown;
var response_time_counter = com.response_time;
function updateComPosition(){
    com.y += (ball.y - (com.y + com.height/2)) * com.speed; //updates y with 
    forward_counter-=1; //count cooldown
    //if the ball is in the other side and the cooldown off
    //calc the prob of moving forward
    if (!com.is_forward && forward_counter <= 0 && ball.x < cvs.width/2 && Math.random()<com.forward_prob){
        com.x = com.forward_pos; //move forward
        forward_counter = com.forward_cooldown;
        com.is_forward = true;
    }
    // console.log(forward_counter);
    if (com.is_forward){
        if (ball.x > com.forward_pos){//the ball surpases the player
            if (response_time_counter <= 0){//waits for response time and goes back
                com.x = cvs.width-10;
                com.is_forward = false;
                response_time_counter = com.response_time;
            }else {response_time_counter-=1}
        } else if (forward_counter <= -com.forward_prob*300 && Math.random()>com.forward_prob){//the player wants to go back
            com.x = cvs.width-10;
            com.is_forward = false;
            forward_counter = com.forward_cooldown;
        }
    }
}

//ia smash logic
var smash_counter = com.smash_cooldown;
function comHit(){
    console.log(smash_counter);
    if (smash_counter <= 0 && Math.random() < com.smash_prob){
        ball.speed = ball.speed+ball.speed*com.smash_strength;
        smash_counter = com.smash_cooldown;
    } else {smash_counter-=1;}
}


//game logic
function update(){

    //if scored
    if (ball.x + ball.radious <0){
        if (audio.on) audio.point.play();
        com.score++;
        resetBall();
        if(com.score>=10){
            resetGame();
        }
    }else if(ball.x - ball.radious > cvs.width){
        if (audio.on) audio.point.play();
        user.score++;
        resetBall();
        if(user.score >= 10){
            nextLevel();
        }
    }


    ball.x+=ball.velocityX;
    ball.y+=ball.velocityY;

    //IA player logic
    updateComPosition();

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
        //player hit the ball
        if (direction>0){
            if (audio.on) audio.grunt1.play();
            ball.speed = ball.speed+ball.speed*mouseVelocityX;
        }
        else{//com hit the ball
            comHit(); //handles the ia smashing
            if (audio.on) audio.grunt2.play();
        }

        //change vel X and Y
        ball.velocityX = direction*ball.speed*Math.cos(angleRad);
        ball.velocityY = ball.speed*Math.sin(angleRad);

        //speed increase per hit pr decrease if reaching scape velocity
        if (ball.velocityX > user.width){
            ball.speed -= 0.5
        } else{
            ball.speed += 0.5;
        }
        
    }
}

//game init
function game(){
    update();
    render();
}


//loop
var framePerSecond=50;
var interval = setInterval(game, 1000/framePerSecond);