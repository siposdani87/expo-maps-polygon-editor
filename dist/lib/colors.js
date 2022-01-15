const getRandomNumber = (min, max) => {
    return Math.random() * max + min;
};
export const getRandomPolygonColors = () => {
    const red = Math.floor(getRandomNumber(0, 255));
    const green = Math.floor(getRandomNumber(0, 255));
    const blue = Math.floor(getRandomNumber(0, 255));
    const strokeColor = `rgb(${red}, ${green}, ${blue})`;
    const fillColor = `rgba(${red}, ${green}, ${blue}, 0.2)`;
    return [strokeColor, fillColor];
};
//# sourceMappingURL=colors.js.map