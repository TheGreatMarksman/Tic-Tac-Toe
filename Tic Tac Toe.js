'use strict';
//import {Screen} from 'cheese.js';
//var screen = new Screen();
//screen.ctx.beginPath();
//screen.ctx.fillStyle = "gray";
//screen.ctx.fillRect(SCREEN_WIDTH-50, 0, 50, SCREEN_HEIGHT);

//---------------------------------------------------------------------------
// CONSTANTS
//---------------------------------------------------------------------------

const SCREEN_WIDTH = 1000;
const SCREEN_HEIGHT = 900;
//console.log(screen.width)
const WINDOW_SCREEN_DIFFERENCE = (screen.width/2)-(SCREEN_WIDTH/2) - 9;
//console.log("diff " + WINDOW_SCREEN_DIFFERENCE);
const TILE_WIDTH = 250;
const TILE_HEIGHT = 250;
//---------------------------------------------------------------------------
// GLOBALS
//---------------------------------------------------------------------------
var canvas;
var ctx;

var tiles = [];
var board = Array(3);
for(let i = 0; i < board.length; i++){
    board[i] = new Array(3);
}
var tilesLoaded = 0;
//console.log("length" + board.length + " " + board[0].length);
//board[0][0] = 0;
//console.log("board " + board[0][0]);
 
var playersTurn = true;
var turnNumber = 0;

var count = 0;

//FOLLOWING TWO COMMENTS ARE A WAY OF TESTING THE RECURSION THROUGH CONSOLE LOGS
// var dummyString = "xo--x---o";
// console.log("Here is the board:");
// printBoard(dummyString, "");
// console.log("Marcursion: " + marcursion(dummyString, "o"));

// let scores = [];
//  //var moves = Array(9).fill({value:-7});
//     for(let i = 0; i < dummyString.length; i++){
//         if(dummyString.substr(i, i+1) == "-"){
//             let option = replaceAt(dummyString, i, "x");
//             //console.log("Here is an option: ");
//             scores[i] = marcursion(option, "o");
//         }
//     }
//     let bestScore = null;
//     let bestIndex = null;
//     if(scores.length != 9) scores[8] = undefined;

//     let map = "";
//     for(let i = 0; i < scores.length; i++){
//         //console.log("scores " + scores[i]);
//         if(typeof scores[i] == "undefined"){ map += "-";
//         }else{
//             if(scores[i] == -1) map += "!";
//             else map += scores[i];
//         }
//     }
//     console.log("Each moves points");
//     printBoard(map);

//     for(let i = 0; i < scores.length; i++){
//         if(bestScore == null && scores[i] != null){
//             bestScore = scores[i];
//             bestIndex = i;
//         }
//         //console.log("This move's placement is " + i + " and it is scored " + scores[i]);
//         if(scores[i] > bestScore){
//             //console.log(scores[i] + " is higher than " + bestScore + " so " + scores[i] + " becomes the next best choice");
//             bestScore = scores[i];
//             bestIndex = i;
//         }
//     }

//     console.log("the best choice is " + bestIndex);
//     if(bestScore == -1) console.log("X can't force a win");
//     if(bestScore == 0) console.log("X can force a tie");
//     if(bestScore == 1) console.log("X can force a win");


//---------------------------------------------------------------------------
// INTERRUPTS
//---------------------------------------------------------------------------
document.addEventListener("mousedown", event => {
    //console.log("not clicking tower");
    //console.log(screen.width);
    //console.log("x " + (event.clientX-WINDOW_SCREEN_DIFFERENCE) + " y " + event.clientY);
    //console.log("clientx " + (event.clientX) + " clienty " + event.clientY);
    //let cheese = document.getElementById("game").style.margin;
    //console.log(cheese);
    if(playersTurn){
        for(let i = 0; i < tiles.length; i++){
            if(clickingTile(i, event.clientX-WINDOW_SCREEN_DIFFERENCE, event.clientY) && tiles[i].getStatus() == "blank"){
            //if(clickingTile(i, event.clientX, event.clientY)){
                //console.log("clicking " + i);
                //console.log("x " + (event.clientX-WINDOW_SCREEN_DIFFERENCE) + " y " + event.clientY);
                tiles[i].setStatus("O");
                if(gameResult() == "won"){
                    console.log("endgame");
                    endGame("won");
                }else{
                    playersTurn = false;
                    opponentsTurn();
                }
                //console.log("tile clicked");
            }
        }
    }
});


