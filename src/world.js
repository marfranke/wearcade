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

    getHeight: function(pos) {
        const worldPieces = this.el.querySelectorAll('a-hexworld');
        for (piece of worldPieces) {
            try {
                const y = piece.components.hexworld.r2h(pos.x, pos.z);
                if (!isNaN(y)) {
                    return y
                }
            } catch(e) {}
        };
        return NaN;
    },

    idCounter: 0,
    generateId: function() {
        return 'world-' + this.idCounter++;
    }
});