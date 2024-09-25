const gridContainer = document.getElementById("gridId");
const gridColRow = 8
const gridCells = [];
const gridDict = {1:0,2:0,3:0,4:0,5:0,6:0}
var score = 0
let performanceIndex = 0;
var roundsCompleted = 0
let currentStage = 'setup'
let hunterModel = ''
let obstacleModel = ''

let equalyLikely = true

let noTreasure = true

// Create grid 

function grid() {
    for (let row = 0; row < gridColRow; row++) {
        for (let column = 0; column < gridColRow; column++) {
            const gridItem = document.createElement("div");
            gridItem.classList.add("grid-item");
            gridItem.setAttribute("id", `${row}${column}`);
            gridItem.setAttribute('name', 'empty');
            gridItem.textContent = " ";
            gridCells.push(gridItem);
            gridContainer.appendChild(gridItem);
        }
    }
}
grid();


function emptyGrid(){
    var randomRow = Math.floor(Math.random() * gridColRow);
    var randomCol = Math.floor(Math.random() * gridColRow);

    // Get the cell at the random position
    var cellId = `${randomRow}${randomCol}`;
    var cell = document.getElementById(cellId);
    cell.setAttribute("name", "emptyGrid");

}
emptyGrid()


let hunterRowPosition = 0;
let hunterColumnPosition = 0;

const occupiedCells = new Set();
console.log('occupiedCells',occupiedCells)

function randomHunterSetup() {
    // Generate random row and column
    var randomRow = Math.floor(Math.random() * 4);
    var randomCol = Math.floor(Math.random() * 4);

    // Get the cell at the random position
    var cellId = `${randomRow}${randomCol}`;
    var cell = document.getElementById(cellId);

    if (cell && !occupiedCells.has(cellId)) {
        // Set hunter attributes
        cell.setAttribute("name", "hunter");
        cell.innerHTML = "&#129312;"; // Hunter emoji

        // Update global hunter position variables
        hunterRowPosition = randomRow;
        hunterColumnPosition = randomCol;

        // Mark cell as occupied
        occupiedCells.add(cellId);
    } else {
        // Retry if the cell is already occupied
        randomHunterSetup();
    }
}
randomHunterSetup();

function randomObstacleSetup() {
    const obstacleCount = 10;
    let placedObstacles = 0;

    while (placedObstacles < obstacleCount) {
        var randomRow = Math.floor(Math.random() * gridColRow);
        var randomCol = Math.floor(Math.random() * gridColRow);

        // Get the cell at the random position
        var cellId = `${randomRow}${randomCol}`;
        var cell = document.getElementById(cellId);

        if (cell && !occupiedCells.has(cellId)) {
            // Set obstacle attributes
            cell.setAttribute("name", "obstacle");
            cell.innerHTML = "&#128507;"; // Obstacle emoji

            // Mark cell as occupied
            occupiedCells.add(cellId);

            // Increment the count of placed obstacles
            placedObstacles++;
        }
    }
}
randomObstacleSetup();

function randomTreasureSetup() {
    const treasureValues = [1, 2, 3, 4, 5, 6];
    let treasurePool = [];

    // Populate the treasure pool with each treasure value repeated 3 times
    treasureValues.forEach(value => {
        for (let i = 0; i < 3; i++) {
            treasurePool.push(value);
        }
    });

    // Shuffle the treasure pool
    treasurePool = treasurePool.sort(() => Math.random() - 0.5);

    let treasureIndex = 0;
    while (treasureIndex < treasurePool.length) {
        var randomRow = Math.floor(Math.random() * gridColRow);
        var randomCol = Math.floor(Math.random() * gridColRow);

        // Get the cell at the random position
        var cellId = `${randomRow}${randomCol}`;
        var cell = document.getElementById(cellId);

        if (cell && !occupiedCells.has(cellId)) {
            const treasureValue = treasurePool[treasureIndex];
            cell.textContent = treasureValue;
            cell.setAttribute("name", "treasure");
            cell.classList.add('treasureCoin');
            gridDict[treasureValue] = (gridDict[treasureValue] || 0) + 1;

            // Mark cell as occupied
            occupiedCells.add(cellId);

            // Move to the next treasure
            treasureIndex++;
        }
    }
}
randomTreasureSetup();

