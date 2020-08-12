// define constants to be used throughout the program 
const NUMBER_OF_POINTS = 8;
const NUMBER_OF_PERMUTATIONS = factorial(NUMBER_OF_POINTS);

// variables that are initialized after 
// the canvas is created for visuals
var CIRCLE_STROKE_WEIGHT;
var TOP_BAR_HEIGHT;

// the font to be used for the text
var myFont;

// preload function loads the font
function preload() {myFont = loadFont("aller.ttf");}

// points array stores the vector objects of 
// all of the positions of the points
var points = Array(NUMBER_OF_POINTS);
// pointsRadii stores the radii of the points 
// with the same index in the points array
var pointsRadii = Array(NUMBER_OF_POINTS);
// array that is the order of indices going through the 
// points list that represents the shortest path
// Ex: [5, 2, 4, 6, 1, 3, 0, 7]
var optimalIndexOrder = Array(NUMBER_OF_POINTS);

// array that stores the indices, in order, of 
// the points that the player has selected 
var playerIndexOrder = Array(NUMBER_OF_POINTS).fill(null);
var currentIndexInPlayerOrder = 0;

// boolean that keeps track of whether the
// optimal path should be drawn
var shouldDrawBestPath = false;
// eventual array that stores the most
// optimal order of the indices
var bestPath = -1;

function setup() {
    textFont(myFont);
    createCanvas(windowWidth, windowHeight);
    const MINIMUM_RADIUS = 25 / 700 * height;
    const MAXIMUM_RADIUS = 50 / 700 * height;

    TOP_BAR_HEIGHT = 75 / 700 * height
    CIRCLE_STROKE_WEIGHT = 3 / 700 * height

    
    // loop fills the "points" and "pointsRadii" arrays
    for(var i = 0; i < NUMBER_OF_POINTS; i++) {
        // generates a radius between some minimum and maximum 
        // that is the proposed radius for the point that is 
        // currently being inspected (this does not change)
        var proposedRadius = random(MINIMUM_RADIUS, MAXIMUM_RADIUS);

        // vector object at the top left valid point for a 
        // point to be created with a certain proposedRadius
        const topLeft = createVector(
            proposedRadius + CIRCLE_STROKE_WEIGHT, 
            proposedRadius + CIRCLE_STROKE_WEIGHT + TOP_BAR_HEIGHT
        ); 

        // vector object at the bottom right valid point for a 
        // point to be created with a certain proposedRadius
        const bottomRight = createVector(
            width - proposedRadius - CIRCLE_STROKE_WEIGHT, 
            height - proposedRadius - CIRCLE_STROKE_WEIGHT
        )
        
        var proposedPoint = randomPointInBounds(topLeft, bottomRight);
        // attempts to find a position for the point on the screen that is not 
        // intersecting with another existing circle, but if it cannot find a 
        // suitable position within 50 tries, it just gives it a random position 
        // on the screen. This ensures that if the screen is too small to fit all 
        // of the circles, the program won't get stuck in an infinite loop
        var whileCounter = 0;
        while(touchingOtherCircle(proposedPoint, proposedRadius, points, pointsRadii) && whileCounter < 50) {
            proposedPoint = randomPointInBounds(topLeft, bottomRight);
            whileCounter++;
        }
        points[i] = proposedPoint;
        pointsRadii[i] = proposedRadius;
    }
}

// returns a vector of a point within the bounds specified
// by the top left and bottom right points of a rectangle
function randomPointInBounds(p1, p2) {
    return createVector(random(p1.x, p2.x), random(p1.y, p2.y));
}

// function return true if a point with a given position 
// and radius would intersect with any other point inside 
// of a given array of points with given radii
function touchingOtherCircle(position, radius, arrayOfOtherPoints, arrayOfRadii) {
    for(var i = 0; i < arrayOfOtherPoints.length; i++) {
        if(arrayOfOtherPoints[i] != null && dist(position.x, position.y, arrayOfOtherPoints[i].x, arrayOfOtherPoints[i].y) <= radius + arrayOfRadii[i] + 2 * CIRCLE_STROKE_WEIGHT) {
            return true;
        }
    }
    return false;
}

