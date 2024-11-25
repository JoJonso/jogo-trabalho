/**
    
    TELA 01: MENU DO JOGO
        - Colocar a logo X
        - Colocar o texto X
    TELA 02: JOGO EM SI 
        - Movimentação do player por mouse X
        - Atirar do player via botão do mouse
    TELA 03: GAME OVER
*/

/** OBJETOS E CLASSES */
const game = {
    display: document.querySelector("#gameDisplay"),
    scene: 0,
    gameState: 'moving',
    changeScene: function(changeScene) {
        this.scene = changeScene
    },
    FPS: 60,
    textFade: false,
    isFade: false,
    gameStarted: false,
    player: null,
    timerspawn: 0,
}
//Classe estrela 
class Star {
    speed;
    constructor(_x,_y,_speed) {
        this.element = document.createElement("div");
        this.element.className = "star";
        this.element.style.left = `${_x}px`;
        this.element.style.top = `${_y}px`;
        this.speed = _speed;
        let brightness = Math.min(30 + this.speed * 5,80);
        this.element.style.backgroundColor = `hsl(100,0%,${brightness}%)`;
    }
    moveStar() {
        const top = parseInt(getComputedStyle(this.element).top);
        this.element.style.top = `${top + this.speed}px`;
    }
    destroyStar() {
        game.display.removeChild(this.element);
    }
}

//Criando a classe Tiro
class Shoot {
    speed;
    constructor(_x,_y,_speed) {
        this.element = document.createElement("div");
        this.element.className = "shoot01";
        this.element.style.left = `${_x}px`; 
        this.element.style.top = `${_y}px`; 
        this.speed = _speed;
    }
    move() {
        const shootMove = parseInt(getComputedStyle(this.element).top);
        this.element.style.top = `${shootMove - this.speed}px`;
    }
    destroy() {
        game.display.removeChild(this.element);
    }
}
//Classe inimigo
class Enemy {
    life; //Definindo a vida da classe
    speed; //Definindo velocidade da classe
    constructor(_life,_x,_y,_speed) { //Usando um construtor para definir as variaveis iniciais do objeto
        this.element = document.createElement("div"); //Elemento do objeto = div do inimigo
        this.element.className = "enemy"; //Classe = enemy
        this.element.style.left = `${_x}px`; //Posição horizontal = (x)px --> x do constructor
        this.element.style.top = `${_y}px`; //Posição vertical = (y)px --> y do constructor
        this.speed = _speed; //Definindo velocidade do objeto = velocidade da classe do objeto
        this.life = _life; //Definindo vida do objeto = vida da classe do objeto
    } 

    move() { //Método de mover o inimigo
        const move = parseInt(getComputedStyle(this.element).top); //Constante que pega a posição top do objeto
        this.element.style.top = `${move + this.speed}px` //Definindo que a posição y do objeto = a posição + velocidade do objeto pixels
    }  
    destroy() { //Método que remove o inimigo da tela
        game.display.removeChild(this.element); //Remove o inimigo do display
    }
}

const gameDisplayRect = game.display.getBoundingClientRect();
let playerRect;
let points = 0;
let highscore = 0;

let shootGroup = [];
let enemyGroup = [];
let starGroup = [];
let chars = '0000000000';
let Spawnlimit = 120;
let enemySpeed = 2;

const song = new Audio("./sounds/song.mp3");

//** TELA 01 

//** Update de placar */
function updateBoard() {
    let charLength = chars.length - (points.toString()).length;

    let boardText = document.querySelector(".textUI");

    if ((charLength > 0) && boardText != null) {
        boardText.textContent = `SCORE: ${chars.slice(0,charLength) + points}`;
    }
    if (charLength <= 0) {
        boardText.textContent = `SCORE: ${points}`;
    }
}
//** Limpar Tela
function cleanScreen() {
    let i = gameDisplay.children.length-1;
    do {
        game.display.removeChild(gameDisplay.firstChild);
        i--;
    }while(gameDisplay.children.length > 0)
}
//** Funções de movimento do player 

