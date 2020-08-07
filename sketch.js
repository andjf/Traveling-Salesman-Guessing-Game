const NUMBER_OF_POINTS = 8;
const NUMBER_OF_PERMUTATIONS = factorial(NUMBER_OF_POINTS);

var CIRCLE_STROKE_WEIGHT;
var TOP_BAR_HEIGHT;

var myFont;

function preload() {myFont = loadFont("aller.ttf");}

var points = Array(NUMBER_OF_POINTS);
var pointsRadii = Array(NUMBER_OF_POINTS);
var optimalIndexOrder = Array(NUMBER_OF_POINTS);

var playerIndexOrder = Array(NUMBER_OF_POINTS);
var currentIndexInPlayerOrder = 0;

var shouldDrawBestPath = false;
var bestPath = -1;

function setup() {
    createCanvas(windowWidth, windowHeight);
    const MINIMUM_RADIUS = 25 / 700 * height;
    const MAXIMUM_RADIUS = 50 / 700 * height;
    
    TOP_BAR_HEIGHT = 75 / 700 * height
    CIRCLE_STROKE_WEIGHT = 3 / 700 * height
    
    for(var i = 0; i < NUMBER_OF_POINTS; i++) {
        playerIndexOrder[i] = null;
        proposedRadius = random(MINIMUM_RADIUS, MAXIMUM_RADIUS);
        proposedPoint = createVector(random(proposedRadius + CIRCLE_STROKE_WEIGHT, width - proposedRadius - CIRCLE_STROKE_WEIGHT), random(proposedRadius + CIRCLE_STROKE_WEIGHT + TOP_BAR_HEIGHT, height - proposedRadius - CIRCLE_STROKE_WEIGHT));
        var whileCounter = 0;
        while(touchingOtherCircle(proposedPoint, proposedRadius, points, pointsRadii) && whileCounter < 50) {
            proposedPoint = createVector(random(proposedRadius + CIRCLE_STROKE_WEIGHT, width - proposedRadius - CIRCLE_STROKE_WEIGHT), random(proposedRadius + CIRCLE_STROKE_WEIGHT + TOP_BAR_HEIGHT, height - proposedRadius - CIRCLE_STROKE_WEIGHT));
            whileCounter++;
        }
        points[i] = proposedPoint;
        pointsRadii[i] = proposedRadius;
    }
    textFont(myFont);
}

function touchingOtherCircle(position, radius, arrayOfOtherPoints, arrayOfRadii) {
    for(var i = 0; i < arrayOfOtherPoints.length; i++) {
        if(arrayOfOtherPoints[i] != null && dist(position.x, position.y, arrayOfOtherPoints[i].x, arrayOfOtherPoints[i].y) <= radius + arrayOfRadii[i] + 2 * CIRCLE_STROKE_WEIGHT) {
            return true;
        }
    }
    return false;
}

function distanceOfPathFromIndexArray(indexArrayForDistance) {
    var runningDist = 0;
    for(var i = 0; i < indexArrayForDistance.length; i++) {
        if(indexArrayForDistance[i + 1] == null) {
            return runningDist;
        }
        runningDist += dist(points[indexArrayForDistance[i]].x, points[indexArrayForDistance[i]].y, points[indexArrayForDistance[i + 1]].x, points[indexArrayForDistance[i + 1]].y);
    }
    return runningDist;
}

