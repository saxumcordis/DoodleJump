/* jshint esversion: 6 */
let game;
    window.onload = function start(){
        game = new Phaser.Game(500, 500, Phaser.CANVAS, ' ', {
            preload: preload,
            create: create,
            update: update,
            render: render
    });
}

let player;
let platform;
let platformsGroup;
let gameOver;
let version = 'Menu';
let maxPlayerHeight = -400;

let leftButton;
let rightButton;

let backgroundDay;
let backgroundNight;

//#b2b22b -- color background
function preload(){

    game.load.image('backgroundDay','Assets/backgroundDay6.jpg');
    game.load.image('backgroundNight', 'Assets/backgroundNight.jpg');
    change_font('#314980');
    game.load.image('divider', 'Assets/divider.png');
    game.load.image('platform','Assets/platform.png');
    game.load.image('player','Assets/player.png');
    game.load.image('playerJump','Assets/playerJump.png');
    game.load.image('platformMove','Assets/platformMove.png');


}
function dayMode()
{
    game.stage.backgroundColor = '#BEC1BA';
    change_font('#314980');
    backgroundNight.alpha = 0;
}
function nightMode()
{
    game.stage.backgroundColor = '#000000';
    change_font('#314980');
    backgroundNight.alpha = 1;
}
function create(){
    leftButton = game.input.keyboard.addKey(Phaser.Keyboard.A);
    rightButton = game.input.keyboard.addKey(Phaser.Keyboard.D);
   backgroundDay = game.add.tileSprite(0, -40, 500, 600, 'backgroundDay');
   backgroundDay.alpha = 1;
   backgroundNight = game.add.tileSprite(0, 0, 1010, 600, 'backgroundNight');
   backgroundDay.fixedToCamera = true;
   backgroundNight.fixedToCamera = true;
   divider = game.add.tileSprite(330, 0, 400, 600, 'divider');
   divider.fixedToCamera = true;

    let day = game.add.text(148, 20, "DAYMODE", { font: "bold 21px", fill: "#fefffd", align: "center" });
    let night = game.add.text(270, 20, "NIGHTMODE", { font: "bold 21px", fill: "#fefffd", align: "center" });
    day.fixedToCamera = true;
    day.inputEnabled = true;
    night.fixedToCamera = true;
    night.inputEnabled = true;
    day.events.onInputDown.add(dayMode,this);
    night.events.onInputDown.add(nightMode,this);



    platformsGroup = game.add.physicsGroup(Phaser.Physics.ARCADE);

    //Create an intitial platform, create 6 random platforms afterward to initialize
    platform = game.add.sprite(100, 400, 'platform');
        platformsGroup.add(platform);
        platform.body.immovable = true;
   for (let i = 0; i < 6; i++) {
       platform = game.add.sprite(((Math.random() * 400)+ 50),platformsGroup.children[platformsGroup.children.length-1].y-((Math.random() * 100) + 50), 'platform');
       platformsGroup.add(platform);
        platform.body.immovable = true;
    }

   headerMenu();

    player = game.add.sprite(100,300, 'player');
    player.scale.setTo(.25,.25);
    game.physics.arcade.enable(player);
    player.body.gravity.y = 900;
    player.body.width.x = 3;

}

