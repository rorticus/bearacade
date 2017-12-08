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
