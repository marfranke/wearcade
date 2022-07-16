AFRAME.registerComponent('gravitation', {
    dependencies: ['velocity'],
    schema: {
        x: {type: 'number', default: 0},
        y: {type: 'number', default: -9.81},
        z: {type: 'number', default: 0},
    },

    tick: function (_time, delta) {
        if (delta > 200) {
            return;
        }
        delta = delta / 1000

        const velocity = this.el.getAttribute('velocity');
        if (velocity) {
            velocity.x += this.data.x * delta;
            velocity.y += this.data.y * delta;
            velocity.z += this.data.z * delta;
        }
    }
});
