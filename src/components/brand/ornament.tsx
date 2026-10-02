// Ornamen batik/mandala emas — dekoratif, dipakai di sudut hero.
function buildOrnament() {
  const R = [26, 44, 64, 88, 116, 150];
  const rings = R.map(
    (r, i) =>
      `<circle cx="0" cy="0" r="${r}" fill="none" stroke="#c99a3f" stroke-width="${
        i % 2 ? 0.6 : 1
      }" opacity="${0.18 + 0.05 * i}"/>`
  ).join("");

  let petals = "";
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const x = Math.cos(a);
    const y = Math.sin(a);
    petals += `<path d="M ${x * 40} ${y * 40} Q ${x * 78 - y * 22} ${
      y * 78 + x * 22
    } ${x * 96} ${y * 96} Q ${x * 78 + y * 22} ${y * 78 - x * 22} ${x * 40} ${
      y * 40
    } Z" fill="none" stroke="#c99a3f" stroke-width="1.1" opacity="0.5"/>`;
  }

  let inner = "";
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = Math.cos(a);
    const y = Math.sin(a);
    inner += `<path d="M0 0 Q ${x * 20 - y * 14} ${y * 20 + x * 14} ${x * 30} ${
      y * 30
    } Q ${x * 20 + y * 14} ${y * 20 - x * 14} 0 0 Z" fill="#c99a3f" opacity="0.32"/>`;
  }

  let dots = "";
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    dots += `<circle cx="${Math.cos(a) * 128}" cy="${
      Math.sin(a) * 128
    }" r="2.2" fill="#e7c778" opacity="0.55"/>`;
  }

  return `<g transform="translate(4,4)">${rings}${petals}${inner}${dots}<circle r="8" fill="#e7c778" opacity="0.7"/></g>`;
}

const MARKUP = buildOrnament();

export function Ornament({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      className={className}
      dangerouslySetInnerHTML={{ __html: MARKUP }}
    />
  );
}
