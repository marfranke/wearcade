AFRAME.registerComponent('tracked-movement', {
    dependencies: ['velocity'],
    schema: {
        horizontalAxis: {default: 'x', oneOf: ['x', 'y', 'z']},
        verticalAxis: {default: 'z', oneOf: ['x', 'y', 'z']},
        acceleration: {default: 60},
        horizontalScale: {type: 'number', default: 1},
        verticalScale: {type: 'number', default: 1},
        controlsTarget: {type: 'string', default: ''},
        rotationTarget: {type: 'string', default: ''}
    },

    init: function () {
        this.internalVector = new THREE.Vector3();
        this.xRotationFactor = ('x' == this.data.horizontalAxis || 'X' == this.data.verticalAxis) ? 0 : 1;
        this.yRotationFactor = ('y' == this.data.horizontalAxis || 'y' == this.data.verticalAxis) ? 0 : 1;
        this.zRotationFactor = ('Z' == this.data.horizontalAxis || 'z' == this.data.verticalAxis) ? 0 : 1;
        this.rotationOrder = 'XYZ';
        if (this.xRotationFactor == 1) 'XYZ';
        if (this.yRotationFactor == 1) 'YXZ';
        if (this.zRotationFactor == 1) 'ZXY';
        this.rotationTarget = ('' == this.data.rotationTarget) ? this.el : this.el.querySelector(this.data.rotationTarget);
        this.controlsTarget = ('' == this.data.rotationTarget) ? this.el : this.el.querySelector(this.data.controlsTarget);
        this.controlsTarget.addEventListener('axismove', (event) => {
            this.internalVector[this.data.horizontalAxis] = this.data.horizontalScale * event.detail.axis[2];
            this.internalVector[this.data.verticalAxis] = this.data.verticalScale * event.detail.axis[3];
        });
    },

    tick: function (_time, delta) {
        if (delta > 200) {
            return;
        }

        this.updateVelocity(delta / 1000);
    },

    updateVelocity: function (delta) {
        const directionVector = new THREE.Vector3(0, 0, 0);
        directionVector.copy(this.internalVector);
        directionVector.multiplyScalar(this.data.acceleration * delta);
        const rotation = this.rotationTarget.getAttribute("rotation");
        const rotationEuler = new THREE.Euler(
            this.xRotationFactor * THREE.Math.degToRad(rotation.x),
            this.yRotationFactor * THREE.Math.degToRad(rotation.y),
            this.zRotationFactor * THREE.Math.degToRad(rotation.z),
            this.rotationOrder
        );
        directionVector.applyEuler(rotationEuler);

        const velocity = this.el.getAttribute('velocity');
        velocity.x += directionVector.x;
        velocity.y += directionVector.y;
        velocity.z += directionVector.z;
    },
});
