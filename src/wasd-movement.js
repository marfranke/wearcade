const KEYCODE_TO_CODE = {
    '38': 'ArrowUp',
    '37': 'ArrowLeft',
    '40': 'ArrowDown',
    '39': 'ArrowRight',
    '87': 'KeyW',
    '65': 'KeyA',
    '83': 'KeyS',
    '68': 'KeyD'
};

const KEYS = [
    'KeyW', 'KeyA', 'KeyS', 'KeyD',
    'ArrowUp', 'ArrowLeft', 'ArrowRight', 'ArrowDown'
];

AFRAME.registerComponent('wasd-movement', {
    dependencies: ['velocity'],
    schema: {
        horizontalAxis: {default: 'x', oneOf: ['x', 'y', 'z']},
        verticalAxis: {default: 'z', oneOf: ['x', 'y', 'z']},
        acceleration: {default: 60},
        horizontalScale: {type: 'number', default: 1},
        verticalScale: {type: 'number', default: 1},
        rotationTarget: {type: 'string', default: ''}
    },

    init: function () {
        this.keys = {};
        this.xRotationFactor = ('x' == this.data.horizontalAxis || 'X' == this.data.verticalAxis) ? 0 : 1;
        this.yRotationFactor = ('y' == this.data.horizontalAxis || 'y' == this.data.verticalAxis) ? 0 : 1;
        this.zRotationFactor = ('Z' == this.data.horizontalAxis || 'z' == this.data.verticalAxis) ? 0 : 1;
        this.rotationOrder = 'XYZ';
        if (this.xRotationFactor == 1) 'XYZ';
        if (this.yRotationFactor == 1) 'YXZ';
        if (this.zRotationFactor == 1) 'ZXY';
        this.rotationTarget = ('' == this.data.rotationTarget) ? this.el : this.el.querySelector(this.data.rotationTarget);
        this.onKeyDown = AFRAME.utils.bind(this.onKeyDown, this);
        this.onKeyUp = AFRAME.utils.bind(this.onKeyUp, this);
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
    },

    tick: function (_time, delta) {
        if (delta > 200) {
            return;
        }

        this.updateVelocity(delta / 1000);
    },

    updateVelocity: function (delta) {
        const directionVector = new THREE.Vector3(0, 0, 0);
        if (this.keys.KeyA || this.keys.ArrowLeft) directionVector[this.data.horizontalAxis] = -this.data.horizontalScale;
        if (this.keys.KeyD || this.keys.ArrowRight) directionVector[this.data.horizontalAxis] = this.data.horizontalScale;
        if (this.keys.KeyW || this.keys.ArrowUp) directionVector[this.data.verticalAxis] = -this.data.verticalScale;
        if (this.keys.KeyS || this.keys.ArrowDown) directionVector[this.data.verticalAxis] = this.data.verticalScale;

        directionVector.multiplyScalar(this.data.acceleration * delta);
        const rotation = this.rotationTarget.getAttribute("rotation")
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

    onKeyDown: function(event) {
        if (!AFRAME.utils.shouldCaptureKeyEvent(event)) return;
        const code = event.code || KEYCODE_TO_CODE[event.keyCode];
        if (KEYS.indexOf(code) !== -1) this.keys[code] = true;
    },
  
    onKeyUp: function (event) {
        var code;
        code = event.code || KEYCODE_TO_CODE[event.keyCode];
        delete this.keys[code];
    }
});
