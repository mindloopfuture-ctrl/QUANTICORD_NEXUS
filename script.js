// QUANTICORD NEXUS — Quantum Activation Script
window.onload = () => {
  const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d');
  let w, h, particles;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      r: Math.random() * 2 + 1
    }));
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#38bdf8';
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();

  const btn = document.getElementById("activate");
  const status = document.getElementById("status");

  btn.onclick = async () => {
    const steps = [
      "Connecting to Quantum Grid …",
      "Synchronizing Ethical Core …",
      "Activating $QCN Resonance …",
      "Launching QUANTICORD Field …"
    ];
    for (const s of steps) {
      status.innerText = s;
      await new Promise(r => setTimeout(r, 800));
    }
    status.innerText = "NEXUS ONLINE — ETHICAL QUANTUM NETWORK ACTIVE ⚡️";
  };
};