//---------------------------------------------------------------------------
// CLASS Tile
//---------------------------------------------------------------------------
class Tile{
    constructor(left, top, width, height){
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.status = "blank";
        this.image = new Image(TILE_WIDTH, TILE_HEIGHT);
        this.image.src = "Blank Tile.png";
        /*
        this.image.addEventListener("load", function(){
            tilesLoaded++;
            if(tilesLoaded == 9){
                drawScreen();
                console.log("fully loaded");
            }
        }, {once: true});
        */
        
    }
    getStatus(){ return this.status; }
    setImage(image){ this.image = image; }
    setStatus(status){
        this.status = status;
        this.image = new Image(TILE_WIDTH, TILE_HEIGHT);
        if(status == "O"){
            this.image.src = "O Tile.png";
        }else if(status == "X"){
            this.image.src = "X Tile.png";
        }
    }
    draw(){
        ctx.drawImage(
            this.image,                 //actually spritesheet
            0, 0, //start of current sprite (x, y) on spritesheet
            200, 200,  //width, height(on spritesheet)
            this.left, this.top, //position of sprite on canvas (x, y)
            TILE_WIDTH, //width on canvas (stretched to fit)
            TILE_HEIGHT, //height on canvas (stretched to fit)
        );
    }
}

//---------------------------------------------------------------------------
// ACTUAL GAME
//---------------------------------------------------------------------------

function setUp(){
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
}

function createWorld(){
    for(let i = 0; i < board.length; i++){
        for(let j = 0; j < board[0].length; j++){
            board[i][j] = { tile: 0 };
        }
    }

    let left = 0;
    let top = 0;
    for(let i = 0; i < 9; i++){
        //console.log(i + "  left=" + left + ", top=" + top);
        tiles[i] = new Tile(left, top, TILE_WIDTH, TILE_HEIGHT);
        if((i+1) % 3 == 0){
            left = 0;
            top += TILE_HEIGHT + 10;
        }else{ left += TILE_HEIGHT + 10; }
        //Filling board
        let row = Math.floor(i/3);
        let column = i % 3;
        board[row][column].tile = i;
   }
   prepareImages();
}

function prepareImages(){
    let picturesLoaded = 0;
    let loader = function(){
        picturesLoaded++;
        if(picturesLoaded >= 3) drawScreen();
    };
   let blankPicture = new Image();
   blankPicture.src = "Blank Tile.png";
   blankPicture.addEventListener("load", loader, {once: true});
   let XPicture = new Image();
   XPicture.src = "X Tile.png";
   XPicture.addEventListener("load", loader, {once: true});
   let OPicture = new Image();
   OPicture.src = "O Tile.png";
   OPicture.addEventListener("load", loader, {once: true});
}

function drawScreen(){
    //console.log("drawScreen");
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    for(let i = 0; i < 9; i++){
        //console.log("tile ", i, ": ", tiles[i].status);
        tiles[i].draw();
    }
}

function clickingTile(id, mouseX, mouseY){
    let withinLeft = (mouseX <= tiles[id].left+TILE_WIDTH);
    let withinRight = (mouseX >= tiles[id].left);
    let withinTop = (mouseY <= tiles[id].top+TILE_HEIGHT);
    let withinBottom = (mouseY >= tiles[id].top);
    if(withinLeft && withinRight && withinTop && withinBottom) return true;
    return false;
}

function opponentsTurn(){
    //while(playersTurn == false){
        if(turnNumber >= 4){
            //console.log("4");
            playersTurn = true;
            turnNumber ++;
            endGame("tied");
        }
        let number = chooseOpponentTile();
        //console.log("status " + tiles[number].getStatus());
        if(number != null && tiles[number].getStatus() == "blank"){
            tiles[number].setStatus("X");
            drawScreen();
            console.log("drawScreen() in opponentsTurn()");
            playersTurn = true;
            turnNumber ++;
            if(gameResult() == "lost") endGame("lost");
            //console.log("turn " + turnNumber);
        }
    //}
}

