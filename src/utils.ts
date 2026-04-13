export const getRandomColor = () => {
  // Generate a random hue (0-360)
  const h = Math.floor(Math.random() * 360);
  // Saturation: 40-65% (muted, not too vibrant)
  const s = Math.floor(Math.random() * 25) + 40;
  // Lightness: 60-80% (pastel/soft, not too dark or bright)
  const l = Math.floor(Math.random() * 20) + 60;

  // Convert HSL to Hex
  const a = (s * Math.min(l, 100 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color / 100)
      .toString(16)
      .padStart(2, '0');
  };
  
  return `#${f(0)}${f(8)}${f(4)}`;
};
