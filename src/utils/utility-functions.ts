export async function retry(func: () => any, maxTries = 5): Promise<void> {
    let tries = 1;
    let successful = false;

    do {
        try {
            await func();
            successful = true;
        } catch (e) {
            console.log(e);
            tries++;
            await new Promise((resolve) => setTimeout(() => resolve(''), 5000));
        }
    } while (tries < maxTries && !successful);

    if (!successful) {
        throw new Error(`Not able to successfully complete function within ${maxTries} tries`);
    }
}
