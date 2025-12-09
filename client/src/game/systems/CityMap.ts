import Phaser from 'phaser';

// Simple procedural city map generator
export class CityMap {
    private scene: Phaser.Scene;
    private tileSize: number = 64;
    private mapWidth: number = 20;
    private mapHeight: number = 15;
    private collisionGroup!: Phaser.Physics.Arcade.StaticGroup;

    // Tile types
    static readonly GRASS = 0;
    static readonly ROAD = 1;
    static readonly SIDEWALK = 2;
    static readonly BUILDING = 3;
    static readonly WATER = 4;
    static readonly SAND = 5;

    // Zone colors
    static readonly COLORS: { [key: number]: number } = {
        0: 0x4a7c59,  // Grass - dark green
        1: 0x444444,  // Road - dark gray
        2: 0xaaaaaa,  // Sidewalk - light gray
        3: 0x8b4513,  // Building - brown
        4: 0x4a90d9,  // Water - blue
        5: 0xf4e4bc   // Sand - beige
    };

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.collisionGroup = scene.physics.add.staticGroup();
    }

    generate(): Phaser.Physics.Arcade.StaticGroup {
        const width = this.mapWidth;
        const height = this.mapHeight;

        // Create map array
        const map: number[][] = [];
        for (let y = 0; y < height; y++) {
            map[y] = [];
            for (let x = 0; x < width; x++) {
                map[y][x] = CityMap.GRASS;
            }
        }

        // Main roads (cross pattern)
        const midX = Math.floor(width / 2);
        const midY = Math.floor(height / 2);

        // Horizontal road
        for (let x = 0; x < width; x++) {
            map[midY][x] = CityMap.ROAD;
            map[midY - 1][x] = CityMap.ROAD;
            if (midY > 1) map[midY - 2][x] = CityMap.SIDEWALK;
            if (midY < height - 1) map[midY + 1][x] = CityMap.SIDEWALK;
        }

        // Vertical road
        for (let y = 0; y < height; y++) {
            map[y][midX] = CityMap.ROAD;
            map[y][midX - 1] = CityMap.ROAD;
            if (midX > 1) map[y][midX - 2] = CityMap.SIDEWALK;
            if (midX < width - 1) map[y][midX + 1] = CityMap.SIDEWALK;
        }

        // Buildings in quadrants
        this.addBuilding(map, 2, 2, 3, 3);
        this.addBuilding(map, 14, 2, 4, 3);
        this.addBuilding(map, 2, 10, 3, 2);
        this.addBuilding(map, 15, 10, 3, 3);

        // Beach area (bottom right)
        for (let y = height - 3; y < height; y++) {
            for (let x = width - 5; x < width; x++) {
                if (map[y][x] === CityMap.GRASS) {
                    map[y][x] = y === height - 1 ? CityMap.WATER : CityMap.SAND;
                }
            }
        }

        // Render the map
        this.renderMap(map);

        return this.collisionGroup;
    }

    private addBuilding(map: number[][], startX: number, startY: number, w: number, h: number) {
        for (let y = startY; y < startY + h && y < this.mapHeight; y++) {
            for (let x = startX; x < startX + w && x < this.mapWidth; x++) {
                map[y][x] = CityMap.BUILDING;
            }
        }
    }

    private renderMap(map: number[][]) {
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                const tileType = map[y][x];
                const posX = x * this.tileSize + this.tileSize / 2;
                const posY = y * this.tileSize + this.tileSize / 2;

                const tile = this.scene.add.rectangle(
                    posX, posY,
                    this.tileSize, this.tileSize,
                    CityMap.COLORS[tileType]
                );
                tile.setStrokeStyle(1, 0x000000, 0.2);

                // Buildings are solid (collision)
                if (tileType === CityMap.BUILDING) {
                    const collider = this.scene.add.rectangle(posX, posY, this.tileSize, this.tileSize, 0x8b4513);
                    collider.setStrokeStyle(2, 0x000000);
                    this.scene.physics.add.existing(collider, true);
                    this.collisionGroup.add(collider);

                    // Add building decoration (windows)
                    this.scene.add.rectangle(posX - 10, posY - 10, 12, 12, 0x87ceeb);
                    this.scene.add.rectangle(posX + 10, posY - 10, 12, 12, 0x87ceeb);
                    this.scene.add.rectangle(posX, posY + 10, 16, 12, 0x654321); // Door
                }

                // Water slows down (handled elsewhere)
                if (tileType === CityMap.WATER) {
                    // Add wave effect
                    tile.setAlpha(0.8);
                }
            }
        }

        // Add zone labels
        this.addZoneLabel(200, 100, '🏙️ DOWNTOWN');
        this.addZoneLabel(this.mapWidth * this.tileSize - 150, this.mapHeight * this.tileSize - 80, '🏖️ BEACH');
        this.addZoneLabel(200, this.mapHeight * this.tileSize - 100, '🌳 PARK');

        // Add decorations
        this.addDecorations(map);
    }

    private addDecorations(map: number[][]) {
        // Trees in park area (bottom left)
        const treePositions = [
            { x: 100, y: 700 }, { x: 180, y: 750 }, { x: 80, y: 800 },
            { x: 250, y: 720 }, { x: 150, y: 850 }, { x: 300, y: 800 },
        ];
        treePositions.forEach(pos => {
            this.scene.add.text(pos.x, pos.y, '🌳', { fontSize: '32px' }).setOrigin(0.5);
        });

        // Palm trees at beach
        const palmPositions = [
            { x: 1150, y: 800 }, { x: 1200, y: 850 }, { x: 1100, y: 880 },
        ];
        palmPositions.forEach(pos => {
            this.scene.add.text(pos.x, pos.y, '🌴', { fontSize: '28px' }).setOrigin(0.5);
        });

        // Benches along sidewalks
        const benchPositions = [
            { x: 350, y: 400 }, { x: 550, y: 400 }, { x: 750, y: 400 },
        ];
        benchPositions.forEach(pos => {
            this.scene.add.text(pos.x, pos.y, '🪑', { fontSize: '20px' }).setOrigin(0.5);
        });

        // Street lamps
        const lampPositions = [
            { x: 200, y: 450 }, { x: 450, y: 450 }, { x: 700, y: 450 },
            { x: 950, y: 450 }, { x: 600, y: 200 }, { x: 600, y: 650 },
        ];
        lampPositions.forEach(pos => {
            this.scene.add.text(pos.x, pos.y, '🏮', { fontSize: '18px' }).setOrigin(0.5);
        });

        // Trash cans
        [{ x: 380, y: 420 }, { x: 780, y: 420 }].forEach(pos => {
            this.scene.add.text(pos.x, pos.y, '🗑️', { fontSize: '16px' }).setOrigin(0.5);
        });

        // Beach umbrella
        this.scene.add.text(1180, 830, '⛱️', { fontSize: '32px' }).setOrigin(0.5);
    }

    private addZoneLabel(x: number, y: number, text: string) {
        this.scene.add.text(x, y, text, {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#00000088',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);
    }

    getMapSize(): { width: number, height: number } {
        return {
            width: this.mapWidth * this.tileSize,
            height: this.mapHeight * this.tileSize
        };
    }
}