function chooseOpponentTile(){
    //console.log("choosing tile");
    let scenario = "";
    for(let i = 0; i < board.length; i++){
        for(let j = 0; j < board[0].length; j++){
            //console.log("board " + tiles[board[i][j].tile].status);
            if(tiles[board[i][j].tile].status == "X") scenario += "x";
            if(tiles[board[i][j].tile].status == "O") scenario += "o";
            if(tiles[board[i][j].tile].status == "blank") scenario += "-";
        }
    }
    //console.log("scenario length " + scenario.length);
    //console.log(scenario);
    console.assert(scenario.length == 9, "scenario length is not equal to nine");

    let scores = [];
    for(let i = 0; i < scenario.length; i++){
        //console.log("scenario " + scenario[i]);
        if(scenario.substring(i, i+1) == "-") scores[i] = evaluate(replaceAt(scenario, i, "x"), "o");
    }
    if(scores.length != 9) scores[8] = undefined;

    //THIS PRINTS THE SCORES OF THE COMPUTER'S CHOICES
    /*
    let map = "";
    for(let i = 0; i < scores.length; i++){
        //console.log("scores " + scores[i]);
        if(typeof scores[i] == "undefined"){ map += "-";
        }else{
            if(scores[i] == -1) map += "!";
            else map += scores[i];
        }
    }
    printBoard(map);
    */

    //console.log("scores " + scores);
    //console.log("scores length " + scores.length);
    let bestScore = null;
    let bestIndex = null;
    for(let i = 0; i < scores.length; i++){
        if(bestScore == null && scores[i] != null){
            bestScore = scores[i];
            bestIndex = i;
        }
        //console.log("score: " + i + " points: " + scores[i]);
        if(scores[i] > bestScore){
            bestScore = scores[i];
            bestIndex = i;
        }
    }
    // if(bestScore == -1) console.log("X can't force a win");
    // if(bestScore == 0) console.log("X can force a tie");
    // if(bestScore == 1) console.log("X can force a win");
    //console.log("final choice " + bestIndex);
    return bestIndex;

    //return randomNumber(0, 8);
}

function evaluate(scenario, whoseTurn, level = 0){
    level ++;
    let indent = ("Level " + level + "          ").substring(0, 10);
    for(let i = 0; i < level-1; i++) indent += "    ";
    //if(level == 1) printBoard(scenario, indent);
    //if(level == 1) console.log(level + " " + scenario);
    if(score(scenario) != null) return score(scenario);
    let bestScore = null;
    for(let i = 0; i < scenario.length; i++){
        if(scenario.substring(i, i+1) == "-"){
            if(whoseTurn == "x"){
                // replaces a blank tile in string with x and recursing
                let score = evaluate(replaceAt(scenario, i, "x"), "o", level);
                if(score > bestScore || bestScore == null) bestScore = score;
                //console.log("x best score " + bestScore);
            }else{
                let score = evaluate(replaceAt(scenario, i, "o"), "x", level);
                if(score < bestScore || bestScore == null) bestScore = score;
                //console.log("o best score " + bestScore);
            }
        }
    }
    //console.log("absolute best score " + bestScore);
    return bestScore;
}

function marcursion(scenario, whoseTurn, level = 0){
    level ++;
    let indent = ("Level " + level + "          ").substring(0, 10);
    for(let i = 0; i < level-1; i++) indent += "    ";
    printBoard(scenario, indent);
    //if(level < 5) printBoard(scenario, indent);
    if(score(scenario) != null) return score(scenario);
    let bestScore = null;
    for(let i = 0; i < scenario.length; i++){
        if(scenario.substring(i, i+1) == "-"){
            if(whoseTurn == "x"){
                //console.log("x's turn");
                //if(level < 4) console.log(indent + "x's turn");
                // replaces a blank tile in string with x and recursing
                let score = marcursion(replaceAt(scenario, i, "x"), "o", level);
                console.assert(typeof score !== "undefined", "score is not defined");
                //if(level < 5) console.log(indent + "x score " + score);
                /*
                if(level == 1){
                    if(score == 1) console.log(indent + "x can win");
                    if(score == 0) console.log(indent + "x can tie");
                    if(score == -1) console.log(indent + "x can lose");
                }
                */
                //console.log(indent + "x score " + score);
                if(score > bestScore || bestScore == null) bestScore = score;
                //console.log(indent + "x best score " + bestScore);
            }else{
                //console.log("o's turn");
                //if(level < 4) console.log(indent + "o's turn");
                let score = marcursion(replaceAt(scenario, i, "o"), "x", level);
                console.assert(typeof score !== "undefined", "score is not defined");
                //if(level < 5) console.log(indent + "o score " + score);
                /*
                if(level == 1){
                    if(score == 1) console.log(indent + "o can lose");
                    if(score == 0) console.log(indent + "o can tie");
                    if(score == -1) console.log(indent + "o can win");
                }
                */
                //console.log(indent + "o score " + score);
                if(score < bestScore || bestScore == null) bestScore = score;
                //console.log(indent + "o best score " + bestScore);
            }
            //if(level < 4) console.log(indent + "bestScore " + bestScore);
        }
    }
    //console.log("absolute best score " + bestScore);
    return bestScore;
}

function replaceAt(string, index, replacement){
    let part1 = string.substring(0, index);
    let part2 = string.substring(index+1, string.length);
    return part1 + replacement + part2;
}