// given a certain order of indices as an array, it will calculate 
// the distance of that path throughout the array of points
function distanceGivenIndexOrder(order) {
    var runningDist = 0;
    for(var i = 0; i < order.length; i++) {
        if(order[i + 1] == null) {
            return runningDist;
        }
        runningDist += points[order[i]].dist(points[order[i + 1]]);
    }
    return runningDist;
}

function draw() {
    background(20);
    
    drawTopBar();
    
    // if the player has selected at least 
    // 2 points, display the distance
    if(playerIndexOrder[1] != null) {
        textSize(TOP_BAR_HEIGHT * 0.25)
        textAlign(LEFT, BOTTOM);
        noStroke();
        fill(255);
        text("Your distance: " +
            nf(distanceGivenIndexOrder(playerIndexOrder), 0, 2),
            CIRCLE_STROKE_WEIGHT * 2, 
            height - CIRCLE_STROKE_WEIGHT * 2
        );
    }
    
    // if the best path should be drawn, draw it
    if(shouldDrawBestPath) {
        if(bestPath == -1) {
            bestPath = bestIndexPath();
        } else {
            drawPathFromIndexOrder(bestPath, CIRCLE_STROKE_WEIGHT * 5, color(255, 255, 0));
        }
    }
    
    // draws the player's path
    drawPathFromIndexOrder(playerIndexOrder);
    
    // draws the points based on if 
    // they have been "selected" or not
    fill(20);
    stroke(color(50, 168, 82));
    strokeWeight(CIRCLE_STROKE_WEIGHT);
    for(var i = 0; i < NUMBER_OF_POINTS; i++) {
        fill(playerIndexOrder.indexOf(i) == -1 ? 20 : 50);
        circle(points[i].x, points[i].y, pointsRadii[i] * 2);
    }
    
    // if the player has selected to check their path, 
    // it will change shouldDrawBestPath variable to 
    // true and display some information about their 
    // path and the optimal path
    if(shouldDrawBestPath) {
        textSize(TOP_BAR_HEIGHT * 0.25)
        textAlign(RIGHT, BOTTOM);
        noStroke();
        fill(color(255, 255, 0));
        text("Optimal distance: " + nf(distanceGivenIndexOrder(bestPath), 0, 2), width - CIRCLE_STROKE_WEIGHT * 2, height - CIRCLE_STROKE_WEIGHT * 2);
        
        textAlign(CENTER, BOTTOM);
        
        var stringToDisplay;
        if(pathsAreEquivalent(bestPath, playerIndexOrder)) {
            stringToDisplay = "You got the optimal path!"; 
        } else {
            stringToDisplay = "Your path is " + nf((distanceGivenIndexOrder(playerIndexOrder) / distanceGivenIndexOrder(bestPath) - 1) * 100, 0, 2) + "% longer";
        }
        fill(255, 100);
        rect(width / 2 - ((textWidth(stringToDisplay) + CIRCLE_STROKE_WEIGHT * 3) / 2), height - CIRCLE_STROKE_WEIGHT * 2 - (TOP_BAR_HEIGHT * 0.25 * 1.1), textWidth(stringToDisplay) + CIRCLE_STROKE_WEIGHT * 3, TOP_BAR_HEIGHT * 0.25 * 1.1);
        fill(color(15, 184, 0));
        text(stringToDisplay, width / 2, height - CIRCLE_STROKE_WEIGHT * 2);
    }
}

// returns whether the paths are truly equivalent
function pathsAreEquivalent(indexPath1, indexPath2) {
    return pathsAreEquivalentSpecificOrder(indexPath1, indexPath2) || pathsAreEquivalentSpecificOrder(reverse(indexPath1), indexPath2)
}

