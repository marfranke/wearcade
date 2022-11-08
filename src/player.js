AFRAME.registerComponent('player', {
    init: function() {
        document.addEventListener('click', (event) => {
            const object3D = this.el.querySelector('a-camera').object3D;
            const pos = new THREE.Vector3(0, 0, 0);
            const rot = new THREE.Vector3(0, 0, 0);
            object3D.getWorldPosition(pos);
            object3D.getWorldDirection(rot);
            rot.multiplyScalar(-25);
            const projectile = document.createElement('a-projectile');
            projectile.setAttribute('position', pos);
            projectile.setAttribute('velocity', {
                x: rot.x,
                y: rot.y,
                z: rot.z,
                easingX: 0,
                easingY: 0,
                easingZ: 0
            });
            this.el.sceneEl.appendChild(projectile);
        })
    },

    tick: function (_time, delta) {
        if (delta > 0) this.setY(delta / 1000);
        this.recenter();
    },

    recenter: function() {
        if (this.tryRecenterOn(
            'top-left',
            ['top-right', 'bottom-right', 'bottom'],
            [
                {from: 'center', to: 'bottom-right'},
                {from: 'top-left', to: 'center'},
                {from: 'top', to: 'top-right'},
                {from: 'bottom-left', to: 'bottom'}
            ]
            )) return true;
        if (this.tryRecenterOn(
            'top',
            ['bottom-right', 'bottom', 'bottom-left'],
            [
                {from: 'center', to: 'bottom'},
                {from: 'top', to: 'center'},
                {from: 'top-right', to: 'bottom-right'},
                {from: 'top-left', to: 'bottom-left'}
            ]
            )) return true;
        if (this.tryRecenterOn(
            'top-right',
            ['bottom', 'bottom-left', 'top-left'],
            [
                {from: 'center', to: 'bottom-left'},
                {from: 'top-right', to: 'center'},
                {from: 'bottom-right', to: 'bottom'},
                {from: 'top', to: 'top-left'}
            ]
            )) return true;
        if (this.tryRecenterOn(
            'bottom-right',
            ['bottom-left', 'top-left', 'top'],
            [
                {from: 'center', to: 'top-left'},
                {from: 'bottom-right', to: 'center'},
                {from: 'bottom', to: 'bottom-left'},
                {from: 'top-right', to: 'top'}
            ]
            )) return true;
        if (this.tryRecenterOn(
            'bottom',
            ['top-left', 'top', 'top-right'],
            [
                {from: 'center', to: 'top'},
                {from: 'bottom', to: 'center'},
                {from: 'bottom-left', to: 'top-left'},
                {from: 'bottom-right', to: 'top-right'}
            ]
            )) return true;
        if (this.tryRecenterOn(
            'bottom-left',
            ['top', 'top-right', 'bottom-right'],
            [
                {from: 'center', to: 'top-right'},
                {from: 'bottom-left', to: 'center'},
                {from: 'top-left', to: 'top'},
                {from: 'bottom', to: 'bottom-right'}
            ]
            )) return true;
        return false;
    },

    tryRecenterOn: function(className, throwAwayClasses, replaceClasses) {
        let worldPiece = this.el.sceneEl.querySelector('#world .' + className);
        if (worldPiece && worldPiece.components.hexworld) {
            const hexWorld = worldPiece.components.hexworld;
            const pos = this.el.object3D.position;
            const piecePosX = hexWorld.r2xt(pos.x, pos.z);
            const piecePosY = hexWorld.r2yt(pos.x, pos.z);
            const sumPiecePos = piecePosX + piecePosY;
            if (piecePosX >= -hexWorld.mac && piecePosY >= -hexWorld.mac && piecePosX < hexWorld.mac && piecePosY < hexWorld.mac && sumPiecePos > -hexWorld.mac && sumPiecePos < hexWorld.mac) {
                console.log('Moved to ' + className);

                throwAwayClasses.forEach(throwAwayClass => {
                    const throAwayPiece = this.el.sceneEl.querySelector('#world .' + throwAwayClass);
                    if (throAwayPiece) throAwayPiece.remove();
                });

                replaceClasses.forEach(replaceClass => {
                    const replacePiece = this.el.sceneEl.querySelector('#world .' + replaceClass.from);
                    if (replacePiece) {
                        replacePiece.classList.remove(replaceClass.from);
                        replacePiece.classList.add(replaceClass.to);
                    }
                });
                return true;
            }
        }
        return false;
    },

    setY: function(delta) {
        const pos = new THREE.Vector3(0, 0, 0);
        this.el.object3D.getWorldPosition(pos);
        const minY = document.getElementById('world').components.world.getHeight(pos);
        if (pos.y < minY) {
            const velocity = this.el.getAttribute('velocity');
            const heightDiff = minY - pos.y;
            const yAcceleration = heightDiff - velocity.y * delta;
            const speedSqrPrior = (velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z) * delta * delta;
            const groundSpeedPrior = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z) * delta;
            const remainingGroundSpeed = Math.sqrt(Math.max(0, speedSqrPrior - yAcceleration * yAcceleration));
            var groundFactor = remainingGroundSpeed / groundSpeedPrior;
            if (!isFinite(groundFactor)) {
                groundFactor = 1;
            }
            pos.y = minY;
            velocity.x *= groundFactor;
            velocity.y = Math.min(5, heightDiff / delta / 5);
            velocity.z *= groundFactor;
            this.el.setAttribute('velocity', velocity);
            this.el.setAttribute('position', pos);
        }
    }
});