function printBoard(string, indent = ""){
    console.log(indent + string.substring(0, 3));
    console.log(indent + string.substring(3, 6));
    console.log(indent + string.substring(6, 9));
}

function score(futureBoard){
    //horizontal
    //console.log("horizontal");
    for(let i = 0; i < 3; i ++){
        if(futureBoard.substring(i*3, (i*3)+3) == "ooo") return -1;
        if(futureBoard.substring(i*3, (i*3)+3) == "xxx") return 1;
    }
    
    //vertical
    //console.log("vertical");
    for(let i = 0; i < 3; i++){
        let string1 = futureBoard.substring(i, i+1);
        let string2 = futureBoard.substring(i+3, i+4);
        let string3 = futureBoard.substring(i+6, i+7);
        if(string1 == "o" && string2 == "o" && string3 == "o") return -1;
        if(string1 == "x" && string2 == "x" && string3 == "x") return 1;
    }
    
    //diagonal
    //console.log("diagonal");
    let string1 = futureBoard.substring(0, 1);
    let string2 = futureBoard.substring(4, 5);
    let string3 = futureBoard.substring(8, 9);
    if(string1 == "o" && string2 == "o" && string3 == "o") return -1;
    if(string1 == "x" && string2 == "x" && string3 == "x") return 1;

    string1 = futureBoard.substring(2, 3);
    string2 = futureBoard.substring(4, 5);
    string3 = futureBoard.substring(6, 7);
    if(string1 == "o" && string2 == "o" && string3 == "o") return -1;
    if(string1 == "x" && string2 == "x" && string3 == "x") return 1;
    
    //tie
    if(futureBoard.indexOf("-") < 0){
        return 0;
    }

    //undetermined
    return null;
}

function endGame(result){
    playersTurn = false;
    drawScreen();
    ctx.fillRect(TILE_WIDTH + 10, TILE_HEIGHT + TILE_HEIGHT/3 + 10, TILE_WIDTH, TILE_HEIGHT/3);
    ctx.font = "30px Arial";
    ctx.fillStyle = "blue";
    if(result == "won") ctx.fillText("YOU WON!", TILE_WIDTH + TILE_WIDTH/4, TILE_HEIGHT + TILE_HEIGHT/2 + 20);
    if(result == "lost") ctx.fillText("YOU LOST", TILE_WIDTH + TILE_WIDTH/4, TILE_HEIGHT + TILE_HEIGHT/2 + 20);
    if(result == "tied") ctx.fillText("YOU TIED", TILE_WIDTH + TILE_WIDTH/4, TILE_HEIGHT + TILE_HEIGHT/2 + 20);
    //console.log("evaluate " + evaluateBoard());
}

function gameResult(){
    //return false;
    if(turnNumber >= 2){
        //console.log("gameResult");
        if(checkVerticalLines() == "won") return "won";
        if(checkVerticalLines() == "lost") return "lost";
        if(checkHorizontalLines() == "won") return "won";
        if(checkHorizontalLines() == "lost") return "lost";
        if(checkDiagonalLines() == "won") return "won";
        if(checkDiagonalLines() == "lost") return "lost";
    }
    return "";
}

function checkVerticalLines(){
    for(let i = 0; i < board[0].length; i++){
        let string1 = tiles[board[0][i].tile].status;
        let string2 = tiles[board[1][i].tile].status;
        let string3 = tiles[board[2][i].tile].status;
        if(string1 == "O" && string2 == "O" && string3 == "O") return "won";
        if(string1 == "X" && string2 == "X" && string3 == "X") return "lost";
    }
    return "";
}

function checkHorizontalLines(){
    for(let i = 0; i < board.length; i++){
        let string1 = tiles[board[i][0].tile].status;
        let string2 = tiles[board[i][1].tile].status;
        let string3 = tiles[board[i][2].tile].status;
        if(string1 == "O" && string2 == "O" && string3 == "O") return "won";
        if(string1 == "X" && string2 == "X" && string3 == "X") return "lost";
    }
    return "";
}

function checkDiagonalLines(){
    let string1 = tiles[board[0][0].tile].status;
    let string2 = tiles[board[1][1].tile].status;
    let string3 = tiles[board[2][2].tile].status;
    if(string1 == "O" && string2 == "O" && string3 == "O") return "won";
    if(string1 == "X" && string2 == "X" && string3 == "X") return "lost";

    string1 = tiles[board[0][2].tile].status;
    string3 = tiles[board[2][0].tile].status;
    if(string1 == "O" && string2 == "O" && string3 == "O") return "won";
    if(string1 == "X" && string2 == "X" && string3 == "X") return "lost";
    return "";
}