//** MOVIMENTO POR MOUSE
function moveMouse(event) {
    let maxHeight = playerRect.height*2;

    //** Movimento Horizontal
    let playerMoveX = event.clientX - gameDisplayRect.left - (playerRect.width / 2);
    if (playerMoveX < 0) playerMoveX = 0;
    if (playerMoveX > gameDisplayRect.width - playerRect.width) playerMoveX = gameDisplayRect.width - playerRect.width;

    //** Movimento Verical
    let playerMoveY = event.clientY - gameDisplayRect.top - (playerRect.width / 2);
    if (playerMoveY < maxHeight) playerMoveY = maxHeight;
    if (playerMoveY > gameDisplayRect.height - playerRect.height) playerMoveY = gameDisplayRect.height - playerRect.height;

    game.player.style.top = `${playerMoveY}px`;
    game.player.style.left = `${playerMoveX}px`;

}
function movePhone(event) {
    let playerLeft = event.touches[0].clientX - gameDisplayRect.left - playerRect.width / 2;
    let playerTop = event.touches[0].clientY - gameDisplayRect.top - playerRect.height/2;

    if (playerTop < 0) playerTop = 0;
    if (playerTop > gameDisplayRect.height - playerRect.height) playerTop = gameDisplayRect.height - playerRect.height;

    if (playerLeft < 0) playerLeft = 0;
    if (playerLeft > gameDisplayRect.width - playerRect.width) playerLeft = gameDisplayRect.width - playerRect.width;

    game.player.style.top = `${playerTop}px`;
    game.player.style.left = `${playerLeft}px`;
};
//** ATIRAR PELO MOUSE
function playerShoot(event) {
    if (event.button == 0) {
        let shootX = parseInt(getComputedStyle(game.player).left)+16;
        let shootY = parseInt(getComputedStyle(game.player).top)-24;

        let shoot = new Shoot(shootX,shootY,9);
        game.display.appendChild(shoot.element);
        shootGroup.push(shoot);
        const shootAudio = new Audio('./sounds/shoot.wav');
        shootAudio.play();
        shootAudio.volume = 0.3;
    }
}
function moveShoot() {
    for (let i = 0;i<shootGroup.length;i++) {
        shootGroup[i].move();
        const shootTop = parseInt(getComputedStyle(shootGroup[i].element).top);

        if (shootTop < 0) {
            shootGroup[i].destroy();
            shootGroup.splice(i,1);
        }
    }

}
//Código de colisão de entidades
function collisionEntities(r1x,r1y,r1w,r1h,r2x,r2y,r2w,r2h) {
    if (r1x + r1w >= r2x &&     
    r1x <= r2x + r2w &&       
    r1y + r1h >= r2y &&       
    r1y <= r2y + r2h) {       
        return true;
    }
    return false;
}
/** INIMIGO  */
function spawnEnemy() { //Função de spawn do inimigo
    const enemyX = Math.min(Math.floor(Math.random()*gameDisplayRect.width+50),gameDisplayRect.width-50); //Posição aleatoria do inimigo com um ajuste de 50px pra não passar da tela (talvez passe)
    const enemy = new Enemy(1,enemyX,0,enemySpeed); //Criando um objeto novo com a posiçãoX = enemyX (posição aleatória do inimigo)
    game.display.appendChild(enemy.element); //Colocando ele dentro do display do jogo
    enemyGroup.push(enemy); //Adicionando o inimigo ao array de inimigos, todos os inimigos ficam guardados neste array
}
function updateEnemy() { //Função que move o inimigo
    for(let i = 0;i<enemyGroup.length;i++) {
        enemyGroup[i].move();
        let enemytop = parseInt(getComputedStyle(enemyGroup[i].element).top); //Pego a posição de todos os inimigos

        if (enemytop >= gameDisplayRect.height) { //Se a posição de um inimigo for maior que a tela do display do jogo
            enemyGroup[i].destroy(); //Ativa o método destroy do objeto
            enemyGroup.splice(i,1); //Remove o inimigo do grupo de inimigos
            break;
        }
        if (enemyGroup[i].life <= 0) {
            const explosion = new Audio('./sounds/explosion.wav');
            explosion.play();
            enemyGroup[i].destroy(); //Ativa o método destroy do objeto
            points += 10;
            enemyGroup.splice(i,1); //Remove o inimigo do grupo de inimigos
            break;

        }

        const enemyRect = enemyGroup[i].element.getBoundingClientRect();
        const playerCollision = game.player.getBoundingClientRect();
        if (collisionEntities(enemyRect.x,enemyRect.y,enemyRect.width,enemyRect.height,playerCollision.x,playerCollision.y,playerCollision.width,playerCollision.height) == true) {
            if (game.player) {
                game.display.removeChild(game.player);
                game.player = null;
            }
            loadGameOver();
            break;
        }
        for(let j = 0;j<shootGroup.length;j++) {
            const shootRect = shootGroup[j].element.getBoundingClientRect();

            if (collisionEntities(enemyRect.x,enemyRect.y,enemyRect.width,enemyRect.height,shootRect.x,shootRect.y,shootRect.width,shootRect.height) == true) {
                enemyGroup[i].life -= 1;
                game.display.removeChild(shootGroup[j].element);
                shootGroup.splice(j,1);
                break;
            }
        }
    }

}
//** Código das estrelas
function createStar() {
    const starX = Math.floor(Math.random()*game.display.getBoundingClientRect().width);
    const starY = -10;
    const speed = Math.floor(Math.random()*10);

    const star = new Star(starX,starY,speed);
    game.display.appendChild(star.element);
    starGroup.push(star);
}
function updateStar() {
    for(let i = 0;i<starGroup.length;i++) {
        let limit = game.display.getBoundingClientRect().height;
        starGroup[i].moveStar();
        let starTop = parseFloat(starGroup[i].element.style.top)
        if (starTop >= limit) {
            starGroup[i].destroyStar();
            starGroup.splice(i,1);  
        }
    }
}
//* Colisão com o player


