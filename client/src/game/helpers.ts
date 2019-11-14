const chanceConstant = 1000;

/**
 * Return true or false given some percentage chance for true
 * @param {number} chance percentage from 0 - 1
 */
export function chance(chance: number) {
    return (
        Math.round(Math.random() * chanceConstant) <=
        Math.round(chance * chanceConstant)
    );
}

/**
 * Return one of many options given weighted entries.
 * @param choices
 */
export function choice<T extends { [key: string]: number }>(
    choices: T
): keyof T {
    const keys = Object.keys(choices);

    const sum = keys.reduce((p, k) => p + choices[k], 0);
    const rand = Math.round(Math.random() * sum);

    for (let i = 0, t = 0; i < keys.length; i++) {
        const k = keys[i];
        const span = choices[k] * sum;

        if (rand >= t && rand < t + span) {
            return k;
        }

        t += span;
    }
}

export function arrayChoice<T>(
    ...choices: [T, number][]
): T {
    const sum = choices.reduce((p, k) => p + k[1], 0);
    const rand = Math.round(Math.random() * sum);

    for (let i = 0, t = 0; i < choices.length; i++) {
        const k = choices[i];
        const span = k[1];

        if (rand >= t && rand <= t + span) {
            return k[0];
        }

        t += span;
    }
}