export default function WaterBackground() {
  const bubbles = [
    { left: '5%', size: 12, duration: 18, delay: 0 },
    { left: '12%', size: 8, duration: 22, delay: 3 },
    { left: '22%', size: 20, duration: 15, delay: 1 },
    { left: '30%', size: 6, duration: 25, delay: 5 },
    { left: '40%', size: 14, duration: 20, delay: 2 },
    { left: '50%', size: 10, duration: 17, delay: 0 },
    { left: '58%', size: 18, duration: 23, delay: 4 },
    { left: '68%', size: 7, duration: 19, delay: 6 },
    { left: '75%', size: 16, duration: 16, delay: 1 },
    { left: '85%', size: 9, duration: 21, delay: 3 },
    { left: '92%', size: 13, duration: 18, delay: 5 },
    { left: '97%', size: 5, duration: 24, delay: 0 },
  ];

  return (
    <div className="water-bg">
      <div className="water-glow" />
      <div className="water-shimmer" />
      {bubbles.map((b, i) => (
        <div
          key={i}
          className="water-bubble"
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
      <div className="water-wave" />
      <div className="water-wave-2" />
    </div>
  );
}
