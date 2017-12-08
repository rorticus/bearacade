declare const require: any;

function importAsset(src: string): HTMLImageElement {
    const image = new Image();
    image.src = src;

    return image;
}

export const sky = importAsset(require('./assets/sky.png'));
export const layer1 = importAsset(require('./assets/layer_1.png'));
export const layer2 = importAsset(require('./assets/layer_2.png'));
export const layer3 = importAsset(require('./assets/layer_3.png'));
export const player = importAsset(require('./assets/player.png'));
export const pineTree = importAsset(require('./assets/pine-tree.png'));
export const log = importAsset(require('./assets/log.png'));

export const bear1 = importAsset(require('./assets/bear1.png'));
export const bear2 = importAsset(require('./assets/bear2.png'));
export const bear3 = importAsset(require('./assets/bear3.png'));
export const bear4 = importAsset(require('./assets/bear4.png'));
export const bearDead = importAsset(require('./assets/bear-dead.png'));

export const startScreen = importAsset(require('./assets/start-game.png'));
export const endScreen = importAsset(require('./assets/end-game.png'));