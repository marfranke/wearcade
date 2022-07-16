const YT2YS_FACTOR = Math.sin(60 * Math.PI / 180);
const XR2XT_FACTOR = 1/Math.tan(60 * Math.PI / 180);
const XR2YT_FACTOR = 1/Math.sin(60 * Math.PI / 180);

AFRAME.registerPrimitive('a-hexworld', {
    dependencies: ['position'],
    defaultComponents: {
        hexworld: {},
        position: {x: 0, y: 0, z: 0},
        rotation: {x: -90, y: 0, z: -90}
    },

    mappings: {
        iterations: 'hexworld.iterations',
        roughness: 'hexworld.roughness',
        color: 'hexworld.color',
        glued: 'hexworld.glued'
    }
});

AFRAME.registerComponent('hexworld', {
    schema: {
        iterations: {type: 'number', default: 7},
        roughness: {type: 'number', default: 0.35},
        color: {type: 'string', default: '#4f4'},
        glued: {
            default: [],
            parse: function(value) {
                const result = Array(6);
                const realValue = (typeof value == 'string') ? JSON.parse(value) : value;
                if (Array.isArray(realValue)) {
                    realValue.forEach((entry) => {
                        if (entry.hasOwnProperty('side') && entry.hasOwnProperty('selector')) {
                            result[entry.side] = entry.selector;
                        }
                    });
                }
                return result;
            }
        }
    },

    init: function () {
        this.generateHexagonalHeightMap();

        this.geometry = new THREE.BufferGeometry();
        let floats = [];
        for (let x = -this.mac; x < this.mac; x++) {
            const subSpan = this.spanCoords - Math.abs(x);
            const spanStart = Math.max(-this.mac, -x - this.mac);
            const spanEnd = spanStart + subSpan - 1;
            for (let y = spanStart; y <= (x < 0 ? spanEnd : (spanEnd - 1)); y++) {
                if (x < 0) {
                    floats.push(
                        this.t2xs(x, y), this.t2ys(x, y), this.ti2h(x, y),
                        this.t2xs(x + 1, y - 1), this.t2ys(x + 1, y - 1), this.ti2h(x + 1, y - 1),
                        this.t2xs(x + 1, y), this.t2ys(x + 1, y), this.ti2h(x + 1, y)
                    )
                    if (y < spanEnd) {
                        floats.push(
                            this.t2xs(x, y), this.t2ys(x, y), this.ti2h(x, y),
                            this.t2xs(x + 1, y), this.t2ys(x + 1, y), this.ti2h(x + 1, y),
                            this.t2xs(x, y + 1), this.t2ys(x, y + 1), this.ti2h(x, y + 1)
                        )
                    }
                }
                if (x >= 0) {
                    if (y > spanStart) {
                        floats.push(
                            this.t2xs(x, y), this.t2ys(x, y), this.ti2h(x, y),
                            this.t2xs(x + 1, y - 1), this.t2ys(x + 1, y - 1), this.ti2h(x + 1, y - 1),
                            this.t2xs(x + 1, y), this.t2ys(x + 1, y), this.ti2h(x + 1, y)
                        )
                    }
                    floats.push(
                        this.t2xs(x, y), this.t2ys(x, y), this.ti2h(x, y),
                        this.t2xs(x + 1, y), this.t2ys(x + 1, y), this.ti2h(x + 1, y),
                        this.t2xs(x, y + 1), this.t2ys(x, y + 1), this.ti2h(x, y + 1)
                    )
                }
            }
        }
        const vertices = new Float32Array( floats );
        this.geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
        this.geometry.computeVertexNormals();

        // Create material.
        this.material = new THREE.MeshStandardMaterial({color: this.data.color});

        // Create mesh.
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        // Set mesh on entity.
        this.el.setObject3D('mesh', this.mesh);
    },

    remove: function () {
        this.el.removeObject3D('mesh');
    },

    generateHexagonalHeightMap: function() {
        this.generatateEmptyHeightMap(this.data.iterations);

        const scene = this.el.sceneEl;
        this.data.glued.forEach((value, index) => {
            const neighbor = scene.querySelector(value);
            if (neighbor && neighbor.components && neighbor.components.hexworld) {
                const neighborWorld = neighbor.components.hexworld;
                switch(index) {
                    case 0: {
                        for (let y = 0; y <= this.mac; y++) {
                            this.sti2h(-this.mac, y, neighborWorld.ti2h(this.mac, y - this.mac));
                        }
                        break;
                    }
                    case 1: {
                        for (let x = -this.mac; x <= 0; x++) {
                            this.sti2h(x, this.mac, neighborWorld.ti2h(x + this.mac, -this.mac));
                        }
                        break;
                    }
                    case 2: {
                        for (let i = 0; i <= this.mac; i++) {
                            this.sti2h(i, this.mac - i, neighborWorld.ti2h(i - this.mac, -i));
                        }
                        break;
                    }
                    case 3: {
                        for (let y = -this.mac; y <= 0; y++) {
                            this.sti2h(this.mac, y, neighborWorld.ti2h(-this.mac, y + this.mac));
                        }
                        break;
                    }
                    case 4: {
                        for (let x = 0; x <= this.mac; x++) {
                            this.sti2h(x, -this.mac, neighborWorld.ti2h(x - this.mac, this.mac));
                        }
                        break;
                    }
                    case 5: {
                        for (let i = 0; i <= this.mac; i++) {
                            this.sti2h(i - this.mac, -i, neighborWorld.ti2h(i, this.mac - i));
                        }
                        break;
                    }
                }
            }
        });

        let roughness = this.mac * this.data.roughness;

        this.sti2h(-1 * this.mac, +0 * this.mac, Math.random() * roughness);
        this.sti2h(-1 * this.mac, +1 * this.mac, Math.random() * roughness);
        this.sti2h(+0 * this.mac, +1 * this.mac, Math.random() * roughness);
        this.sti2h(+1 * this.mac, +0 * this.mac, Math.random() * roughness);
        this.sti2h(+1 * this.mac, -1 * this.mac, Math.random() * roughness);
        this.sti2h(+0 * this.mac, -1 * this.mac, Math.random() * roughness);

        this.sti2h(0, 0, (
            this.ti2h(-1 * this.mac, +0 * this.mac) +
            this.ti2h(-1 * this.mac, +1 * this.mac) +
            this.ti2h(+0 * this.mac, +1 * this.mac) +
            this.ti2h(+1 * this.mac, +0 * this.mac) +
            this.ti2h(+1 * this.mac, -1 * this.mac) +
            this.ti2h(+0 * this.mac, -1 * this.mac))  / 6 + (Math.random() - 0.5) * roughness);

        this.triangleStep(0, 0, -this.mac, 0, -this.mac, this.mac, roughness / 2);
        this.triangleStep(0, 0, 0, this.mac, -this.mac, this.mac, roughness / 2);
        this.triangleStep(0, 0, 0, this.mac, this.mac, 0, roughness / 2);
        this.triangleStep(0, 0, this.mac, -this.mac, this.mac, 0, roughness / 2);
        this.triangleStep(0, 0, this.mac, -this.mac, 0, -this.mac, roughness / 2);
        this.triangleStep(0, 0, -this.mac, 0, 0, -this.mac, roughness / 2);
    },

    generatateEmptyHeightMap: function(iterations) {
        this.mac = Math.pow(2, iterations - 1);
        this.spanCoords = this.mac * 2  + 1;
        this.heights = Array(this.spanCoords);
        for (let x = -this.mac; x <= this.mac; x++) {
            const subSpan = this.spanCoords - Math.abs(x);
            const spanStart = Math.max(-this.mac, -x - this.mac);
            const spanEnd = spanStart + subSpan - 1;
            this.heights[x + this.mac] = Array(subSpan);
        }
    },

    triangleStep: function(x1, y1, x2, y2, x3, y3, roughness) {
        let mx1 = (x1 + x2) / 2;
        let mx2 = (x2 + x3) / 2;
        let mx3 = (x3 + x1) / 2;
        let my1 = (y1 + y2) / 2;
        let my2 = (y2 + y3) / 2;
        let my3 = (y3 + y1) / 2;

        if (Number.isInteger(mx1) && Number.isInteger(mx2) && Number.isInteger(mx3) && Number.isInteger(my1) && Number.isInteger(my2) && Number.isInteger(my3)) {
            this.sti2h(mx1, my1, (this.ti2h(x1, y1) + this.ti2h(x2, y2)) / 2 + (Math.random() - 0.5) * roughness);
            this.sti2h(mx2, my2, (this.ti2h(x2, y2) + this.ti2h(x3, y3)) / 2 + (Math.random() - 0.5) * roughness);
            this.sti2h(mx3, my3, (this.ti2h(x3, y3) + this.ti2h(x1, y1)) / 2 + (Math.random() - 0.5) * roughness);

            this.triangleStep(x1, y1, mx1, my1, mx3, my3, roughness / 2);
            this.triangleStep(x2, y2, mx1, my1, mx2, my2, roughness / 2);
            this.triangleStep(x3, y3, mx2, my2, mx3, my3, roughness / 2);
            this.triangleStep(mx1, my1, mx2, my2, mx3, my3, roughness / 2);
        }
    },

    t2xs: function(x, y) {
        return x + 0.5 * y;
    },

    t2ys: function(x, y) {
        return YT2YS_FACTOR * y;
    },

    r2xt: function(x, z) {
        const pos = this.el.components.position.data;
        const normX = x - pos.x;
        const normZ = z - pos.z;
        return normZ - XR2XT_FACTOR * normX;
    },

    r2yt: function(x, z) {
        const pos = this.el.components.position.data;
        const normX = x - pos.x;
        return XR2YT_FACTOR * normX;
    },

    /**
     * @param {Integer} x x Triangle Coordinate
     * @param {Integer} y y Triangle Coordinate
     * @returns x Array Coordinate
     */
    t2xa: function(x, y) {
        return x + this.mac;
    },

    /**
     * @param {Integer} x x Triangle Coordinate
     * @param {Integer} y y Triangle Coordinate
     * @returns y Array Coordinate
     */
    t2ya: function(x, y) {
        return y - Math.max(-this.mac, -x - this.mac);
    },

    /**
     * @param {Integer} x x Triangle Coordinate
     * @param {Integer} y y Triangle Coordinate
     * @returns height at Triangle Coordinate (x, y)
     */
     ti2h: function(x, y) {
        return this.heights[this.t2xa(x, y)][this.t2ya(x, y)]
    },

    /**
     * @param {Integer} x x Triangle Coordinate
     * @param {Integer} y y Triangle Coordinate
     * @returns height at Triangle Coordinate (x, y)
     */
     t2h: function(x, y) {
        const flooredX = Math.floor(x);
        const flooredY = Math.floor(y);
        const ceiledX = Math.ceil(x);
        const ceiledY = Math.ceil(y);
        const fractionX = x - flooredX;
        const fractionY = y - flooredY;
        const cornerHeightB = this.ti2h(ceiledX, flooredY);
        const cornerHeightD = this.ti2h(flooredX, ceiledY);
        if (fractionX + fractionY < 1) {
            const cornerHeightA = this.ti2h(flooredX, flooredY);
            return cornerHeightA 
                + (cornerHeightB - cornerHeightA) * fractionX 
                + (cornerHeightD - cornerHeightA) * fractionY;
        } else {
            const cornerHeightC = this.ti2h(ceiledX, ceiledY);
            return cornerHeightC 
                + (cornerHeightB - cornerHeightC) * (1 - fractionY) 
                + (cornerHeightD - cornerHeightC) * (1 - fractionX);
        }
    },

    r2h: function(x, z) {
        const pos = this.el.components.position.data;
        return this.t2h(this.r2xt(x, z), this.r2yt(x, z)) + pos.y;
    },

    /**
     * @param {Integer} x x Triangle Coordinate
     * @param {Integer} y y Triangle Coordinate
     * @returns height at Triangle Point (x, y)
     */
    ti2h: function(x, y) {
        return this.heights[this.t2xa(x, y)][this.t2ya(x, y)]
    },

    /**
     * Set height at Triangle Point (x, y) to value if uninitialised
     *
     * @param {Integer} x x Triangle Coordinate
     * @param {Integer} y y Triangle Coordinate
     * @param {Number} value New height
     */
    sti2h: function(x, y, value) {
        this.heights[this.t2xa(x, y)][this.t2ya(x, y)] = this.ti2h(x, y) || value
    }
});