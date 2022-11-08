const YT2YS_FACTOR = Math.sin(60 * Math.PI / 180);
const XR2XT_FACTOR = 1/Math.tan(60 * Math.PI / 180);
const XR2YT_FACTOR = 1/Math.sin(60 * Math.PI / 180);

AFRAME.registerPrimitive('a-spider', {
    defaultComponents: {
        spider: {},
        'gltf-model': '#spider',
        'animation-mixer': {},
        gravitation: {},
        position: {},
        rotation: {},
        velocity: {easingX: 0, easingZ: 0}
    },

    mappings: {
    }
});

AFRAME.registerComponent('spider', {
    tick: function() {
        const pos = new THREE.Vector3(0, 0, 0);
        this.el.object3D.getWorldPosition(pos);
        const minY = document.getElementById('world').components.world.getHeight(pos);
        if (isNaN(minY)) {
            console.log('Despawn Spider');
            this.el.remove();
        }
        else if (pos.y < minY) {
            pos.y = minY || 0;
            const player = document.getElementById('player');
            const playerPos = new THREE.Vector3();
            player.object3D.getWorldPosition(playerPos);
            const diffX = playerPos.x - pos.x;
            const diffZ = playerPos.z - pos.z;
            var hDiff = Math.sqrt(diffX * diffX + diffZ * diffZ) || 1;
            this.el.setAttribute('velocity', {x: (Math.random() - 0.5) * 5 + diffX / hDiff, y: Math.random() * 10, z: (Math.random() - 0.5) * 5 + diffZ / hDiff});
            this.el.setAttribute('position', pos);
        }
    }
});

AFRAME.registerPrimitive('a-spider-spawner', {
    defaultComponents: {
        'spider-spawner': {},
    },

    mappings: {
    }
});

AFRAME.registerComponent('spider-spawner', {
    init: function() {
        this.el.addEventListener('physicscollided', function (evt) {
            console.log(evt.detail.collidingEntity);
        });
    },

    tick: function() {
        const spiders = this.el.childNodes;
        if (spiders.length < 3) {
            const newSpider = document.createElement('a-spider');
            const worldTargetPieces = this.el.sceneEl.querySelectorAll('#world a-hexworld:not(.center)');
            if (worldTargetPieces.length > 0) {
                const randomTarget = worldTargetPieces[Math.floor(Math.random() * worldTargetPieces.length)];
                const pos = randomTarget.getAttribute('position');
                newSpider.setAttribute('position', pos);
                this.el.appendChild(newSpider);
                console.log("Spider spawned")
            }
        }
    }
});