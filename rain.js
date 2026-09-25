// Matrix-style code rain drawn on a #rain canvas behind the page.
(() => {
  const canvas = document.querySelector('#rain');
  if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const context = canvas.getContext('2d');
  const glyphs = 'アカサタナハマヤラワ0123456789ABCDEF:<>{}[]$#';
  const size = 13;
  let drops = [];
  // Resizing clears the canvas, so only do it when the size really changes
  // (typing effects and live clocks trigger frequent no-op layout changes).
  const resize = () => {
    const width = document.documentElement.clientWidth;
    const height = Math.max(document.documentElement.scrollHeight, innerHeight);
    if (width === canvas.width && height === canvas.height) return;
    canvas.width = width;
    canvas.height = height;
    const columns = Math.ceil(width / size);
    drops = Array.from({ length: columns }, (_, column) => drops[column] ?? Math.random() * -50);
  };
  resize();
  new ResizeObserver(resize).observe(document.body);
  setInterval(() => {
    context.fillStyle = 'rgba(2, 8, 3, .12)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = getComputedStyle(document.body).getPropertyValue('--rain').trim() || '#33ff66';
    context.font = `${size}px monospace`;
    drops.forEach((y, column) => {
      context.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], column * size, y * size);
      drops[column] = y * size > canvas.height && Math.random() > .97 ? 0 : y + 1;
    });
  }, 55);
})();