function draw() {
    background(20);
    
    drawTopBar();
    
    if(playerIndexOrder[1] != null) {
        textSize(TOP_BAR_HEIGHT * 0.25)
        textAlign(LEFT, BOTTOM);
        noStroke();
        fill(255);
        text("Your distance: " + nf(distanceOfPathFromIndexArray(playerIndexOrder), 0, 2), CIRCLE_STROKE_WEIGHT * 2, height - CIRCLE_STROKE_WEIGHT * 2);
    }
    
    if(shouldDrawBestPath) {
        if(bestPath == -1) {
            bestPath = bestIndexPath();
        } else {
            drawPathFromIndexOrder(bestPath, CIRCLE_STROKE_WEIGHT * 5, color(255, 255, 0));
        }
    }
    drawPathFromIndexOrder(playerIndexOrder);
    
    fill(20);
    stroke(color(50, 168, 82));
    strokeWeight(CIRCLE_STROKE_WEIGHT);
    for(var i = 0; i < NUMBER_OF_POINTS; i++) {
        fill(playerIndexOrder.indexOf(i) == -1 ? 20 : 50);
        circle(points[i].x, points[i].y, pointsRadii[i] * 2);
    }
    
    if(shouldDrawBestPath) {
        textSize(TOP_BAR_HEIGHT * 0.25)
        textAlign(RIGHT, BOTTOM);
        noStroke();
        fill(color(255, 255, 0));
        text("Optimal distance: " + nf(distanceOfPathFromIndexArray(bestPath), 0, 2), width - CIRCLE_STROKE_WEIGHT * 2, height - CIRCLE_STROKE_WEIGHT * 2);
        
        textAlign(CENTER, BOTTOM);
        
        var stringToDisplay;
        if(pathsAreEquivalent(bestPath, playerIndexOrder)) {
            stringToDisplay = "You got the optimal path!"; 
        } else {
            stringToDisplay = "Your path is " + nf((distanceOfPathFromIndexArray(playerIndexOrder) / distanceOfPathFromIndexArray(bestPath) - 1) * 100, 0, 2) + "% longer";
        }
        fill(255, 100);
        rect(width / 2 - ((textWidth(stringToDisplay) + CIRCLE_STROKE_WEIGHT * 3) / 2), height - CIRCLE_STROKE_WEIGHT * 2 - (TOP_BAR_HEIGHT * 0.25 * 1.1), textWidth(stringToDisplay) + CIRCLE_STROKE_WEIGHT * 3, TOP_BAR_HEIGHT * 0.25 * 1.1);
        fill(color(15, 184, 0));
        text(stringToDisplay, width / 2, height - CIRCLE_STROKE_WEIGHT * 2);
    }
}

function pathsAreEquivalent(indexPath1, indexPath2) {
    return pathsAreEquivalentSpecific(indexPath1, indexPath2) || pathsAreEquivalentSpecific(reverse(indexPath1), indexPath2)
}

function pathsAreEquivalentSpecific(indexPath1, indexPath2) {
    if(indexPath1.length == indexPath2.length) {
        for(var i = 0; i < indexPath1.length; i++) {
            if(indexPath1[i] != indexPath2[i]) {
                return false;
            }
        }
        return true;
    } else {
        return false;
    }
}

function drawTopBar() {
    noStroke();
    fill(color(50, 168, 162));
    rect(0, 0, width / 3, TOP_BAR_HEIGHT);
    
    fill(color(50, 146, 168));
    rect(width / 3, 0, width / 3, TOP_BAR_HEIGHT);
    
    fill(color(50, 125, 168));
    rect(2 * width / 3, 0, width / 3, TOP_BAR_HEIGHT);
    
    fill(255);
    textSize(TOP_BAR_HEIGHT * 0.75)
    textAlign(CENTER, CENTER);
    text("Check", width / 6, TOP_BAR_HEIGHT * 0.45);
    
    fill(color(255, 0, 0, (playerIndexOrder.indexOf(null) != -1) * 255));
    rectMode(CENTER);
    rect(width / 6, TOP_BAR_HEIGHT * 0.6, textWidth("Check") * 1.1, TOP_BAR_HEIGHT / 10);
    rectMode(CORNER);
    
    fill(255);
    text("Clear", width * 5 / 6, TOP_BAR_HEIGHT * 0.45);
    
    fill(255);
    text("Reset", width / 2, TOP_BAR_HEIGHT * 0.45);
}

function drawPathFromIndexOrder(indexOrderToDraw, pathStrokeWeight=CIRCLE_STROKE_WEIGHT*2, pathStrokeColor=color(50, 168, 162)) {
    beginShape();
    for(var i = 0; i < indexOrderToDraw.length; i++) {
        if(indexOrderToDraw[i] != null) {
            vertex(points[indexOrderToDraw[i]].x, points[indexOrderToDraw[i]].y);
        }
    }
    noFill();
    stroke(pathStrokeColor);
    strokeWeight(pathStrokeWeight);
    endShape();
}

function factorial(n) {
    return n == 1 ? 1 : n * factorial(n - 1);
}

function arrayOfIndicesMouseIsOver() {
    var toReturn = [];
    for(var i = 0; i < NUMBER_OF_POINTS; i++) {
        if(dist(mouseX, mouseY, points[i].x, points[i].y) <= pointsRadii[i]) {
            toReturn.push(i);
        }
    }
    return toReturn;
}

function clearPoints() {
    playerIndexOrder = new Array(NUMBER_OF_POINTS).fill(null);
    shouldDrawBestPath = false;
    currentIndexInPlayerOrder = 0;
}