//** Carregar cenas
function loadScene01() {
    highscore = Number(localStorage.getItem("highscore",highscore));
    game.display.style.backgroundColor = 'black';
    let logo = document.createElement("div");
    let text = document.createElement("h1");
    text.textContent = "Clique ou toque para jogar!";
    text.className = "texto";
    logo.className = "logo";

    game.display.appendChild(logo);
    game.display.appendChild(text);
    skipScene01();
}
function loadScene02() {
    //UI 
    if (!game.player) {
        song.play();
        song.loop = true;
        let board = document.createElement("div");
        let text = document.createElement("h1");
        text.className = "textUI";
        text.textContent = "Score: 0000000000";
        board.className = 'board';
        board.appendChild(text);
    
        //Player na cena
        let player = document.createElement("div");
        player.style.left = '46.875%';
        player.style.top = '75%';
        
        player.className = "player";
        game.display.appendChild(board);
        game.display.appendChild(player);
        game.player = player;
        playerRect = game.player.getBoundingClientRect();
    
        document.addEventListener("mousemove",moveMouse);
        document.addEventListener("touchmove",movePhone);
        document.addEventListener("touchstart",playerShoot);
        document.addEventListener("mousedown",playerShoot);

    }
}
function loadGameOver() {
    game.changeScene(2);
    game.gameStarted = false;
    document.removeEventListener("mousemove", moveMouse);
    document.removeEventListener("mousedown", playerShoot);
    document.removeEventListener("touchmove", movePhone);
    document.removeEventListener("touchstart", playerShoot);

    game.gameState = "frozen";

    const gameOver = document.createElement("div");
    const scoreUI = document.createElement("div");
    const gameOverText = document.createElement("h1");
    const playAgain = document.createElement("p");
    const scoreText = document.createElement("p");
    const highScoreText = document.createElement("p");

    gameOver.className = 'gameover';
    scoreText.className = 'texto-pequeno';
    highScoreText.className = 'texto-pequeno';
    gameOverText.className = 'texto-grande';
    playAgain.className = 'texto-pequeno';
    scoreUI.className = 'div-score';

    playAgain.textContent = "Toque ou clique para jogar novamente";
    scoreUI.appendChild(highScoreText);     
    scoreUI.appendChild(scoreText);
    scoreUI.appendChild(playAgain);


    gameOverText.textContent = 'GAME OVER!';
    scoreText.textContent = `Score: ${(chars.slice(0,chars.length-points.toString().length) + points.toString())}`;
    highScoreText.textContent = `Highscore: ${(chars.slice(0,chars.length-highscore.toString().length) + highscore)}`;

    gameOver.appendChild(scoreUI);
    gameOver.appendChild(gameOverText);
   
    game.display.appendChild(gameOver);


    localStorage.setItem("highscore", highscore.toString());
    game.display.addEventListener("mousedown",restartGame);
    game.display.addEventListener("touchstart",restartGame);

}
function restartGame() {
    cleanScreen();
    points = 0;
    enemyGroup = [];
    shootGroup = [];
    starGroup = [];
    Spawnlimit = 120;
    enemySpeed = 2;
    game.changeScene(1);
    game.gameState = 'moving';
    game.gameStarted = false;
    loadScene02();
    game.display.removeEventListener("mousedown", restartGame);
    game.display.removeEventListener("touchstart", restartGame);

}


