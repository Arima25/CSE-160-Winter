class Camera {
    constructor() {
        this.fov = 60.0;
        this.eye = new Vector3([0.0, 0.0, 3.0]); // Changed start z to 3 to see the world better
        this.at = new Vector3([0.0, 0.0, -100.0]);
        this.up = new Vector3([0.0, 1.0, 0.0]);
        
        this.viewMatrix = new Matrix4();
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
        
        this.projectionMatrix = new Matrix4();
        this.projectionMatrix.setPerspective(this.fov, canvas.width / canvas.height, 0.1, 1000);
    }


    // Method to re-compute the view matrix from eye, at, up
    updateView() {
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    moveForward(speed = 0.5) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(speed);
        this.eye.add(f);
        this.at.add(f);
        this.updateView();
    }

    moveBackwards(speed = 0.5) {
        let f = new Vector3();
        f.set(this.eye);
        f.sub(this.at);
        f.normalize();
        f.mul(speed);
        this.eye.add(f);
        this.at.add(f);
        this.updateView();
    }

    moveLeft(speed = 0.5) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(speed);
        this.eye.add(s);
        this.at.add(s);
        this.updateView();
    }

    moveRight(speed = 0.5) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(speed);
        this.eye.add(s);
        this.at.add(s);
        this.updateView();
    }

    panLeft(alpha = 5) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        
        let f_prime = rotationMatrix.multiplyVector3(f);
        
        let tempEye = new Vector3();
        tempEye.set(this.eye);
        this.at = tempEye.add(f_prime);
        this.updateView();
    }

    panRight(alpha = 5) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        
        let f_prime = rotationMatrix.multiplyVector3(f);
        
        let tempEye = new Vector3();
        tempEye.set(this.eye);
        this.at = tempEye.add(f_prime);
        this.updateView();
    }
}
