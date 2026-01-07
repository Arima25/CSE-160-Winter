function drawVector(v, color){
    var canvas = document.getElementById('example');
    if(!canvas) return;
    var ctx = canvas.getContext("2d");
    var x = v.elements[0];
    var y = v.elements[1];
    var originX = canvas.width / 2;
    var originY = canvas.height / 2;
    var scale = 20;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + x * scale, originY - y * scale);
    ctx.stroke();
}

function handleDrawEvent(){
    var canvas = document.getElementById('example');
    if(!canvas){
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    var ctx = canvas.getContext("2d");

    var x1Val = parseFloat(document.getElementById('x1Scale').value);
    var y1Val = parseFloat(document.getElementById('y1Scale').value);
    if (isNaN(x1Val)) x1Val = 0;
    if (isNaN(y1Val)) y1Val = 0;

    var v1 = new Vector3([x1Val, y1Val, 0]);
    drawVector(v1, "red");

    var x2Val = parseFloat(document.getElementById('x2Scale').value);
    var y2Val = parseFloat(document.getElementById('y2Scale').value);
    if (isNaN(x2Val)) x2Val = 0;
    if (isNaN(y2Val)) y2Val = 0;

    var v2 = new Vector3([x2Val, y2Val, 0]);
    drawVector(v2, "blue");
}

function main() {
    var canvas = document.getElementById('example');
    if(!canvas){
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function handleDrawOperationEvent(){
    var canvas = document.getElementById('example');
    if(!canvas){
        console.log('Failed to retrieve the <canvas> element');
        return;
    }
    var ctx = canvas.getContext("2d");

    // Clear and set background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Read v1 and v2
    var x1 = parseFloat(document.getElementById('x1Scale').value);
    var y1 = parseFloat(document.getElementById('y1Scale').value);
    var x2 = parseFloat(document.getElementById('x2Scale').value);
    var y2 = parseFloat(document.getElementById('y2Scale').value);
    if (isNaN(x1)) x1 = 0;
    if (isNaN(y1)) y1 = 0;
    if (isNaN(x2)) x2 = 0;
    if (isNaN(y2)) y2 = 0;

    var v1 = new Vector3([x1, y1, 0]);
    var v2 = new Vector3([x2, y2, 0]);

    // Draw v1 and v2
    drawVector(v1, 'red');
    drawVector(v2, 'blue');

    // Read operation and scalar
    var op = document.getElementById('operationSelect').value;
    var si = parseFloat(document.getElementById('scalarInput').value);
    if (isNaN(si)) si = 1;

    // Compute and draw results
    if (op === 'add' || op === 'sub') {
        var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
        if (op === 'add') {
            v3.add(v2);
        } else {
            v3.sub(v2);
        }
        drawVector(v3, 'green');
    }
    if (op === 'mul' || op === 'div') {
        var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
        var v4 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]);
        if (op === 'mul') {
            v3.mul(si);
            v4.mul(si);
        } else {
            v3.div(si);
            v4.div(si);
        }
        drawVector(v3, 'green');
        drawVector(v4, 'green');
    }

    if (op === 'mag'){
        var mag1 = v1.magnitude();
        var mag2 = v2.magnitude();
        console.log('Magnitude of v1: ' + mag1);
        console.log('Magnitude of v2: ' + mag2);
    }

    if (op === 'norm'){
        var v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
        var v4 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]);
        v3.normalize();
        v4.normalize();
        drawVector(v3, 'green');
        drawVector(v4, 'green');
    }

    if (op === 'dot'){
        var angle = angleBetween(v1, v2);
        console.log('Angle: ' + angle);
    }

    if (op === 'area'){
        var area = areaTriangle(v1, v2);
        console.log('Area: ' + area);
    }
}

function angleBetween(v1, v2) {
    var magV1 = v1.magnitude();
    var magV2 = v2.magnitude();
    var dotProd = Vector3.dot(v1, v2);
    var cosTheta = dotProd / (magV1 * magV2);
    if (cosTheta > 1) cosTheta = 1;
    if (cosTheta < -1) cosTheta = -1;
    var angleRad = Math.acos(cosTheta);
    var angleDeg = angleRad * (180 / Math.PI);
    return angleDeg;
}

function areaTriangle(v1, v2){
    var crossProd = Vector3.cross(v1, v2);
    var area = 0.5 * crossProd.magnitude();
    return area;
}