//** Pular cena 01
function skipScene01() {
    game.display.addEventListener("mousedown",() => {
        if (!game.isFade) {
            game.isFade = true;
            let textInterval = setInterval(() => {
                let textElement = document.querySelector(".texto");
                game.textFade = !(game.textFade);
                if (!game.textFade) {
                    textElement.style.display = "block";
                }else {
                    textElement.style.display = "none";
                }
            },200);
            setTimeout(() => {
                clearInterval(textInterval);
                cleanScreen();
                game.changeScene(1);
            }, 1500);   
        }
    })
    game.display.addEventListener("touchstart", () => {
        if (!game.isFade) {
            game.isFade = true;
            let textInterval = setInterval(() => {
                let textElement = document.querySelector(".texto");
                game.textFade = !(game.textFade);
                if (!game.textFade) {
                    textElement.style.display = "block";
                }else {
                    textElement.style.display = "none";
                }
            },200);
            setTimeout(() => {
                clearInterval(textInterval);
                cleanScreen();
                game.changeScene(1);
            }, 1500);   
        }
    })
}
//** Load (Ao carregar a página)
window.addEventListener("load",loadScene01);


//** Gameloop
function gameLoop() {
    //Evento
    if (!game.gameStarted) {
        if (game.scene == 1) {
            loadScene02(); 
            game.gameStarted = true;
        }
    }else {
        if (game.gameState == "moving") {
            game.timerspawn++;
            if (game.timerspawn%10 == 0) {
                createStar();
            }
            if (game.timerspawn%Spawnlimit == 0 && game.timerspawn != 0) {
                Spawnlimit = Math.max(Spawnlimit - 5, 15);
                enemySpeed = Math.min(enemySpeed + .5,7);
                spawnEnemy();
            }
            if (game.timerspawn%200 == 0) {
                game.timerspawn = 0;
            }
        }
    }
    if (game.scene == 1) {
        if (game.gameState == "moving") {
            if (points > highscore) {
                highscore = points;
            }
            updateBoard();
            if (enemyGroup.length > 0) {
                updateEnemy(); //Coloca a função de mover inimigo para rodar toda hora
            }
            if (shootGroup.length > 0) {
                moveShoot();
            }
            if (starGroup.length > 0) {
                updateStar();
            }
        }
    }
}
setInterval(gameLoop,1000/game.FPS);