function randomTreasureObstacle(treasureValues){
    
    // const treasureValues = [1, 2, 3, 4, 5, 6];

    // Select a random treasure value
    const treasureValue = treasureValues[Math.floor(Math.random() * treasureValues.length)];
    console.log('treasureValue',treasureValue)

    let placed = false;
    while (!placed) {
        var randomRow = Math.floor(Math.random() * gridColRow);
        var randomCol = Math.floor(Math.random() * gridColRow);

        // Get the cell at the random position
        var cellId = `${randomRow}${randomCol}`;
        var cell = document.getElementById(cellId);

        if (cell && !occupiedCells.has(cellId)) {
            if(equalyLikely){
                cell.textContent = treasureValue;
                cell.setAttribute("name", "treasure");
                cell.classList.add('treasureCoin');
                gridDict[treasureValue] = (gridDict[treasureValue] || 0) + 1;
                equalyLikely = false
            }else{
                cell.setAttribute("name", "obstacle");
                // cell.classList.add('treasureCoin');
                cell.innerHTML = "&#128507"
                obstacleModel = cell.innerHTML
                cell.textContent = obstacleModel;
                equalyLikely = true
            }
            

            // Mark cell as occupied
            occupiedCells.add(cellId);

            // Mark as placed to exit the loop
            placed = true;
        }
    }
}

const hunterTreasureBag = [];
function hunterMovement() {
    document.addEventListener("keydown", function(event) {

        if (currentStage === 'end') {
            // Ignore key presses when the game is in the 'end' state
            return;
        }
        const key = event.key.toLowerCase();
        let newRow = hunterRowPosition;
        let newColumn = hunterColumnPosition;
        const errorElement = document.getElementById('error');
        errorElement.textContent = '';
        switch(key) {
            case 'w':
                newRow = hunterRowPosition - 1;
                break;
            case 'a':
                newColumn = hunterColumnPosition - 1;
                break;
            case 's':
                newRow = hunterRowPosition + 1;
                break;
            case 'd':
                newColumn = hunterColumnPosition + 1;
                break;
            default:
                dialogueBox('Invalid key pressed! Use W, A, S, or D to move the hunter.')
                return;
        }

        // Check if the new position is within grid boundaries
        if (newRow < 0 || newRow >= gridColRow || newColumn < 0 || newColumn >= gridColRow) {
            // var text  = "Cannot move beyond grid boundaries!"
            dialogueBox("Cannot move beyond grid boundaries!")
            return;
        }

        // Check if the new position is an obstacle
        const nextCell = document.getElementById(`${newRow}${newColumn}`);
        const typeName = nextCell.getAttribute('name');
        if (typeName && typeName === "obstacle") {
            dialogueBox('Cannot move to an obstacle cell!');
            return;
        }
        

        // Clear current cell
        const currentCell = document.getElementById(`${hunterRowPosition}${hunterColumnPosition}`);
        currentCell.textContent = ''; 
        currentCell.classList.remove('hunterModel');

        // Move the hunter to the new cell
        hunterRowPosition = newRow;
        hunterColumnPosition = newColumn;
        const newHunterCell = document.getElementById(`${hunterRowPosition}${hunterColumnPosition}`);
        predObstacle(hunterRowPosition,hunterColumnPosition)
        var coinValue = newHunterCell.textContent
        // console.log('coinValue',typeof(coinValue))
        newHunterCell.innerHTML = "&#129312;"; // Replace with your hunter model (emoji or character)
        newHunterCell.classList.add('hunterModel');
        newHunterCell.classList.remove('treasureCoin')
        // if(coinValue in [1,2,3,4,5,6]){
        //     console.log('here')
        //     randomTreasure(coinValue)
        //     occupiedCells.delete(`${hunterRowPosition}${hunterColumnPosition}`);
        // }
            
        const validCoinValues = ['1', '2', '3', '4', '5', '6'];
        if (validCoinValues.includes(coinValue)) {
            console.log('here');
            // debugger
            randomTreasureObstacle(coinValue);
            occupiedCells.delete(`${hunterRowPosition}${hunterColumnPosition}`);
            document.getElementById("MessageHeader").style.display = 'none'
            document.getElementById("Message").style.display = 'none'
            if(hunterTreasureBag.length <= 2){
                hunterTreasureBag.push(coinValue)
                updateTreasureDisplay()
                if(hunterTreasureBag.length == 3){
                    CaculateTreasure(hunterTreasureBag)
                }
            }else{
                // alert('You have reached the maximum treasure bag capacity of 3')
                // CaculateTreasure(hunterTreasureBag)
                // console.log('hunterTreasureBag1',hunterTreasureBag)
                // Remove all elements using splice
                hunterTreasureBag.splice(0, hunterTreasureBag.length);
                hunterTreasureBag.push(coinValue)
                updateTreasureDisplay()
                
                // console.log('hunterTreasureBag2',hunterTreasureBag)
            }
        }
        // Update game status or other logic here
        roundsCompleted++;
        updateStatus();
    });
}
hunterMovement()

