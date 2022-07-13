var CLAMP_VELOCITY = 0.00001;

AFRAME.registerComponent('velocity', {
    dependencies: ['position'],
    schema: {
        x: {type: 'number', default: 0},
        y: {type: 'number', default: 0},
        z: {type: 'number', default: 0},
        easingX: {type: 'number', default: 0.9},
        easingY: {type: 'number', default: 0},
        easingZ: {type: 'number', default: 0.9},
        easingRefFps: {type: 'number', default: 60}
    },

    tick: function (_time, delta) {
        if (delta > 200) {
          return;
        }
        delta = delta / 1000;

        const exponent = delta * this.data.easingRefFps;
        if (this.data.easingX) this.data.x = this.data.x * Math.pow(this.data.easingX, exponent);
        if (this.data.easingY) this.data.y = this.data.y * Math.pow(this.data.easingY, exponent);
        if (this.data.easingZ) this.data.z = this.data.z * Math.pow(this.data.easingZ, exponent);

        if (Math.abs(this.data.x) < CLAMP_VELOCITY) this.data.x = 0;
        if (Math.abs(this.data.y) < CLAMP_VELOCITY) this.data.y = 0;
        if (Math.abs(this.data.z) < CLAMP_VELOCITY) this.data.z = 0;

        const directionVector = new THREE.Vector3(this.data.x, this.data.y, this.data.z);
        directionVector.multiplyScalar(delta);
        this.el.object3D.position.add(directionVector);
    }
});