// returns whether the paths are truly equivalent with order dependency
function pathsAreEquivalentSpecificOrder(indexPath1, indexPath2) {
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

// draws the top bar and it's buttons
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
    
    text("Reset", width / 2, TOP_BAR_HEIGHT * 0.45);
}

// draws a path given the index order that the path should be drawn in
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

// returns an array of indices of all the 
// displayed circles that the mouse is over
function arrayOfIndicesMouseIsOver() {
    var toReturn = [];
    for(var i = 0; i < NUMBER_OF_POINTS; i++) {
        if(dist(mouseX, mouseY, points[i].x, points[i].y) <= pointsRadii[i]) {
            toReturn.push(i);
        }
    }
    return toReturn;
}

// clears the player's chosen path
function clearPoints() {
    playerIndexOrder = new Array(NUMBER_OF_POINTS).fill(null);
    shouldDrawBestPath = false;
    currentIndexInPlayerOrder = 0;
}

// randomizes the points just like at the beginning of the program in setup
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
    
    // for comments, reference setup()
    for(var i = 0; i < NUMBER_OF_POINTS; i++) {
        var proposedRadius = random(MINIMUM_RADIUS, MAXIMUM_RADIUS);
        const topLeft = createVector(
            proposedRadius + CIRCLE_STROKE_WEIGHT, 
            proposedRadius + CIRCLE_STROKE_WEIGHT + TOP_BAR_HEIGHT
        ); 
        const bottomRight = createVector(
            width - proposedRadius - CIRCLE_STROKE_WEIGHT, 
            height - proposedRadius - CIRCLE_STROKE_WEIGHT
        )
        var proposedPoint = randomPointInBounds(topLeft, bottomRight);
        var whileCounter = 0;
        while(touchingOtherCircle(proposedPoint, proposedRadius, points, pointsRadii) && whileCounter < 50) {
            proposedPoint = randomPointInBounds(topLeft, bottomRight);
            whileCounter++;
        }
        points[i] = proposedPoint;
        pointsRadii[i] = proposedRadius;
    }
}

// checks if any of the buttons are pressed or 
// if any of the circles are being selected
function mousePressed() {
    if(mouseY <= TOP_BAR_HEIGHT) {
        /*|      CHECK        |      RESET       |       CLEAR       |*/
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
            // checks if the circle that was selected is already selected
            if(playerIndexOrder.indexOf(trueIndex) == -1) {
                // if the circle is not selected, select it
                playerIndexOrder[currentIndexInPlayerOrder] = trueIndex;
                currentIndexInPlayerOrder++;
            } else {
                // if the circle is selected, make that 
                // the last selected point in the player's path
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

// returns an array of indices that represents 
// the most optimal path through the given points
function bestIndexPath() {
    var bestPathSoFar = Array(NUMBER_OF_POINTS).fill().map((x,i)=>i);
    var bestDistanceSoFar = distanceGivenIndexOrder(bestPathSoFar);
    var currentIndexOrder = bestPathSoFar.slice();
    var currentDistance = distanceGivenIndexOrder(currentIndexOrder);
    
    // goes through every single possibility of path orientation
    for(var i = 0; i < NUMBER_OF_PERMUTATIONS; i++) {
        // if there is no next order iteration, you 
        // have checked all of the possible paths
        if(nextIndexOrderIteration(currentIndexOrder) != -1) {
            // iterate the current index order that is being inspected
            currentIndexOrder = nextIndexOrderIteration(currentIndexOrder);
            // checks if the current path is more optimal than the current optimal path
            if(distanceGivenIndexOrder(currentIndexOrder) < bestDistanceSoFar) {
                bestDistanceSoFar = distanceGivenIndexOrder(currentIndexOrder);
                bestPathSoFar = currentIndexOrder.slice();
            }
        } else {
            return bestPathSoFar;
        }
    }
}

// With help from Michal Forišek's explanation
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

// swaps two elements of an array
function swap(arr, i1, i2) {
    var temp = arr[i1]
    arr[i1] = arr[i2];
    arr[i2] = temp;
}
