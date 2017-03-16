function Graph(document) {
  let canvas = document.getElementById("canvas");
  let ctx = canvas.getContext("2d");

  let width = canvas.width;
  let height = canvas.height;
  let offsetX = canvas.offsetLeft + parseInt(canvas.style.borderBottomWidth);
  let offsetY = canvas.offsetTop + parseInt(canvas.style.borderBottomWidth);

  ctx.fillStyle = '#FFF';
  ctx.fillRect(0, 0, width, height);
  let imageData = ctx.getImageData(0, 0, width, height);
  let currentColor = [0, 0, 0, 255];

  function inCanvas(x, y) {
    return 0 <= x && x < width && 0 <= y && y < height;
  }

  function colorToInt(color) {
    return (((((color[0] << 8) + color[1]) << 8) + color[2]) << 8) + color[3];
  }

  function getColor(data, x, y) {
    if (!inCanvas(x, y)) return 0;
    let i = (y * width + x) * 4;
    return (((((data[i] << 8) + data[i+1]) << 8) + data[i+2]) << 8) + data[i+3];
  }

  /*this.setPixel = (x, y, r = currentColor[0],
                           g = currentColor[1],
                           b = currentColor[2],
                           a = currentColor[3]) => {
    let id = ctx.createImageData(1,1);
    let data = id.data;
    data[0] = r;
    data[1] = g;
    data[2] = b;
    data[3] = a;
    ctx.putImageData(id, x, y);
  }*/

  function setPixel(x, y, r = currentColor[0],
                          g = currentColor[1],
                          b = currentColor[2],
                          a = currentColor[3]) {
    if (!inCanvas(x, y)) return;
    ctx.fillStyle = `rgba(${r},${g},${b},${a / 255.0})`;
    ctx.fillRect(x, y, 1, 1);
  }


  function setImagePixel(data, x, y, r = currentColor[0],
                                     g = currentColor[1],
                                     b = currentColor[2],
                                     a = currentColor[3]) {
    if (!inCanvas(x, y)) return;
    let i = (y * width + x) * 4;
    data[i] = r;
    data[i+1] = g;
    data[i+2] = b;
    data[i+3] = a;
  }

  this.refresh = () => {
    ctx.putImageData(imageData, 0, 0);
  }

  this.setCurrentColor = (r, g, b, a = 255) => {
    currentColor = [r, g, b, a];
  }

  function __drawLine(x1, y1, x2, y2, data) {
    let dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1), t = 0;
    if (dx < dy) {
      t = x1; x1 = y1; y1 = t;
      t = x2; x2 = y2; y2 = t;
      t = dx; dx = dy; dy = t;
      t = 1;
    }
    let x = x1, y = y1, e = -dx;
    let sgnx = x1 < x2 ? 1 : -1;
    let sgny = y1 < y2 ? 1 : -1;
    if (!t) {
      for (let i = 0; i <= dx; i++) {
        setImagePixel(data, x, y);
        x += sgnx;
        e += 2 * dy;
        if (e >= 0) {
          y += sgny;
          e -= 2 * dx;
        }
      }
    } else {
      for (let i = 0; i <= dx; i++) {
        setImagePixel(data, y, x);
        x += sgnx;
        e += 2 * dy;
        if (e >= 0) {
          y += sgny;
          e -= 2 * dx;
        }
      }
    }
  }

  function __drawCircle(x, y, r, data) {
    function drawCirclePoints(dx, dy) {
      setImagePixel(data, x + dx, y + dy); setImagePixel(data, x + dy, y + dx);
      setImagePixel(data, x - dx, y + dy); setImagePixel(data, x + dy, y - dx);
      setImagePixel(data, x + dx, y - dy); setImagePixel(data, x - dy, y + dx);
      setImagePixel(data, x - dx, y - dy); setImagePixel(data, x - dy, y - dx);
    }

    let dx = 0, dy = r, d= 10 - r * 8;
    while (dx <= dy) {
      drawCirclePoints(dx, dy);
      if (d < 0)
        d += (dx << 4) + 24;
      else {
        d += ((dx - dy) << 4) + 40;
        dy--;
      }
      dx++;
    }
  }

  this.drawLine = (x1, y1, x2, y2) => {
    __drawLine(x1, y1, x2, y2, imageData.data);
    this.refresh();
  }

  this.drawLineOnCache = (x1, y1, x2, y2) => {
    let cache = ctx.getImageData(0, 0, width, height);
    __drawLine(x1, y1, x2, y2, cache.data);
    ctx.putImageData(cache, 0, 0);
  }

  this.drawCircle = (x, y, r) => {
    __drawCircle(x, y, r, imageData.data);
    this.refresh();
  }

  this.drawCircleOnCache = (x, y, r) => {
    let cache = ctx.getImageData(0, 0, width, height);
    __drawCircle(x, y, r, cache.data);
    ctx.putImageData(cache, 0, 0);
  }

  this.fill = (x, y) => {
    let color = getColor(imageData.data, x, y);
    let stack = [{ x:x, y:y }];
    if (color == colorToInt(currentColor)) return;
    while (stack.length) {
      let p = stack.pop();
      let xl = p.x, xr = p.x, y = p.y;
      setImagePixel(imageData.data, xl, y);
      while (getColor(imageData.data, xl - 1, y) == color)
        setImagePixel(imageData.data, --xl, y);
      while (getColor(imageData.data, xr + 1, y) == color)
        setImagePixel(imageData.data, ++xr, y);

      for (let t = 0; t < 2; t++) {
        y = !t ? p.y + 1 : p.y - 1;
        if (y < 0 || y >= height) continue;
        for (let x = xl; x <= xr; x++) {
          for (;x <= xr && getColor(imageData.data, x, y) != color; x++);
          if (x <= xr && getColor(imageData.data, x, y) == color)
            stack.push({ x:x, y:y });
          for (;x <= xr && getColor(imageData.data, x, y) == color; x++);
        }
      }
    }
    this.refresh();
  }
}