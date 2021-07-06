function random_hex_color_code() {
  let n = (Math.random() * 0xfffff * 1000000).toString(16);
  return '#' + n.slice(0, 6);
}

exports.random_hex_color_code = random_hex_color_code;
