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
  let smoothLine = false;

  function inCanvas(image, x, y) {
    return 0 <= x && x < image.width && 0 <= y && y < image.height;
  }

  function colorToInt(color) {
    return (((((color[0] << 8) + color[1]) << 8) + color[2]) << 8) + color[3];
  }

  function getColorArray(image, x, y) {
    if (!inCanvas(image, x, y)) return 0;
    let i = (y * image.width + x) * 4;
    return image.data.slice(i, i+4);
  }

  function getColor(image, x, y) {
    if (!inCanvas(image, x, y)) return 0;
    let i = (y * image.width + x) * 4;
    return (((((image.data[i] << 8) + image.data[i+1]) << 8) + image.data[i+2]) << 8) + image.data[i+3];
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

  // function setPixel(x, y, r = currentColor[0],
  //                         g = currentColor[1],
  //                         b = currentColor[2],
  //                         a = currentColor[3]) {
  //   if (!inCanvas(image, x, y)) return;
  //   ctx.fillStyle = `rgba(${r},${g},${b},${a / 255.0})`;
  //   ctx.fillRect(x, y, 1, 1);
  // }


  function setImagePixel(image, x, y, r = currentColor[0],
                                      g = currentColor[1],
                                      b = currentColor[2],
                                      a = currentColor[3] / 255) {
    if (!inCanvas(image, x, y)) return;
    let i = (y * image.width + x) * 4;

    image.data[i+0] = (1 - a) * image.data[i+0] + a * r;
    image.data[i+1] = (1 - a) * image.data[i+1] + a * g;
    image.data[i+2] = (1 - a) * image.data[i+2] + a * b;
    image.data[i+3] = 255;
  }

  this.refresh = () => {
    ctx.putImageData(imageData, 0, 0);
  }

  this.setCurrentColor = (r, g, b, a = 255) => {
    currentColor = [r, g, b, a];
  }

  this.setSmooth = (ok) => {
    smoothLine = ok;
  }

  function __drawLine(x1, y1, x2, y2, image) {
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
    let k = dy / dx *  sgny;

    if (!smoothLine) {
      if (!t) {
        for (let i = 0; i <= dx; i++) {
          setImagePixel(image, x, y);
          x += sgnx;
          e += 2 * dy;
          if (e >= 0) {
            y += sgny;
            e -= 2 * dx;
          }
        }
      } else {
        for (let i = 0; i <= dx; i++) {
          setImagePixel(image, y, x);
          x += sgnx;
          e += 2 * dy;
          if (e >= 0) {
            y += sgny;
            e -= 2 * dx;
          }
        }
      }
    } else {
      if (sgny == -1) y++;
      if (!t) {
        for (let i = 0; i <= dx; i++) {
          let a = Math.floor(y);
          let b = y - a;
          if (sgny == -1) b = 1 - b;
          setImagePixel(image, x, a, currentColor[0], currentColor[1], currentColor[2], 1 - b);
          setImagePixel(image, x, a + sgny, currentColor[0], currentColor[1], currentColor[2], b);
          x += sgnx;
          y += k;
        }
      } else {
        for (let i = 0; i <= dx; i++) {
          let a = Math.floor(y);
          let b = y - a;
          if (sgny == -1) b = 1 - b;
          setImagePixel(image, a, x, currentColor[0], currentColor[1], currentColor[2], 1 - b);
          setImagePixel(image, a + sgny, x, currentColor[0], currentColor[1], currentColor[2], b);
          x += sgnx;
          y += k;
        }
      }
    }
  }

  function __drawCircle(x, y, r, image) {
    function drawCirclePoints(dx, dy, r = currentColor[0],
                                      g = currentColor[1],
                                      b = currentColor[2],
                                      a = currentColor[3] / 256) {
      setImagePixel(image, x + dx, y + dy, r, g, b, a); setImagePixel(image, x + dy, y + dx, r, g, b, a);
      setImagePixel(image, x - dx, y + dy, r, g, b, a); setImagePixel(image, x + dy, y - dx, r, g, b, a);
      setImagePixel(image, x + dx, y - dy, r, g, b, a); setImagePixel(image, x - dy, y + dx, r, g, b, a);
      setImagePixel(image, x - dx, y - dy, r, g, b, a); setImagePixel(image, x - dy, y - dx, r, g, b, a);
    }

    let dx = 0, dy = r, d = 10 - r * 8;
    if (!smoothLine) {
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
    } else {
      while (dx <= dy) {
        let y = Math.sqrt(r * r - dx * dx);
        let a = Math.floor(y);
        let b = y - a;
        drawCirclePoints(dx, a, currentColor[0], currentColor[1], currentColor[2], b);
        if (a) drawCirclePoints(dx, a - 1, currentColor[0], currentColor[1], currentColor[2], 1 - b);
        dx++;
        dy = y;
      }
    }
  }

  this.drawLine = (x1, y1, x2, y2) => {
    __drawLine(x1, y1, x2, y2, imageData);
    this.refresh();
  }

  this.drawLineOnCache = (x1, y1, x2, y2) => {
    let cache = ctx.getImageData(0, 0, width, height);
    __drawLine(x1, y1, x2, y2, cache);
    ctx.putImageData(cache, 0, 0);
  }

  this.drawCircle = (x, y, r) => {
    __drawCircle(x, y, r, imageData);
    this.refresh();
  }

  this.drawCircleOnCache = (x, y, r) => {
    let cache = ctx.getImageData(0, 0, width, height);
    __drawCircle(x, y, r, cache);
    ctx.putImageData(cache, 0, 0);
  }

  this.fill = (x, y) => {
    let color = getColor(imageData, x, y);
    let stack = [{ x:x, y:y }];
    if (color == colorToInt(currentColor)) return;
    while (stack.length) {
      let p = stack.pop();
      let xl = p.x, xr = p.x, y = p.y;
      setImagePixel(imageData, xl, y);
      while (getColor(imageData, xl - 1, y) == color)
        setImagePixel(imageData, --xl, y);
      while (getColor(imageData, xr + 1, y) == color)
        setImagePixel(imageData, ++xr, y);

      for (let t = 0; t < 2; t++) {
        y = !t ? p.y + 1 : p.y - 1;
        if (y < 0 || y >= height) continue;
        for (let x = xl; x <= xr; x++) {
          for (;x <= xr && getColor(imageData, x, y) != color; x++);
          if (x <= xr && getColor(imageData, x, y) == color)
            stack.push({ x:x, y:y });
          for (;x <= xr && getColor(imageData, x, y) == color; x++);
        }
      }
    }
    this.refresh();
  }
}