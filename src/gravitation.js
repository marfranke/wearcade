AFRAME.registerComponent('gravitation', {
    dependencies: ['velocity'],
    schema: {
        gravitationX: {type: 'number', default: 0},
        gravitationY: {type: 'number', default: -9.81},
        gravitationZ: {type: 'number', default: 0},
    },

    tick: function (_time, delta) {
        if (delta > 200) {
            return;
        }
        delta = delta / 1000

        const velocity = this.el.getAttribute('velocity');
        velocity.x += this.data.gravitationX * delta;
        velocity.y += this.data.gravitationY * delta;
        velocity.z += this.data.gravitationZ * delta;
        console.log(velocity);
    }
});
