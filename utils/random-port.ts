export const generateRandomPort = () => {
    return Math.floor(Math.random() * (8000 - 3001 + 1) + 3001).toString();
}