function randomNumber(num1, num2){
    return Math.floor(Math.random() * (num2 - num1 + 1) ) + num1;
}

function twoScore(futureBoard){
    //horizontal
    //console.log("horizontal");
    for(let i = 0; i < 2; i ++){
        if(futureBoard.substring(i*2, (i*2)+2) == "oo") return -1;
        if(futureBoard.substring(i*2, (i*2)+2) == "xx") return 1;
    }
    
    //vertical
    //console.log("vertical");
    for(let i = 0; i < 2; i++){
        let string1 = futureBoard.substring(i, i+1);
        let string2 = futureBoard.substring(i+2, i+3);
        if(string1 == "o" && string2 == "o") return 0;
        if(string1 == "x" && string2 == "x") return 0;
    }
    
    //diagonal
    //console.log("diagonal");
    let string1 = futureBoard.substring(0, 1);
    let string2 = futureBoard.substring(3, 4);
    if(string1 == "o" && string2 == "o") return -2;
    if(string1 == "x" && string2 == "x") return 2;

    string1 = futureBoard.substring(1, 2);
    string2 = futureBoard.substring(2, 3);
    if(string1 == "o" && string2 == "o") return -2;
    if(string1 == "x" && string2 == "x") return 2;
    
    //tie
    if(futureBoard.indexOf("-") < 0){
        return 0;
    }
    //undetermined
    return null;
}

function twoTestRecursion(string, whoseTurn){
    //COMPUTER IS X!!!
    //console.log(string + " score = " + randomNumber(1, 4));
    let tileScores = [];
    for(let i = 0; i < tileScores.length; i++) tileScores[i] = "-";
    //let lastString = string;

    for(let i = 0; i < string.length; i++){
        if(string.substring(i, i+1) == "-"){
            if(whoseTurn == "x"){
                //console.log("Adding x to position " + i);
                if(twoScore(string) != null){
                    console.log("scored " + string + ": result " + twoScore(string));
                    tileScores[i] = twoScore(string);
                    cheese[i] = tileScores[i];
                }
                // replaces a blank tile in string with x and recursing
                twoTestRecursion(replaceAt(string, i, "x"), "o");
            }else{
                //console.log("Adding o to position " + i);
                if(twoScore(string) != null){
                    console.log("scored " + string + ": result " + twoScore(string));
                    tileScores[i] = twoScore(string);
                    cheese[i] = tileScores[i];
                }
                twoTestRecursion(replaceAt(string, i, "o"), "x");
            }
        }
    }
    if(tileScores.indexOf("-") < 0){
        console.log("I'm done. Here is the moves");
        for(let i = 0; i < tileScores.length; i++) console.log("tileScores " + tileScores[i]);
    }
    //for(let i = 0; i < tileScores.length; i++) console.log("tile " + i + " " + tileScores[i]);
    return "";
}

function archiveRecursion(string, whoseTurn){
    console.log(string);
    for(let i = 0; i < string.length; i++){
        if(string.substring(i, i+1) == "-"){
            if(whoseTurn == "x"){
                // replaces a blank tile in string with x and recursing
                archiveRecursion(replaceAt(string, i, "x"), "o");
            }else{
                archiveRecursion(replaceAt(string, i, "o"), "x");
            }
        }
    }
}

function archiveMarcursion(string, whoseTurn){
    console.log(string);
    if(score(string) != null) return score(string);
    //let possibleScores = [];
    let bestScore = 0;
    for(let i = 0; i < string.length; i++){
        if(string.substring(i, i+1) == "-"){
            if(whoseTurn == "x"){
                // replaces a blank tile in string with x and recursing
                let score = archiveMarcursion(replaceAt(string, i, "x"), "o");
                if(score > bestScore) bestScore = score;
                console.log("x best score " + bestScore);
            }else{
                let score = archiveMarcursion(replaceAt(string, i, "o"), "x");
                if(score < bestScore) bestScore = score;
                console.log("o best score " + bestScore);
            }
        }
    }
    /*
    console.assert(possibleMoves.length > 0 );
    bestMove = possibleMoves[0];
    for(let i = 0; i < possibleMoves.length; i++){
        if(possibleMoves[i]> bestMove) bestMove = possibleMoves[i];
    }
    */
    return bestScore;
}

//---------------------------------------------------------------------------
// MAIN
//---------------------------------------------------------------------------

setUp();
createWorld();
/*
window.addEventListener("load", function() {
    drawScreen();
}, {once: true});
*/
//drawScreen();