//Bag of treasure display
function updateTreasureDisplay() {
    const treasureBagElement = document.getElementById('hunterTreasureBag');
    treasureBagElement.textContent = `[${hunterTreasureBag.join(', ')}]`;
}

function CaculateTreasure(...valuesInTreasureBag){
    // console.log('CaculateTreasure hunterTreasureBag',valuesInTreasureBag)
    var num1 = +valuesInTreasureBag[0][0]
    var num2 = +valuesInTreasureBag[0][1]
    var num3 = +valuesInTreasureBag[0][2]

    // Create an array of the numbers
    const numbers = [num1, num2, num3];

    // Sort the array in ascending order
    numbers.sort((a, b) => a - b);
    // console.log('numbers',numbers)

    var smallest = numbers[0]
    // console.log('smallest',smallest)

    var run = false
    if(numbers[0]+1 == numbers[1] & numbers[1]+1 == numbers[2]){
        run = true
    }else{
        run = false
    }

    let points = 0
    var sum = num1+num2+num3
    const casesUsed = document.getElementById('Message');
    document.getElementById("MessageHeader").style.display = 'block'
    document.getElementById("Message").style.display = 'block'
    console.log('num1',num1)
    if((num1 == num2) && (num2 == num3)){
        console.log('cond1')
        points = 300 + sum
        
        casesUsed.textContent= `When all three treasures have same values 300 + ${hunterTreasureBag.join(' + ')} = ${points}`
    }else if(num1==num2 || num2==num3 || num3==num1){
        console.log('cond2')
        points = 200 + sum
        casesUsed.textContent= `Two but not 3 treasures have same values 200 + ${hunterTreasureBag.join(' + ')} = ${points}`
    }else if(run == true){
        console.log('cond3')
        points = 100 + sum
        casesUsed.textContent= `A run 100 + ${hunterTreasureBag.join(' + ')} = ${points}`
    }else if((num1!=num2) && (num2!=num3) && (num3!=num1)){
        console.log('cond4')
        points = sum
        casesUsed.textContent= `All treasures have different values, but it is not a run ${hunterTreasureBag.join(' + ')} = ${points}`
    }
    score += points

    console.log('points',points)

}

document.getElementById("status").style.display = 'block'
document.getElementById("roundsCompleted").textContent = roundsCompleted;

// Update status function
function updateStatus() {
    document.getElementById("roundsCompleted").textContent = roundsCompleted;
    document.getElementById("score").textContent = score 
    document.getElementById("performanceIndex").textContent = performanceIndex;

    const treasureKeys = [5,6,7,8];
    noTreasure = treasureKeys.every(key => gridDict[key] === 0)
}




// end play stage
function endGame(){
    currentStage = 'end';
    performanceIndexCalc()
    document.getElementById("status").style.display = 'block'
    document.getElementById("performanceIndexP").style.display = 'block'
    document.getElementById("finaltag").style.display = 'block'
    document.getElementById("endSetupButton").style.display = 'none'
    updateStatus()

}
// Predict is hunter blocked
function predObstacle(newRow,newColumn){

    const adjacentCells = [
        { x: +newRow - 1, y: +newColumn }, // Up
        { x: +newRow + 1, y: +newColumn }, // Down
        { x: +newRow, y: +newColumn - 1 }, // Left
        { x: +newRow, y: +newColumn + 1 }  // Right
    ];
    for (var cell of adjacentCells) {
        console.log('cell',cell)
        var nextCell = document.getElementById(`${cell.x}${cell.y}`);
        console.log('nextCell',nextCell)
        if(cell.x > 0 && cell.y > 0 && cell.x < 7 && cell.y < 7){
            typeName = nextCell.getAttribute('name');
            if(typeName === "obstacle"){
            // endGame()
                console.log('plpl')
            
            }

        }
        
    }
}



// Caculate Performance Index
function performanceIndexCalc(){
    if (roundsCompleted>0){
        performanceIndex = (score/roundsCompleted).toFixed(2)
    }
}

function dialogueBox(dialogue){
    document.getElementById("dialogueBox").style.display = 'block'
    document.getElementById("dialogueBox-message").innerText = dialogue
    currentStage =  'end'
}
function closeDialogueBox(){
    document.getElementById("dialogueBox").style.display = 'none'
    currentStage = 'play'
}

// References
// w3School
// StackOverflow