function resetPoints() {
    points = Array(NUMBER_OF_POINTS);
    pointsRadii = Array(NUMBER_OF_POINTS);
    optimalIndexOrder = Array(NUMBER_OF_POINTS);
    
    playerIndexOrder = Array(NUMBER_OF_POINTS);
    currentIndexInPlayerOrder = 0;
    
    shouldDrawBestPath = false;
    bestPath = -1;
    
    clearPoints();
    const MINIMUM_RADIUS = 25 / 700 * height;
    const MAXIMUM_RADIUS = 50 / 700 * height;
    
    for(var i = 0; i < NUMBER_OF_POINTS; i++) {
        playerIndexOrder[i] = null;
        proposedRadius = random(MINIMUM_RADIUS, MAXIMUM_RADIUS);
        proposedPoint = createVector(random(proposedRadius + CIRCLE_STROKE_WEIGHT, width - proposedRadius - CIRCLE_STROKE_WEIGHT), random(proposedRadius + CIRCLE_STROKE_WEIGHT + TOP_BAR_HEIGHT, height - proposedRadius - CIRCLE_STROKE_WEIGHT));
        var whileCounter = 0;
        while(touchingOtherCircle(proposedPoint, proposedRadius, points, pointsRadii) && whileCounter < 50) {
            proposedPoint = createVector(random(proposedRadius + CIRCLE_STROKE_WEIGHT, width - proposedRadius - CIRCLE_STROKE_WEIGHT), random(proposedRadius + CIRCLE_STROKE_WEIGHT + TOP_BAR_HEIGHT, height - proposedRadius - CIRCLE_STROKE_WEIGHT));
            whileCounter++;
        }
        points[i] = proposedPoint;
        pointsRadii[i] = proposedRadius;
    }
}

function mousePressed() {
    if(mouseY <= TOP_BAR_HEIGHT) {
        if(mouseX < width / 3) {
            if(playerIndexOrder.indexOf(null) == -1) {
                shouldDrawBestPath = true;
            }
        } else if(mouseX < 2 * width / 3) {
            resetPoints();
        } else {
            clearPoints();
        }
    } else {
        if(arrayOfIndicesMouseIsOver().length != 0) {
            const trueIndex = max(arrayOfIndicesMouseIsOver());
            if(playerIndexOrder.indexOf(trueIndex) == -1) {
                playerIndexOrder[currentIndexInPlayerOrder] = trueIndex;
                currentIndexInPlayerOrder++;
            } else {
                currentIndexInPlayerOrder = playerIndexOrder.indexOf(trueIndex);
                currentIndexInPlayerOrder += currentIndexInPlayerOrder != 0;
                for(var i = currentIndexInPlayerOrder; i < NUMBER_OF_POINTS; i++) {
                    playerIndexOrder[i] = null;
                    shouldDrawBestPath = false;
                }
            }
        }
    }
}

function bestIndexPath() {
    var bestPathSoFar = Array(NUMBER_OF_POINTS).fill().map((x,i)=>i);
    var bestDistanceSoFar = distanceOfPathFromIndexArray(bestPathSoFar);
    
    var currentIndexOrder = bestPathSoFar.slice();
    var currentDistance = distanceOfPathFromIndexArray(currentIndexOrder);
    for(var i = 0; i < NUMBER_OF_PERMUTATIONS; i++) {
        if(nextIndexOrderIteration(currentIndexOrder) != -1) {
            currentIndexOrder = nextIndexOrderIteration(currentIndexOrder);
            if(distanceOfPathFromIndexArray(currentIndexOrder) < bestDistanceSoFar) {
                bestDistanceSoFar = distanceOfPathFromIndexArray(currentIndexOrder);
                bestPathSoFar = currentIndexOrder.slice();
            }
        } else {
            return bestPathSoFar;
        }
    }
}

// With help from Michal Forišek's explaination
// https://www.quora.com/How-would-you-explain-an-algorithm-that-generates-permutations-using-lexicographic-ordering
function nextIndexOrderIteration(indexOrder) {
    var toReturn = indexOrder.slice();
    var largestX = -1;
    for(let i = 0; i < NUMBER_OF_POINTS - 1; i++) {
        if(indexOrder[i] < indexOrder[i + 1]) {
            largestX = i;
        }
    }
    if(largestX == -1) {
        return -1;
    } else {
        var largestY = -1;
        for(var i = 0; i < NUMBER_OF_POINTS; i++) {
            if(toReturn[largestX] < toReturn[i]) {
                largestY = i;
            }
        }
        swap(toReturn, largestX, largestY);
        var endSection = toReturn.splice(largestX + 1);
        reverse(endSection);
        toReturn = concat(toReturn, endSection);
    }
    return toReturn;
}

function swap(arr, i1, i2) {
    var temp = arr[i1]
    arr[i1] = arr[i2];
    arr[i2] = temp;
}
