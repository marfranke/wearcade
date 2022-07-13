import 'aframe';
import './hexworld.js';
import './velocity.js';
import './tracked-movement.js';

AFRAME.registerComponent('player', {
    tick: function () {
        if (!this.recenter()) this.setY();
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

    setY: function() {
        const pos = this.el.object3D.position;
        const worldCenter = this.el.sceneEl.querySelector('#world .center').components.hexworld;
        pos.y = worldCenter.r2h(pos.x, pos.z) + 1.6;
        this.el.setAttribute('position', pos);
    }
});

AFRAME.registerComponent('world', {
    tick: function () {
        this.generateProximity();
    },

    generateProximity: function() {
        if (this.createIfNotExist('top-left', -2, 1, [
            {side: 3, selector: '.center'},
            {side: 2, selector: '.top'},
            {side: 4, selector: '.bottom-left'}
        ])) return;

        if (this.createIfNotExist('top', -1, 2, [
            {side: 4, selector: '.center'},
            {side: 3, selector: '.top-right'},
            {side: 5, selector: '.top-left'}
        ])) return;

        if (this.createIfNotExist('top-right', 1, 1, [
            {side: 5, selector: '.center'},
            {side: 4, selector: '.bottom-right'},
            {side: 0, selector: '.top'}
        ])) return;

        if (this.createIfNotExist('bottom-right', 2, -1, [
            {side: 0, selector: '.center'},
            {side: 5, selector: '.bottom'},
            {side: 1, selector: '.top-right'}
        ])) return;

        if (this.createIfNotExist('bottom', 1, -2, [
            {side: 1, selector: '.center'},
            {side: 0, selector: '.bottom-left'},
            {side: 2, selector: '.bottom-right'}
        ])) return;

        if (this.createIfNotExist('bottom-left', -1, -1, [
            {side: 2, selector: '.center'},
            {side: 1, selector: '.top-left'},
            {side: 3, selector: '.bottom'}
        ])) return;
    },

    createIfNotExist: function(className, centerRelX, centerRelY, glues) {
        let worldPiece = this.el.querySelector('.' + className);
        if (!worldPiece) {
            console.log('Create ' + className);
            const center = this.el.querySelector('.center');
            const centerWorld = center.components.hexworld;
            const posCenter = center.components.position.data;

            worldPiece = document.createElement('a-hexworld');
            worldPiece.id = this.generateId();
            worldPiece.classList.add(className);
            worldPiece.setAttribute('position', {
                x: posCenter.x + centerWorld.t2ys(centerRelX * centerWorld.mac, centerRelY * centerWorld.mac),
                y: posCenter.y,
                z: posCenter.z + centerWorld.t2xs(centerRelX * centerWorld.mac, centerRelY * centerWorld.mac),
            });
            worldPiece.setAttribute('glued', JSON.stringify(glues.map(glue => {
                const glueWorld = this.el.querySelector(glue.selector);
                if (glueWorld) {
                    return {side: glue.side, selector: '#' + glueWorld.id};
                } else {
                    return {};
                }
            })));
            this.el.appendChild(worldPiece);
            return true;
        }
        return false;
    },

    idCounter: 0,
    generateId: function() {
        return 'world-' + this.idCounter++;
    }
});