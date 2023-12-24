function updateGrid() {
    var transformMatrix = context.getTransform();
    var translateX = transformMatrix.e;
    var translateY = transformMatrix.f;

    context.setTransform(scale, 0, 0, scale, translateX, translateY);
    drawGrid();
    drawAxes();
}

function drawGrid() {
    var gridSvg = document.querySelector(".grid");
    var gridSize = 20 / scale; // Adjust grid size based on scale

    gridSvg.innerHTML = ""; // Clear previous grid lines

    // console.log(pos_x);
    // console.log(pos_y);

    for (var x = pos_x - canvas.width; x < canvas.width; x += gridSize) {
        var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("class", "grid-line");
        line.setAttribute("x1", x);
        line.setAttribute("y1", 0);
        line.setAttribute("x2", x);
        line.setAttribute("y2", canvas.height);
        gridSvg.appendChild(line);
    }

    for (var y = pos_y - canvas.height; y < canvas.height; y += gridSize) {
        var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("class", "grid-line");
        line.setAttribute("x1", 0);
        line.setAttribute("y1", y);
        line.setAttribute("x2", canvas.width);
        line.setAttribute("y2", y);
        gridSvg.appendChild(line);
    }
}