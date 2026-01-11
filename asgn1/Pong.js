class PongGame {
    constructor() {
        this.type = 'pong';
        // Ball state
        this.ballX = 0.0;
        this.ballY = 0.5;
        this.ballSize = 15.0;
        this.ballVelX = 0.015;
        this.ballVelY = -0.015;
        this.speedMultiplier = 1.0;

        // Paddle state
        this.paddleX = 0.0;
        this.paddleY = -0.85;
        this.paddleWidth = 0.4;
        this.paddleHeight = 0.05;

        // Game state
        this.score = 0;
        this.gameOver = false;
        this.active = false;
    }

    start() {
        this.ballX = 0.0;
        this.ballY = 0.5;
        this.ballVelX = 0.015;
        this.ballVelY = -0.015;
        this.speedMultiplier = 1.0;
        this.score = 0;
        this.gameOver = false;
        this.active = true;
    }

    update(mouseX) {
        if (!this.active || this.gameOver) return;

        // Move paddle based on mouse X
        this.paddleX = mouseX;

        // Move ball
        this.ballX += this.ballVelX * this.speedMultiplier;
        this.ballY += this.ballVelY * this.speedMultiplier;

        // Wall collisions (Left/Right)
        if (this.ballX > 1.0 || this.ballX < -1.0) {
            this.ballVelX *= -1;
        }

        // Top collision
        if (this.ballY > 1.0) {
            this.ballVelY *= -1;
        }

        // Paddle collision
        if (this.ballY <= this.paddleY + this.paddleHeight && 
            this.ballY >= this.paddleY &&
            this.ballX >= this.paddleX - this.paddleWidth/2 && 
            this.ballX <= this.paddleX + this.paddleWidth/2) {
            
            this.ballVelY *= -1;
            this.score++;
            // Make it faster but not impossible
            this.speedMultiplier += 0.05; 
            if (this.speedMultiplier > 2.5) this.speedMultiplier = 2.5; 
            
            // Push ball up slightly to avoid double collision
            this.ballY = this.paddleY + this.paddleHeight + 0.01;
        }

        // Bottom collision (Game Over)
        if (this.ballY < -1.0) {
            this.gameOver = true;
            this.active = false;
        }
    }

    render() {
        // Draw Paddle (2 triangles for a rectangle)
        gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0); // White
        let px = this.paddleX;
        let py = this.paddleY;
        let pw = this.paddleWidth / 2;
        let ph = this.paddleHeight;
        drawTriangle([px-pw, py, px+pw, py, px-pw, py+ph, px+pw, py, px-pw, py+ph, px+pw, py+ph]);

        // Draw Ball (As a large Point)
        gl.disableVertexAttribArray(a_Position);
        gl.vertexAttrib3f(a_Position, this.ballX, this.ballY, 0.0);
        gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0); // Red
        gl.uniform1f(u_PointSize, this.ballSize);
        gl.drawArrays(gl.POINTS, 0, 1);

        // Update score display
        sendTextToHTML("Score: " + this.score + (this.gameOver ? " - GAME OVER! Click Start to play again" : ""), "scoreCounter");
    }
}
