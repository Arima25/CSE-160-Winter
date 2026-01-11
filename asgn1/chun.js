class Chun{
    constructor(){
        this.type = 'chun';
        this.position = [0.0, 0.0, 0.0];
        this.color = [0.0, 0.0, 0.0, 1.0];
        this.size = 5.0;
    }

    drawStroke(x1, y1, x2, y2, t, color) {
        let dx = x2 - x1;
            let dy = y2 - y1;
            let len = Math.sqrt(dx * dx + dy * dy);
            let ux = (t * -dy) / len;
            let uy = (t * dx) / len;

            let p1 = [x1 + ux, y1 + uy];
            let p2 = [x1 - ux, y1 - uy];
            let p3 = [x2 - ux, y2 - uy];
            let p4 = [x2 + ux, y2 + uy];

            gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
            drawTriangle([p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]]);
            drawTriangle([p1[0], p1[1], p3[0], p3[1], p4[0], p4[1]]);
    }

    render(){
        const xy = this.position;
        const black = [0.0, 0.0, 0.0, 1.0];
        const red = [0.8, 0.0, 0.0, 1.0];
        const thickness = 0.035;

        // 1. Draw Red Diamond Background (2 triangles forming a diamond)
        // We use absolute coordinates relative to the click position [xy[0], xy[1]]
        // or just centered on the click for a large "Fai Chun" effect.
        gl.uniform4f(u_FragColor, red[0], red[1], red[2], red[3]);
        drawTriangle([
            xy[0], xy[1] + 0.9,      xy[0] - 0.9, xy[1],      xy[0] + 0.9, xy[1],  // Top half
            xy[0] - 0.9, xy[1],      xy[0], xy[1] - 0.9,      xy[0] + 0.9, xy[1]   // Bottom half
        ]);

        // 2. Helper function for strokes
       

        // 3. Construct "春" Character (Coordinates relative to xy)
        // Top 3 Horizontal Strokes
        this.drawStroke(xy[0] - 0.35, xy[1] + 0.55, xy[0] + 0.35, xy[1] + 0.55, thickness, black);
        this.drawStroke(xy[0] - 0.28, xy[1] + 0.43, xy[0] + 0.28, xy[1] + 0.43, thickness, black);
        this.drawStroke(xy[0] - 0.45, xy[1] + 0.31, xy[0] + 0.45, xy[1] + 0.31, thickness, black);
        
        // Central Vertical
        this.drawStroke(xy[0], xy[1] + 0.65, xy[0], xy[1] + 0.31, thickness, black);

        // Side Sweeps
        this.drawStroke(xy[0], xy[1] + 0.31, xy[0] - 0.55, xy[1] - 0.15, thickness, black);
        this.drawStroke(xy[0], xy[1] + 0.31, xy[0] + 0.55, xy[1] - 0.15, thickness, black);

        // Bottom "日" (Sun) Part
        const boxYTop = xy[1] + 0.08;
        const boxYBottom = xy[1] - 0.55;
        const boxXLeft = xy[0] - 0.18;
        const boxXRight = xy[0] + 0.18;

        this.drawStroke(boxXLeft, boxYTop, boxXLeft, boxYBottom, thickness, black);      // Left side
        this.drawStroke(boxXRight, boxYTop, boxXRight, boxYBottom, thickness, black);    // Right side
        this.drawStroke(boxXLeft, boxYTop, boxXRight, boxYTop, thickness, black);        // Top
        this.drawStroke(boxXLeft, (boxYTop + boxYBottom)/2, boxXRight, (boxYTop + boxYBottom)/2, thickness, black); // Mid
        this.drawStroke(boxXLeft, boxYBottom, boxXRight, boxYBottom, thickness, black);  // Bottom
    }

}