var canvas = document.getElementById("drawCanvas");
var context = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var isDrawing = false;
var prevX, prevY;
var scale = 1.0;

var data_points = [];

// this is for moving
var isMoving = false;
var prevXM, prevYM;
var pos_x = 0;
var pos_y = 0;
var prevPos = { x: 0, y: 0 };
var initialMouseX, initialMouseY;

var graphBytes = "";

var drawnElements = [];


canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);
canvas.addEventListener("wheel", handleZoom);

function startDrawing(e) {
    if (e.button === 0) {
        isDrawing = true;

        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;

        // Adjust the initial coordinates based on the scale
        [prevX, prevY] = [(e.clientX - rect.left) * scaleX / scale, (e.clientY - rect.top) * scaleY / scale];

        context.clearRect(0, 0, canvas.width * 100000, canvas.height * 100000);
        data_points = [];   
        drawnElements = [];
    } else if (e.button === 2) {
        isMoving = true;

        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;

        initialMouseX = (e.clientX - rect.left) * scaleX / scale;
        initialMouseY = (e.clientY - rect.top) * scaleY / scale;

    }
}

function draw(e) {

    var ell1 = document.getElementById('ttext2_1');
    var ell2 = document.getElementById('ttext2_2');

    var conv = convertCursorPosition(e.clientX, e.clientY);

    ell1.textContent = "Pos: " + e.clientX + ", " + e.clientY;
    ell2.textContent = "Pos2: " + Math.floor(conv["x"]) + ", " + Math.floor(conv["y"]);

    var xIntersection = canvas.width / 2 + pos_x;

    // Calculate y-coordinate of intersection
    var yIntersection = canvas.height / 2 + pos_y;

    // The intersection point is (xIntersection, yIntersection)
    console.log("Intersection Point: (" + xIntersection + ", " + yIntersection + ")");

    if (isMoving) {
        console.log("moving");

        moveObjects(pos_x, pos_y);

        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;

        var mouseX = (e.clientX - rect.left) * scaleX;
        var mouseY = (e.clientY - rect.top) * scaleY;

        mouseX /= scale;
        mouseY /= scale;

        pos_x += mouseX - initialMouseX;
        pos_y += mouseY - initialMouseY;

        initialMouseX = mouseX;
        initialMouseY = mouseY;

        updateGrid();
    }
    if (!isDrawing) return;


    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;

    var x = (e.clientX - rect.left) * scaleX;
    var y = (e.clientY - rect.top) * scaleY;

    x /= scale; // Adjust for scale
    y /= scale; // Adjust for scale

    context.beginPath();
    context.moveTo(prevX, prevY);
    context.lineTo(x, y);
    context.stroke();

    drawnElements.push({ type: 'line', prevX: prevX, prevY: prevY, x: x, y: y, scale: scale });

    [prevX, prevY] = [x, y];

    

    data_points.push({ x: e.clientX, y: e.clientY });

}

function convertCursorPosition(x, y) {
    const centerX = window.innerWidth / 2 + pos_x;
    const centerY = window.innerHeight / 2 + pos_y;

    // Calculate the new coordinates with the center of the screen as the origin
    const newX = x - centerX;
    const newY = (y - centerY) * -1;

    // Return the updated coordinates
    return { x: newX / 20, y: newY / 20};
}


function better_array(arr) {
    console.log("Original:");
    console.log(arr); // Log the original array to the console

    // Transform coordinates so that the very top left pixel is -50, 50,
    // top right is 50, 50, bottom right is 50, -50, and bottom left is -50, -50
    var new_arr = [];
    for (var i = 0; i < arr.length; i++) {
        new_arr.push(convertCursorPosition(arr[i].x, arr[i].y));
    }
    return new_arr;
}


function stopDrawing() {
    if (isMoving) {
        isMoving = false;
    }
    if (isDrawing) {
        const new_data_points = better_array(data_points);
        console.log("New data points: ");
        console.log(new_data_points);
        console.log("Old data points: ");
        console.log(data_points);
        isDrawing = false;

        if (data_points.length > 0) {

            data_points.forEach(function(coord) {
                context.beginPath();
                context.arc(coord.x, coord.y, 5, 0, 2 * Math.PI);
                context.fillStyle = 'blue';
                context.fill();
                context.stroke();
            });

            const portNumber = 80;
            const endpoint = `/get_func`;

            fetch(`http://localhost:${portNumber}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ dataPoints: new_data_points }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Server response:', data);
                console.log(data["equations"]);

                var contentDiv = document.getElementById("content_from_api");
                contentDiv.innerHTML = data["cd"];

                graphBytes = data["graph_b64"];

                var btn_el = document.getElementById("btn_el");
                btn_el.disabled = false;

            })
            .catch(error => {
                console.error('Error sending data to server:', error);
                try {
                    var da_element = document.getElementById('text-0');
                    da_element.textContent = "";
                } catch (error) {
                }
                const popup = document.getElementById('popup2');
  
                popup.style.bottom = '20px';
                popup.style.opacity = '1';
            
                setTimeout(() => {
                popup.style.bottom = '-100px';
                popup.style.opacity = '0';
                }, 3000);
                
            });
        }   

    }
}

function drawAxes() {
    var gridSvg = document.querySelector(".grid");

    var xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("class", "axis-line");
    xAxis.setAttribute("x1", 0);
    xAxis.setAttribute("y1", canvas.height / 2 + pos_y);
    xAxis.setAttribute("x2", canvas.width);
    xAxis.setAttribute("y2", canvas.height / 2 + pos_y);
    gridSvg.appendChild(xAxis);

    var yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("class", "axis-line");
    yAxis.setAttribute("x1", canvas.width / 2 + pos_x);
    yAxis.setAttribute("y1", 0);
    yAxis.setAttribute("x2", canvas.width / 2 + pos_x);
    yAxis.setAttribute("y2", canvas.height);
    gridSvg.appendChild(yAxis);

    var xAxisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    xAxisLabel.setAttribute("class", "axis-label");
    xAxisLabel.setAttribute("x", canvas.width - 10);
    xAxisLabel.setAttribute("y", canvas.height / 2);
    xAxisLabel.textContent = "X";
    gridSvg.appendChild(xAxisLabel);

    var yAxisLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    yAxisLabel.setAttribute("class", "axis-label");
    yAxisLabel.setAttribute("x", canvas.width / 2);
    yAxisLabel.setAttribute("y", 14);
    yAxisLabel.textContent = "Y";
    gridSvg.appendChild(yAxisLabel);
}


function redrawElements() {
    for (var i = 0; i < drawnElements.length; i++) {
        var element = drawnElements[i];

        context.beginPath();

        console.log(pos_x, pos_y);

        if (element.type === 'line') {
            context.moveTo(element.prevX, element.prevY);
            context.lineTo(element.x, element.y);
            context.stroke();
        }

        // Add more conditions for other types of elements if needed

    }
}

function moveObjects(deltaX, deltaY) {
    // Save the current state
    context.save();

    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Move the canvas
    context.translate(deltaX, deltaY);

    // Redraw the elements
    // redrawElements();

    // Restore the saved state
    context.restore();
}

drawGrid();
drawAxes();