function update(){

    //Creates world
    game.world.setBounds(0, player.y - 500, 500, 1000);
    if (player.y < game.camera.y +200){
        game.camera.y = player.y -200;
    }

    //Player only collides with platforms if they are moving downward
    if((player.body.velocity.y > 0)){
        game.physics.arcade.collide(platformsGroup, player);
    }

    //Move left or right when A or D is pressed
    if(leftButton.isDown){
        player.body.velocity.x = -300;
    } else if(rightButton.isDown){
        player.body.velocity.x = 300;
    } else {
        player.body.velocity.x = 0;
    }



    //Bounce when hitting a platform
    if(player.body.touching.down || player.body.blocked.down){
        player.body.velocity.y = -600;
        player.loadTexture('playerJump');
        game.time.events.add(500, function() {
            player.loadTexture('player')

        })
    }

    //Scroll around the sides of the world
    if(player.body.x < -25){
        player.body.x = 525
    } else if(player.body.x > 526){
        player.body.x = -24
    }

    //Kill the player if it drops below the camera
    if(player.body.y >= game.camera.y+500){
        player.kill();
        gameOver = true;
    }

    //Remove platforms that are below the camera
    for (let i = 0; i < platformsGroup.children.length; i++) {
        if (platformsGroup.children[i].y >= game.camera.y + 500) {
            platformsGroup.children[i].destroy();
            --i;
        }
    }

    //When the highest platform is near the top of camera, generate a new platform between 0 and 150 pixels above it
    if(typeof platformsGroup.children[platformsGroup.children.length-1] != 'undefined' && platformsGroup.children[platformsGroup.children.length-1].y >= game.camera.y - 100){
        platform = game.add.sprite(((Math.random() * 360)+ 10),platformsGroup.children[platformsGroup.children.length-1].y-((Math.random() * 100) + 50), 'platform');
        platformsGroup.add(platform);
        platform.body.immovable = true;
        if((Math.random() * 10) < 2){
            platform.loadTexture('platformMove');
            platform.body.velocity.x = (Math.random() * 150 + 100);
            if (Math.random() < 0.5) {
                platform.body.velocity.x *= -1;
            }
        }
    }

    //Moving platforms
    for(let i=0; i < platformsGroup.children.length; i++){
        if(platformsGroup.children[i].key == 'platformMove'){
            if(platformsGroup.children[i].body.x > 371) {
                platformsGroup.children[i].body.velocity.x *= -1;
            } else if(platformsGroup.children[i].body.x < 11) {
                platformsGroup.children[i].body.velocity.x *= -1;
            }
        }
    }

    //Track score
    if(-1*(player.y) >= maxPlayerHeight){

    heightText.text = 'Score: ' + Math.round(-1*(player.y) + 300);
    maxPlayerHeight = Math.round(-1*(player.y));
    }

    //Do this when the player dies
    if(gameOver == true){
        platformsGroup.destroy(true);
        pushScore(heightText.text);
    }
}

function reset(){
    console.log('resetting');

    platformsGroup.destroy(true);
    heightText.destroy(true);
    menuButton.destroy(true);
    
    platformsGroup = game.add.physicsGroup(Phaser.Physics.ARCADE);
    //generate starting platforms
    platform = game.add.sprite(100, 400, 'platform');
    platformsGroup.add(platform);
    platform.body.immovable = true;

   for (let i = 0; i < 6; i++) {
       platform = game.add.sprite(((Math.random() * 400)+ 50),platformsGroup.children[platformsGroup.children.length-1].y-((Math.random() * 100) + 50), 'platform');
       platformsGroup.add(platform);
       platform.body.immovable = true;
    }

    headerMenu();

    player.revive();
    player.body.x = 100;
    player.body.y = 300;

    game.world.setBounds(0, player.y - 500, 500, 1000);
    game.camera.y = 0;

    gameOver = false;
}


let scoreArray = localStorage.getItem('items') ? JSON.parse(localStorage.getItem('items')) : [];
localStorage.setItem('items', JSON.stringify(scoreArray));



function pushScore(){

    scoreArray.push(parseInt(heightText.text.slice(7)));
    localStorage.setItem('items', JSON.stringify(scoreArray));
    platformsGroup.destroy(true);
    heightText.destroy(true);
    menuButton.destroy(true);

    if (confirm("Заново? При нажатии 'Отмена' вы перейдёте в главное меню"))
        reset();
    else
        location.href = "../index.html";
}
const scoreUL = document.querySelector('ul');
function uploadScore()
{

    for (let i = 0; (i < scoreArray.length && i < 15); ++i)
    {
        let li = document.createElement('li');
        li.textContent = scoreArray.sort((a,b)=>(b-a))[i];
        scoreUL.appendChild(li);
    }
}
function buttonListeners()
{
    const clearButton = document.getElementById('clearButton');
    clearButton.addEventListener('click', function(){
        localStorage.clear();
        while (scoreUL.firstChild)
        {
            scoreUL.removeChild(scoreUL.firstChild);
        }
        scoreArray = [];
    });

    const menuButton = document.getElementById('menuButton');
    menuButton.addEventListener('click', function () {
        location.href = "../index.html";
    });
}

function    headerMenu()
{
    menuButton = game.add.text(430,20, version, {
        font: 'bold 21px',
        fill: '#ffffff'
    });
    menuButton.fixedToCamera = true;
    menuButton.inputEnabled = true;
    menuButton.events.onInputDown.add(function () {
        location.href = "../index.html";
    }, this);
    heightText = game.add.text(20, 20, "Score: 0", {
        font: 'bold 21px',
        fill: '#fefffd'
    });
    heightText.fixedToCamera = true;
    heightText.cameraOffset.setTo(20,20);
}

let colorArray = localStorage.getItem('items') ? JSON.parse(localStorage.getItem('items')) : [];
localStorage.setItem('items', JSON.stringify(colorArray));

function pushColor(obj)
{
    colorArray.push(obj);
    localStorage.setItem('items', JSON.stringify(colorArray));
}

function popColor()
{
    colorArray.pop();
}


function render(){

}